"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { ChatRequestBody, StreamMessageType } from "@/lib/types";
import { createSSEParser } from "@/lib/createSSEParser";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import MessageBubble from "./messageBubble";
import WelcomeMessage from "./welcomeMessage";

interface ChatInterfaceProps {
    chatId: Id<"chats">;
    initialMessages: Doc<"messages">[];
};

function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamedResponse, setStreamedResponse] = useState("");
    const [currentTool, setCurrentTool] = useState<{
        name: string;
        input: unknown;
    } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatToolOutput = (output: unknown): string => {
        if (typeof output === "string") return output;
        return JSON.stringify(output, null, 2);
    };

    const formatTerminalOutput = (
        tool: string,
        input: unknown,
        output: unknown
    ) => {
        // TODO: refactor and make this a component
        const terminalHtml = `
            <div class="bg-[#1e1e1e] text-white font-mono p-2 rounded-md my-2 overflow-x-auto whitespace-normal max-w-[600px]">
                <div class="flex items-center gap-1.5 border-b border-gray-700 pb-1">
                    <span class="text-red-500">●</span>
                    <span class="text-yellow-500">●</span>
                    <span class="text-green-500">●</span>
                    <span class="text-gray-400 ml-1 text-sm">~/${tool}</span>
                </div>
                <div class="text-gray-400 mt-1">$ Input</div>
                <pre class="text-yellow-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(input)}</pre>
                <div class="text-gray-400 mt-2">$ Output</div>
                <pre class="text-green-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(output)}</pre>
            </div>
        `;

        return `---START---\n${terminalHtml}\n---END---`;
    };

    const processStream = async (
        reader: ReadableStreamDefaultReader<Uint8Array>,
        onChunk: (chunk: string) => Promise<void>
    ) => {
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                await onChunk(new TextDecoder().decode(value));
            }
        } finally {
            reader.releaseLock();
        }
    };

    // As messages stream in (change), scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamedResponse]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        // Reset UI state for new message
        setInput("");
        setStreamedResponse("");
        setCurrentTool(null);
        setIsLoading(true); // TODO: could use alternative hook (useTransition)

        // Add user's message immediately for better UX (optimistic UI update)
        const optimisticUserMessage: Doc<"messages"> = {
            _id: `temp_${Date.now()}`,
            chatId,
            content: trimmedInput,
            role: "user",
            createdAt: Date.now(),
        } as Doc<"messages">;

        // Show user's message on UI immediately
        setMessages((prevMessages) => [...prevMessages, optimisticUserMessage]);

        // Track complete response for saving to db
        let completeResponse = "";

        // Begin streaming response request
        try {
            const requestBody: ChatRequestBody = {
                messages: messages.map((message) => ({
                    role: message.role,
                    content: message.content,
                })),
                newMessage: trimmedInput,
                chatId,
            };

            // Initialize SSE connection (POST request for streaming response)
            const response = await fetch("/api/chat/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error(await response.text());
            if (!response.body) throw new Error("No response body found");

            // --- Handle the SSE stream ---
            // Create SSE parse and stream reader
            const parser = createSSEParser(); // Every time we get a new chunk of data, it will extract the data
            const reader = response.body.getReader();

            // Process the SSE stream chunks
            await processStream(reader, async (chunk) => {
                // Parse SSE messages from the chunk
                const messages = parser.parse(chunk); // returns list of streamed messages

                // Handle each message based on it's type
                for (const message of messages) {
                    // Check for different types of messages
                    switch (message.type) {
                        case StreamMessageType.Token:
                            // Handle streaming tokens a.k.a chunks (normal text response)
                            if ("token" in message) {
                                completeResponse += message.token;
                                setStreamedResponse(completeResponse);
                            };
                            break;

                        case StreamMessageType.ToolStart:
                            // Handle start of tool execution (e.g. API calls, file operations)
                            if ("tool" in message) {
                                setCurrentTool({
                                    name: message.tool,
                                    input: message.input,
                                });
                                completeResponse += formatTerminalOutput(
                                    message.tool,
                                    message.input,
                                    "Processing..."
                                );
                                setStreamedResponse(completeResponse);
                            };
                            break;

                        case StreamMessageType.ToolEnd:
                            // Handle completion of tool execution (e.g. API calls, file operations)
                            if ("tool" in message && currentTool) {
                                // Replace the "Processing..." message with the tool's output
                                // TODO: could fix this loose check
                                const lastTerminalIndex = completeResponse.lastIndexOf(
                                    '<div class="bg-[#1e1e1e]'
                                );
                                if (lastTerminalIndex !== -1) {
                                    completeResponse = completeResponse.substring(0, lastTerminalIndex) + formatTerminalOutput(
                                        message.tool,
                                        currentTool.input,
                                        message.output
                                    );
                                    setStreamedResponse(completeResponse);
                                }
                                setCurrentTool(null);
                            };
                            break;

                        case StreamMessageType.Error:
                            // Handle error messages
                            if ("error" in message) {
                                throw new Error(message.error);
                            };
                            break;

                        case StreamMessageType.Done:
                            // Handle completion of complete (entire) response
                            const assistantMessage: Doc<"messages"> = {
                                _id: `temp_assistant_${Date.now()}`,
                                chatId,
                                content: completeResponse,
                                role: "assistant",
                                createdAt: Date.now(), // TODO: local to pc, create on schema side
                            } as Doc<"messages">;

                            // Save the complete message to the database
                            const convex = getConvexClient();
                            await convex.mutation(api.messages.store, {
                                chatId,
                                content: completeResponse,
                                role: "assistant",
                            });
                            
                            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
                            setStreamedResponse("");
                            return;
                    }
                };
            });
            // ---
        } catch (error) {
            // Handle any errors during streaming
            console.error("Error sending message:", error);
            // Remove the optimistic user message if there was an error
            setMessages((prev) =>
                prev.filter((msg) => msg._id !== optimisticUserMessage._id)
            );
            setStreamedResponse(
                formatTerminalOutput(
                    "error",
                    "Failed to process message",
                    error instanceof Error ? error.message : "Unknown error"
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
            {/* Messages */}
            <section className="flex-1 overflow-y-auto bg-gray-50 p-2 md:p-0">
                <div className="max-w-4xl mx-auto p-4 space-y-3">
                    {messages?.length === 0 && <WelcomeMessage />}

                    {/* Messages */}
                    {messages?.map((message: Doc<"messages">) => (
                        <MessageBubble
                            key={message._id}
                            content={message.content}
                            isUser={message.role === "user"}
                        />
                    ))}

                    {streamedResponse && <MessageBubble content={streamedResponse} />}

                    {/* Loading indicator */}
                    {isLoading && !streamedResponse && (
                        <div className="flex justify-start animate-in fade-in-0">
                            <div className="rounded-2xl px-4 py-3 bg-white text-gray-900 rounded-bl-none shadow-sm ring-1 ring-inset ring-gray-200">
                                <div className="flex items-center gap-1.5">
                                    {[0.3, 0.15, 0].map((delay, i) => (
                                        <div
                                            key={i}
                                            className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                                            style={{ animationDelay: `-${delay}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Last Message */}
                    <div ref={messagesEndRef} className="p-4" />
                </div>
            </section>

            {/* Footer Input Form */}
            <footer className="border-t bg-white p-4">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message AI Agent..."
                            className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-gray-50 placeholder:text-gray-500"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 flex items-center justify-center transition-all ${
                                input.trim()
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                : "bg-gray-100 text-gray-400"
                            }`}
                        >
                            <ArrowRight />
                        </Button>
                    </div>
                </form>
            </footer>
        </main>
    );
};

export default ChatInterface;