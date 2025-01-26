import { ChatAnthropic} from "@langchain/anthropic";



// LLM model (claude anthropic)
const initializeModel = () => {
    const model = new ChatAnthropic({
        modelName: "claude-3-5-sonnet-20241022",
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        temperature: 0.7, // Higher temperature for more creative responses
        maxTokens: 4096, // Higher max tokens for longer responses
        streaming: true, // Enable streaming for SSE (real-time updates)
        clientOptions: {
            defaultHeaders: {
                "anthropic-beta": "prompt-caching-2024-07-31",
            },
        },
        callbacks: [
            {
                handleLLMStart: async () => {
                    console.log("🤖 Starting LLM call");
                },
                handleLLMEnd: async (output) => {
                    console.log("🤖 End LLM call", output);
                    const usage = output.llmOutput?.usage;
                    if (usage) {
                      // console.log("📊 Token Usage:", {
                      //   input_tokens: usage.input_tokens,
                      //   output_tokens: usage.output_tokens,
                      //   total_tokens: usage.input_tokens + usage.output_tokens,
                      //   cache_creation_input_tokens:
                      //     usage.cache_creation_input_tokens || 0,
                      //   cache_read_input_tokens: usage.cache_read_input_tokens || 0,
                      // });
                    }
                },
                  // handleLLMNewToken: async (token: string) => {
                  //   // console.log("🔤 New token:", token);
                  // },
            },
        ],
    }).bindTools(tools);

    return model;
};