import { SSE_DATA_PREFIX, SSE_DONE_MESSAGE, StreamMessage, StreamMessageType } from "./types";

// Create a parser for Server-Sent Events (SSE) streams
// SSE allows real-time updates from the server to client
export const createSSEParser = () => {
    let buffer = "";

    const parse = (chunk: string): StreamMessage[] => {
        // Combine buffer with new chunk and split into lines
        const lines = (buffer + chunk).split("\n");
        // Save the last potentially incomplete line
        buffer = lines.pop() || "";

        return lines
            .map((line) => {
                // Remove leading and trailing whitespace
                const trimmed = line.trim();
                // If line does not start with SSE_DATA_PREFIX, return null (enforces handling of only SSE messages)
                if (!trimmed || !trimmed.startsWith(SSE_DATA_PREFIX)) return null;
                // Extract the data from the line
                const data = trimmed.substring(SSE_DATA_PREFIX.length);
                if (data === SSE_DONE_MESSAGE) return { type: StreamMessageType.Done };
                // Otherwise, Try to parse the data
                try {
                    const parsed = JSON.parse(data) as StreamMessage;
                    return Object.values(StreamMessageType).includes(parsed.type)
                        ? parsed
                        : null;
                } catch {
                    return {
                        type: StreamMessageType.Error,
                        error: "Failed to parse SSE message",
                    };
                }
            })
            .filter((msg): msg is StreamMessage => msg !== null);
    };

    return { parse };
};