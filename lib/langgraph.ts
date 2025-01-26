import { ChatAnthropic} from "@langchain/anthropic";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain"; // @wxflows/sdk@beta

// Custom Tool Creation Example
// // Customers at: https://introspection.apis.stepzen.com/customers
// // // wxflows import curl https://introspection.apis.stepzen.com/customers
// // Comments at: https://dummyjson.com/comments
// // // wxflows import curl https://dummyjson.com/comments

// Connect to wxflows (IBM watsonx.ai)
const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT || "",
    apikey: process.env.WXFLOWS_APIKEY, 
});

// Retrieve tools
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

// Prepare LLM model (claude anthropic)
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
    }).bindTools(tools); // Bind tools to LLM model

    return model;
};

const createWorkflow = () => {
    const model = initializeModel();

    
};