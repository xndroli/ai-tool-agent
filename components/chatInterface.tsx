"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

interface ChatInterfaceProps {
    chatId: Id<"chats">;
    initialMessages: Doc<"messages">[];
};

function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div>ChatInterface for {chatId}</div>
    );
};

export default ChatInterface;