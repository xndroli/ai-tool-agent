import { Id } from "@/convex/_generated/dataModel";

// SSE constants
export const SSE_DATA_PREFIX = "data: " as const;
export const SSE_DONE_MESSAGE = "[DONE]" as const;
export const SSE_LINE_DELIMITER = "\n\n" as const;

export type MessageRole = "user" | "assistant";

export interface Message {
    role: MessageRole;
    content: string;
};

export interface ChatRequestBody {
    messages: Message[];
    newMessage: string;
    chatId: Id<"chats">;
};

// Strict string comparisons for message types
export enum StreamMessageType {
    Token = "token",
    Error = "error",
    Connected = "connected",
    Done = "done",
    ToolStart = "tool_start",
    ToolEnd = "tool_end",
};

// Base message interface
export interface BaseStreamMessage {
    type: StreamMessageType;
};

export interface TokenMessage extends BaseStreamMessage {
    type: StreamMessageType.Token;
    token: string;
};

export interface ErrorMessage extends BaseStreamMessage {
    type: StreamMessageType.Error;
    error: string;
};

export interface ConnectedMessage extends BaseStreamMessage {
    type: StreamMessageType.Connected;
};

export interface DoneMessage extends BaseStreamMessage {
    type: StreamMessageType.Done;
};

export interface ToolStartMessage extends BaseStreamMessage {
    type: StreamMessageType.ToolStart;
    tool: string; // Name of tool in use 
    input: unknown; // Input of tool in use
};

export interface ToolEndMessage extends BaseStreamMessage {
    type: StreamMessageType.ToolEnd;
    tool: string;
    output: unknown;
};

// Supported message types
export type StreamMessage = 
    | TokenMessage
    | ErrorMessage
    | ConnectedMessage
    | DoneMessage
    | ToolStartMessage
    | ToolEndMessage;