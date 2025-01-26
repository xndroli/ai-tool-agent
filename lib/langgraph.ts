import { ChatAnthropic} from "@langchain/anthropic";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain"; // @wxflows/sdk@beta
import {
    END,
    MessagesAnnotation,
    START,
    StateGraph,
} from "@langchain/langgraph"
import { SystemMessage } from "@langchain/core/messages";
import { 
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";

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
const toolNode = new ToolNode(tools); // Ability to use tools

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

// Takes all previous messages into context, and uses them to accurately answer the question
const createWorkflow = () => {
    const model = initializeModel();

    // Graph of flow for LLM model (decisions, states, etc.)
    const stateGraph = new StateGraph(MessagesAnnotation) // How messages are structured in chat template (graph)
        .addNode(
            "agent", 
            async (state) => {
                // Create the system message content
                const systemContent = SYSTEM_MESSAGE;

                // Create the chat prompt template with system message and messages placeholder
                const promptTemplate = ChatPromptTemplate.fromMessages([
                    new SystemMessage(systemContent, {
                        cache_control: { type: "ephemeral" }, // Set a cache breakpoint (max number of breakpoints is 4 for anthropic)
                    }),
                    new MessagesPlaceholder("messages"), // 
                ]);
            },
        );
};