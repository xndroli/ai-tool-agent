import ChatInterface from "@/components/chatInterface";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ChatPageProps {
    params: Promise<{
        chatId: Id<"chats">;
    }>;
};

async function ChatPage({ params }: ChatPageProps) {
    const { chatId } = await params; // Wait for the promise to resolve dynamic params
    const { userId } = await auth(); // Get user authentication from Clerk (server-side)
    // Check if user is authenticated
    if (!userId) {
        redirect("/"); // Redirect to home page if not authenticated
    };

    try {
        // Get Convex client then fetch chat and messages
        const convex = getConvexClient();
        // Get messages for the chat
        const initialMessages = await convex.query(api.messages.list, { chatId });

        // Render the chat page
        return (
            <div className="flex-1 overflow-hidden">
                <ChatInterface chatId={chatId} initialMessages={initialMessages} />
            </div>
        );
    } catch (error) {
        console.error("🔥 Error loading chat:", error);
        redirect("/dashboard");
    };
};

export default ChatPage;