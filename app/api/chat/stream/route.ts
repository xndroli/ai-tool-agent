import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { ChatRequestBody, SSE_DATA_PREFIX, SSE_LINE_DELIMITER, StreamMessage, StreamMessageType } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
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
        // Create stream with larger queue stratgey for better performance
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


            } catch (error) {
                console.error("🔥 Error in chat API:", error);
                return NextResponse.json(
                    { error: "Failed to process chat request" } as const,
                    { status: 500 }
                );
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