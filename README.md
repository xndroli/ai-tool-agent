<div align="center">
    <br />

  <div>
    <img src="https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.JS" />
    <img src="https://img.shields.io/badge/langchain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </div>

  <br />
  <h3 align="center">Collaborative AI Agent - IBM watsonx.ai Flows</h3>
  <br />

</div>

## 📋 <a name="table">Table of Contents</a>

1. 🪟 [Overview](#overview)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🧮 [Advanced Features](#advanced-features)
4. 🤸 [Quick Start](#quick-start)
5. 🔗 [Links](#links)

## <a name="overview">🪟 Overview</a>

A sophisticated AI chat application built with Next.js, featuring real-time conversations, advanced prompt caching, and intelligent tool orchestration powered by LangChain and Claude 3.5 Sonnet.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **Frontend Framework**: Next.js 15.1.6
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Convex
- **AI Integration**: LangChain
- **Icons**: Lucide React & Radix UI Icons
- **Type Safety**: TypeScript

## <a name="features">🔋 Features</a>

- 🤖 Advanced AI chat interface with Claude 3.5 Sonnet
- 🎨 Modern and responsive UI with Tailwind CSS
- 🔐 Authentication with Clerk
- 💾 Real-time data storage with Convex
- ⚡ Built with Next.js 15 and React 19
- 🌊 Advanced streaming responses with custom implementation
- 📱 Mobile-friendly design
- 🧠 Prompt caching for optimized token usage
- 🔧 Intelligent tool orchestration with LangGraph
- 🔄 Real-time updates and tool execution feedback
- 📚 Integration with various data sources via wxflows

## <a name="advanced-features">🧮 Advanced Features</a>

### 🤖 AI and Prompt Management

- **Prompt Caching**: Optimized token usage with Anthropic's caching feature
- **Context Window**: Efficient 4096 token context management
- **Tool-Augmented Responses**: Enhanced AI capabilities with custom tools
- **Context-Aware Conversations**: Intelligent conversation management

### 📚 Tool Integration

- **wxflows Integration**:
  - Quick integration of various data sources
  - Support for YouTube transcripts
  - Google Books API integration
  - Custom data source tooling

### 🔧 LangChain & LangGraph Features

- **State Management**: Sophisticated state handling with StateGraph
- **Tool Orchestration**: Advanced tool management with ToolNode
- **Memory Management**: Efficient context tracking with MemorySaver
- **Message Optimization**: Intelligent message trimming and context management

### 🌊 Streaming Implementation

- **Custom Streaming Solution**:
  - Real-time token streaming
  - Tool execution feedback
  - Error handling for failed tool calls
  - Workarounds for LangChainAdapter limitations

### 🔄 Real-time Features

- **Live Updates**: Instant message delivery and updates
- **Tool Visualization**: Real-time tool interaction display
- **History Management**: Efficient message history tracking

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

## Prerequisites

- Node.js (Latest LTS version recommended)
- PNPM package manager or NPM/Yarn
- Clerk account for authentication
- Convex account for database
- OpenAI/Anthropic API key for AI capabilities

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ibm-ai-agent.git
cd ibm-ai-agent
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Performance Optimizations

- Implemented prompt caching
- Optimized token usage
- Efficient streaming implementation
- Smart context window management

## <a name="links">🔗 Links</a>

Here is the list of all the resources used in the project:

- [Node.JS](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Next.JS](https://nextjs.org/)
- [Lucide React](https://lucide.dev/)
- [Radix](https://www.radix-ui.com/icons)
- [shadcn/ui](https://ui.shadcn.com/)
- [Clerk ](https://https://clerk.com/)
- [IBM's watsonx.ai Flows Engine](https://wxflows.ibm.stepzen.com/)
- [LangChain](https://www.langchain.com/)
- [Convex](https://www.convex.dev/)
- [Anthropic](https://console.anthropic.com/dashboard)
- [Vercel](https://vercel.com/)