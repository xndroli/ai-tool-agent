import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { submitQuestion } from "@/lib/langgraph";
import { ChatRequestBody, SSE_DATA_PREFIX, SSE_LINE_DELIMITER, StreamMessage, StreamMessageType } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

function sendSSEMessage(
    writer: WritableStreamDefaultWriter<Uint8Array>,
    data: StreamMessage
) {
    const encoder = new TextEncoder();
    return writer.write(
        encoder.encode(
            `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}` // Add SSE line delimiter to message for determining what to do with it
        )
    );
};

export async function POST(req: Request) {
    try {
        // Check if user is authenticated
        const { userId } = await auth();
        if (!userId) {
            return new Response("Unauthenticated", { status: 401 });
        };

        // Extract chat request body from request
        const { messages, newMessage, chatId } = (await req.json()) as ChatRequestBody;
        // Get Convex client
        const convex = getConvexClient();

        // --- Begin streaming response request ---
        // Create stream with larger queue strategy for better performance
        const stream = new TransformStream({}, { highWaterMark: 1024 }); // Allow for a larger queue size
        const writer = stream.writable.getWriter();

        const response = new Response(stream.readable, {
            headers: {
                "Content-Type": "text/event-stream",
                // "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no", // Disable buffering in Nginx (required for SSE to work properly)
            },
        });

        const StartStream = async () => {
            try {
                // Stream

                // Send initial connection established message to client (frontend)
                await sendSSEMessage(writer, { type: StreamMessageType.Connected });

                // Send user message to Convex (saves user sent message to db)
                await convex.mutation(api.messages.send, { 
                    chatId, 
                    content: newMessage,
                });

                // Convert messages to LangChain format
                const langChainMessages = [
                    ...messages.map((msg) =>
                        msg.role === "user"
                            ? new HumanMessage(msg.content)
                            : new AIMessage(msg.content)
                    ),
                    new HumanMessage(newMessage),
                ];

                try {
                    // Create the event stream
                    const eventStream = await submitQuestion(langChainMessages, chatId);

                    // Process the events
                    for await (const event of eventStream) {
                        // console.log("🔄 Event:", event);

                        if (event.event === "on_chat_model_stream") {
                            const token = event.data.chunk;
                            if (token) {
                                // Access the text property from the AIMessageChunk
                                const text = token.content.at(0)?.["text"];

                                if (text) {
                                    await sendSSEMessage(writer, {
                                        type: StreamMessageType.Token,
                                        token: text,
                                    });
                                }
                            }
                        } else if (event.event === "on_tool_start") {
                            await sendSSEMessage(writer, {
                                type: StreamMessageType.ToolStart,
                                tool: event.name || "unknown",
                                input: event.data.input,
                            });
                        } else if (event.event === "on_tool_end") {
                            const toolMessage = new ToolMessage(event.data.output);

                            await sendSSEMessage(writer, {
                                type: StreamMessageType.ToolEnd,
                                tool: toolMessage.lc_kwargs.name || "unknown",
                                output: event.data.output,
                            });
                        };
                    };
                    // Send completion message without storing the response
                    await sendSSEMessage(writer, { type: StreamMessageType.Done });

                } catch (streamError) {
                    console.error("🔥 Error in event stream:", streamError);
                    await sendSSEMessage(writer, {
                        type: StreamMessageType.Error,
                        error:
                            streamError instanceof Error
                            ? streamError.message
                            : "Stream processing failed",
                    });
                }
            } catch (error) {
                console.error("🔥 Error in stream:", error);
                await sendSSEMessage(writer, {
                    type: StreamMessageType.Error,
                    error:
                        error instanceof Error ? error.message : "Stream failed",
                });
            } finally {
                try {
                    await writer.close();
                } catch (closeError) {
                    console.error("🔥 Error closing writer:", closeError);
                }
            }
        };

        StartStream();

        return response;
    } catch (error) {
        console.error("🔥 Error in chat API:", error);
        return NextResponse.json(
            { error: "Failed to process chat request" } as const,
            { status: 500 }
        );
    }
};