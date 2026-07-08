# VectorMind

> An open-source, NotebookLM-style app: upload documents, web pages, or text and have grounded, streaming conversations with them using Retrieval-Augmented Generation (RAG).

**Live demo:** _To be deployed soon_ 

**Stack:** React · TypeScript · Node · Express · MongoDB · Qdrant · Gemini

<!-- Will add a screenshot or short GIF here -->
<!-- ![VectorMind screenshot](docs/screenshot.png) -->

---

## What it does

Sign up, then add a source — a **PDF, DOCX, CSV, or TXT** file, pasted **text**, or a **URL**. VectorMind parses it, splits it into overlapping chunks, embeds them into a vector database, and auto-generates a title and summary. You can then **chat with that source**: your question is embedded, the most relevant chunks are retrieved, and the model answers **only** from that content — streamed back token by token.

## Features

- 📄 **Six source types** — PDF, DOCX, CSV, TXT, raw text, and URLs, behind one type-safe pipeline
- 🔎 **Grounded RAG** — answers are constrained to the retrieved chunks, with conversation memory for follow-ups
- ⚡ **Streaming responses** — token-by-token over Server-Sent Events, with proper markdown & code rendering
- 🔐 **Secure auth** — hashed passwords, httpOnly-cookie JWT sessions that work in dev and across origins in production
- 🧾 **Background ingestion** — non-blocking processing with live status polling and clean failure handling
- 🛡️ **Abuse protection** — per-IP rate limiting and a per-user daily AI quota (production only)

## Tech stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Zustand, React Router |
| **Backend** | Node.js 24, TypeScript, Express 5, Zod, pino, jose |
| **Data** | MongoDB (Mongoose), Qdrant (vector DB) |
| **AI** | Gemini via the OpenAI SDK — `gemini-embedding-001` (768-dim) + `gemini-3.1/2.5-flash-lite` |
| **Testing** | Vitest, Supertest, mongodb-memory-server |
| **Infra** | Docker Compose, Vercel, Render, MongoDB Atlas, Qdrant Cloud |

## Project structure

```
notebooklm-ai/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # ui primitives, panels, markdown renderer
│       ├── hooks/          # useAuth, useSources, useChat (server logic)
│       ├── stores/         # Zustand (theme, auth)
│       ├── lib/            # typed axios client, SSE reader, types
│       └── pages/          # AuthPage, HomePage (3-pane workspace)
└── server/                 # Node + Express API
    └── src/
        ├── config/         # zod-validated env, constants
        ├── models/         # User, Source, Message, UsageLog
        ├── modules/        # auth, sources, chat (routes+controller+service)
        ├── lib/            # llm (Gemini), vector (Qdrant), loaders, chunking
        ├── middleware/     # auth, validation, rate-limit, AI-quota, errors
        └── utils/          # ApiError, ApiResponse, logger, jwt
```

## Getting started

### Prerequisites
- Node.js 24+
- A [Gemini API key](https://aistudio.google.com), a [MongoDB Atlas](https://mongodb.com/cloud/atlas) cluster, and a [Qdrant Cloud](https://cloud.qdrant.io) cluster (all have free tiers)

### 1. Backend

```bash
cd server
cp .env.example .env      # then fill in your keys
npm install
npm run dev               # http://localhost:8080
```

### 2. Frontend

```bash
cd client
cp .env.example .env      # VITE_API_URL=http://localhost:8080/api/v1
npm install
npm run dev               # http://localhost:5173
```
