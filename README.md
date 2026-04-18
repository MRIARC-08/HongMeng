# 🔭 DevLens

**Understand any codebase, instantly.** 

DevLens is a sophisticated, AI-first code intelligence platform designed to transform how developers explore and understand complex GitHub repositories. By combining interactive dependency mapping with LLM-powered insights, DevLens turns abstract file trees into a living, breathing map of your architecture.

---

## ✨ Key Features

### 🕸️ Interactive Dependency Graph
- **Visual Intelligence**: See exactly how files connect across your entire project using a Reddlt-orange inspired, high-performance graph.
- **Dynamic Layout**: Smooth, auto-adjusting layouts powered by `dagre` ensure clarity even in massive codebases.
- **Relation Deep-Dives**: Click any dependency link (edge) to trigger an AI architectural analysis of that specific connection.

### 🤖 AI-Powered Forensics
- **File Explainers**: One-click "Explain this file" button uses Groq's high-speed inference to summarize logic, exports, and purpose.
- **Relationship Analysis**: Understand not just *that* a file imports another, but *why* it does and what impact it has on the folder's architecture.
- **Intelligent Chat**: A built-in AI assistant that knows your code. Ask about entry points, service layers, or specific implementation details.

### 📂 Pro Code Explorer
- **Context-Aware Sidebar**: Fast file tree navigation with integrated performance stats (import/export counts).
- **Embedded Source Viewer**: Read code with beautiful syntax highlighting without leaving the visualization.
- **Rich Metadata**: Instantly see file sizes, function counts, and component classifications.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router + Server Actions)
- **Visualization**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **AI/LLM**: [Groq SDK](https://groq.com/) (Llama-3 models)
- **Database**: [Prisma](https://www.prisma.io/) + [Neon (PostgreSQL)](https://neon.tech/)
- **Analysis**: Babel Parser + Custom Static Analysis Pipeline
- **Styling**: Tailwind CSS + Modern Vanilla CSS Variables
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏗️ How it Works

1. **Clone**: DevLens uses a serverless-friendly cloner to fetch the repository state via the GitHub API.
2. **Parse**: A custom pipeline powered by Babel traverses your source code to map imports, exports, functions, and React components.
3. **Graph**: Relationships are stored in a relational database and projected into a directed graph for visual exploration.
4. **Insight**: When asked, the system feeds relevant file chunks to an LLM to provide architectural context and reasoning.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL (or a Neon DB url)
- Groq API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MRIARC-08/HongMeng.git
   cd devlens
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your Environment Variables:
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="your_postgresql_url"
   GROQ_API_KEY="your_groq_api_key"
   ```

4. Initialize the Database:
   ```bash
   npx prisma db push
   ```

5. Run the Dev Server:
   ```bash
   npm run dev
   ```

Navigate to `http://localhost:3000` to start analyzing.

---

## 🎨 Design Philosophy

DevLens embraces a high-contrast, professional aesthetic. Using a palette of **Deep Charcoals** and **Reddit OrangeRed**, the UI is designed to minimize cognitive load while highlighting the most important data points in your source code.

---

## 📄 License

MIT © [MRIARC-08](https://github.com/MRIARC-08)
