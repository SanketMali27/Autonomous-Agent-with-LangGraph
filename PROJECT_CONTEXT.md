# Autonomous Research & Analytics Agent - Project Context

This document describes the project as it exists in the current working tree. It is intended to be supplied to another AI agent as project context. It was prepared from source inspection on 2026-10-05.

## Instructions for an AI continuing work

- Treat the existing React/Vite frontend, FastAPI backend, LangGraph workflow, SQLAlchemy persistence, Qdrant retrieval, authentication, and provider integrations as established architecture. Extend them incrementally.
- Inspect `git status` before editing. The working tree already contains uncommitted changes; do not reset, clean, or overwrite them.
- Preserve API contracts unless a required feature cannot be implemented with the current API. The rename-session `PATCH` route is a recent addition.
- Do not read, quote, copy, or expose the contents of `server/.env` or `client/.env`. Only variable names are summarized here. Never put credentials in source, logs, generated documentation, or prompts.
- Do not assume Docker Compose currently starts a usable API; see the setup caveats below.
- When discussing model behavior, distinguish the application's OpenAI-compatible Bifrost endpoint from the separate Groq use in Guardrails.

## Product overview

This is a browser-based AI research/chat workspace. A signed-in user can upload PDFs, select which documents should be searched, ask questions, revisit named chat sessions, and receive answers through several LangGraph routes: document RAG, web search, Python execution, natural-language response, or app/document metadata.

The frontend is a single-page React application. The backend is a FastAPI application that owns authentication, document/session APIs, PDF ingestion, retrieval, the agent graph, and persistence. The backend remains authoritative for user access and business logic.

## Repository layout

```text
client/
  src/api/             Axios API wrappers for auth, chat, documents, sessions
  src/components/      Auth, sidebar, document, chat, approval, and UI components
  src/layouts/         Responsive dashboard shell
  src/pages/           Login, signup, chat; Documents page is currently empty
  src/router/          Browser routes and token-presence protected route
  src/store/           Zustand auth, document, session, and chat state
  src/types/           Shared TypeScript types (chat.ts is currently empty)
  package.json         Vite scripts and frontend dependencies

server/
  app/                 FastAPI app, config, Pydantic schemas, errors, LLM, guardrails
  auth/                Signup/login, password hashing, JWT validation/dependency
  database/            SQLAlchemy engine and User/Document/Session/Message models
  graph/               LangGraph state, builder, routing, supervisor, graph nodes
  memory/              Async PostgreSQL LangGraph checkpointer
  repositories/        Chat/session/message database operations
  retrieval/           PDF extraction/chunking, embeddings, Qdrant, vector search
  routers/             Session router; chat_router.py is currently empty
  services/            Chat/session logic, summaries, documents, prompt templates
  tools/               Tavily web search and isolated Python execution; placeholders too
  evaluation/          RAGAS stub and empty dataset
  uploads/             Local uploaded PDF files (runtime data)
  requirements.txt     Pinned Python dependencies
  main.py              Imports the FastAPI app, includes auth routes, creates tables
```

Other files include local databases/checkpoint artifacts, Bifrost data, test scripts, and an untracked `retry_test_server.py`. These are not all application source and should not be treated as portable production data.

## Frontend

### Stack and routing

- React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Router 7, Zustand 5, Axios, and Lucide icons.
- Markdown output uses `react-markdown`, `remark-gfm`, `rehype-highlight`, and `highlight.js`; the renderer is lazy-loaded.
- `src/main.tsx` mounts `App` in `StrictMode`; `AppRouter` has `/login`, `/signup`, and a protected dashboard at `/` containing the chat page.
- `ProtectedRoute` checks whether a token exists in the auth store. Dashboard startup separately fetches `/auth/me` and the current user's documents.
- `DashboardLayout` owns the responsive sidebar drawer and wires upload/delete, document selection, new chat, and logout actions.

### State ownership

- `authStore`: user, token, loading/error, login/signup/current-user/logout. The JWT is stored in `localStorage` under `token`.
- `documentStore`: documents, selected document IDs, upload/delete/fetch status. An empty `selectedDocumentIds` array means "All documents"; the same IDs shown in the UI are sent in the chat API request.
- `sessionStore`: session list, current session ID, title changes, ordering, and selection after deletion.
- `chatStore`: message arrays keyed by session ID, loaded-session markers, request/loading state, errors, and approval state. `Chat` fetches uncached message history and deduplicates in-flight history requests.
- API modules keep HTTP requests separate from components/stores. Components orchestrate UI and store actions.

### Main UI behavior

- The desktop sidebar contains recent sessions, PDF upload, document selection, and user/logout controls. On narrow screens it becomes a drawer.
- The chat page shows the active search scope above the composer. The composer is a growing textarea: Enter submits and Shift+Enter inserts a line break. A failed request restores the submitted text.
- Session rows support switching, inline rename (Enter saves, Escape cancels), and confirmed deletion. The session ID is switched immediately; cached messages display without an API request.
- The chat window supports conditional auto-scroll and a "Scroll to latest" action when the reader has moved upward.
- Assistant Markdown supports common block/inline syntax, GFM tables, code fences, syntax highlighting for common languages, code copy, and safe URL handling. Tables and long code lines can scroll horizontally.
- `getApiErrorMessage` converts Axios/server failures to UI messages and avoids displaying common raw traceback responses.

## Backend and data model

### Runtime composition

- FastAPI app is defined in `server/app/api.py`; `server/main.py` imports it, includes the `/auth` router, and calls `create_tables()`.
- FastAPI lifespan creates one async PostgreSQL checkpointer (`AsyncPostgresSaver`) and compiles the LangGraph once into `app.state.graph`. The same lifespan constructs the Guardrails service.
- SQLAlchemy uses `DATABASE_URL` through `create_engine`; LangGraph checkpointing uses an async PostgreSQL pool with that URL as well. `create_tables()` creates SQLAlchemy metadata tables; there are no Alembic migrations in the repository.
- CORS currently permits local Vite origins on port 5173 only.
- The API's common error handler returns an `{error: {code, message, details?}}` envelope. Unhandled exceptions are logged server-side and returned as a generic service error.

### Persistence

- `User`: string ID, unique email, username, password hash, creation time.
- `Document`: string document ID, user ID, display name, local file path, upload time. Document ownership is enforced by filtering on `user_id`.
- `ChatSession`: UUID session ID, owner, title, optional rolling summary, timestamps.
- `ChatMessage`: UUID message ID, session UUID, role (`user`, `assistant`, or `system`), text content, timestamp.
- Session messages and summaries are stored in SQL. LangGraph state/checkpoints are persisted in PostgreSQL via the checkpointer. PDFs are stored under `server/uploads`; vector chunks are stored in Qdrant.

### HTTP API

All routes except signup/login require a bearer JWT through `get_current_user`.

| Method and path | Purpose / request shape |
|---|---|
| `POST /auth/signup` | `{email, username, password}`; creates a user |
| `POST /auth/login` | `{email, password}`; returns access token and user |
| `GET /auth/me` | Returns current user |
| `POST /chat` | `{question, session_id?, thread_id?, document_ids?}`; returns answer, status, session ID, optional interrupt |
| `POST /approve` | `{thread_id, approved}`; resumes an interrupted graph |
| `GET /sessions` | Lists current user's sessions |
| `POST /sessions` | `{title}`; creates a session (the current UI generally creates a server session on first message instead) |
| `GET /sessions/{id}` | Returns that session's messages |
| `PATCH /sessions/{id}` | `{title}`; validates, trims, and persists a renamed title |
| `DELETE /sessions/{id}` | Deletes an owned session and its related messages |
| `POST /upload` | Multipart `file`; PDF only, max 25 MiB |
| `GET /documents` | Lists the current user's documents |
| `DELETE /documents/{id}` | Removes owned document metadata, file, and Qdrant points |

`ChatRequest` accepts a legacy `thread_id` and resolves it into `session_id` when needed. Question text is trimmed and must contain 1–4000 characters. For RAG, `document_ids` is optional; `null`/empty means no explicit document restriction, while a nonempty list filters retrieval to those documents.

## Chat and agent workflow

1. The browser sends a question, current session ID (or `null` for a new chat), and the selected document IDs (or `null` for all documents).
2. `/chat` runs input Guardrails, looks up or creates the user's session, updates a placeholder title from the first question, loads summary plus recent messages, and invokes the graph with `thread_id=session_id` and `user_id`.
3. The supervisor forces the `rag` route when document IDs are explicitly present. Otherwise a simple keyword router first recognizes current/news requests as web and calculation/data requests as Python. Remaining requests go to LLM route classification, with a `natural` fallback if classification fails.
4. Graph routes:
   - `rag`: retrieve up to five chunks. A grader decides whether to retry with a rewritten query or fall back to web; a critic checks support for the response.
   - `web`: query Tavily for up to five results and synthesize an answer.
   - `python`: ask the LLM for Python, validate its AST against blocked imports/calls, then run it in a Docker container with no network, read-only root, memory/CPU/PID limits, a 10-second timeout, and only the generated file mounted.
   - `natural`: answer with the conversation and identity-specific prompt.
   - `meta`: list the signed-in user's uploaded documents or state that there are none.
5. Completed chat answers pass output Guardrails, then user/assistant messages are saved. Summary refresh is attempted every ten messages and failures are logged without failing an otherwise successful response.

The graph also checks a Redis answer cache after routing. Cache keys include a version, question, route, user ID, and sorted selected document IDs; entries expire after `CACHE_TTL_SECONDS` (default 3600). Redis is configured by `REDIS_URL` (default `redis://localhost:6379/0`). Cache reads/writes are best-effort: Redis errors become cache misses or skipped writes so chat can continue without Redis.

The app has a `human_review_node` and approval UI/API, but the current graph builder does not connect an incoming edge to that node. See known issues before relying on approval flow.

## PDF ingestion and retrieval

- `DocumentIngestor` extracts text page-by-page with `pypdf`, flattens whitespace, makes 1,000-character chunks with 200-character overlap, embeds them, and writes Qdrant points.
- Payload includes text, user ID, document ID/name, page, chunk index, upload timestamp, and file type.
- Collection name is currently hard-coded in config as `history_docs`; distance is cosine.
- `EmbeddingModel` tries `BAAI/bge-small-en-v1.5` via Sentence Transformers and normalizes vectors. If model loading fails, it logs a warning and uses a deterministic hashed-token vector of dimension 384.
- Qdrant filters every search by user ID and conditionally by document IDs. Despite the class name `HybridSearcher`, current search implementation is vector-only; no sparse/BM25 branch is present.

## LLM, integrations, and environment

- `server/app/llm.py` currently creates a LangChain `ChatOpenAI` client for model `groq/openai/gpt-oss-120b`, with OpenAI-compatible base URL `http://localhost:8080/v1`, an API key read from `BIFROST_VIRTUAL_KEY`, and temperature 0.2. This is the app's Bifrost gateway path.
- NeMo Guardrails separately reads `GROQ_API_KEY`, maps it to `OPENAI_API_KEY`, and loads `server/app/guardrails/` config targeting Groq's OpenAI-compatible URL. It checks user input, assistant output, and retrieved text for prompt injection.
- Tavily is used by `tools/web_tool.py`.
- LangSmith decorators/metadata trace router/retrieval/tool work; Logfire instruments FastAPI, system metrics, HTTPX, Pydantic, and SQLAlchemy.
- Environment variable names found in local env files: `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `DATABASE_URL`, `QDRANT_URL`, `GROQ_API_KEY`, `BIFROST_VIRTUAL_KEY`, `TAVILY_API_KEY`, `LANGSMITH_API_KEY`, `LANGSMITH_TRACING`, `LANGSMITH_ENDPOINT`, `LANGSMITH_PROJECT`, and frontend `VITE_API_BASE_URL`. The cache also supports `REDIS_URL` and `CACHE_TTL_SECONDS`, both with code defaults. Values are intentionally not included here.

## Development commands and prerequisites

### Frontend

From `client/`:

```bash
npm install
npm run dev
npm run build
npm run lint
```

Vite defaults to port 5173. Set `VITE_API_BASE_URL` in the local client environment to the backend base URL.

### Backend

From `server/`, install `requirements.txt` into a virtual environment, set the server environment values, then run:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API also needs reachable PostgreSQL, Qdrant, and the Bifrost-compatible endpoint at port 8080; web search and Guardrails require their configured provider credentials. Redis is an optional performance cache and defaults to local port 6379; unavailable Redis should not stop chat. Startup constructs the document ingestor and its Qdrant collection client, so Qdrant configuration/connectivity matters before API startup.

### Docker caveat

`server/Dockerfile` currently ends with `CMD ["python", "main.py"]`, while `main.py` does not call `uvicorn.run`; running that container command imports the app and exits instead of serving HTTP. `docker-compose.yml` only builds/mounts the app; it does not declare ports, environment variables, PostgreSQL, Qdrant, or Bifrost services. The local Uvicorn command above is the code-consistent server entry point; Compose needs work before it is a complete deployment setup.

## Tests and unfinished areas

- The only conventional pytest test is `server/tests/test_chat_request.py`, which checks legacy `thread_id` to `session_id` mapping.
- `test_guardrails.py` and `test_retrieval_guardrail.py` are manual async scripts that call live Guardrails/provider configuration. `test.py` is an LLM smoke call. `test_graph.py` is a manual graph/checkpointer script, not a test suite.
- `server/evaluation/ragas.py` is a TODO and `dataset.json` has an empty `queries` list.
- Empty or placeholder modules/pages include `server/routers/chat_router.py`, `server/tools/rag_tool.py`, `server/tools/report_tool.py`, `server/services/qdrant_service.py`, `server/services/auth_service.py`, and `client/src/pages/Documents.tsx` / `client/src/types/chat.ts`. Their functionality, where it exists, is implemented elsewhere (for example chat routes are in `app/api.py`).

## Current caveats worth verifying before feature work

1. **Approval endpoint likely fails:** `/approve` in `app/api.py` calls `graph.invoke(...)`, but lifespan stores the compiled graph at `app.state.graph` and no module-level `graph` definition was found. It should use the app-state graph. Also, `human_review_node` has no incoming edge in `graph/builder.py`, so the current workflow appears unable to create that interrupt naturally.
2. **Approval message persistence:** `/chat` returns early when an interrupt occurs, before saving the user message. `/approve` saves the assistant answer but not the original question. Verify/fix if approval flow becomes active.
3. **Python route tool dependency:** execution requires Docker and availability of the `python:3.12-slim` image; failures are returned as assistant text. The AST denylist is a useful layer but should not be considered a complete security boundary on its own; container isolation is essential.
4. **Embedding fallback vs collection size:** Qdrant collection is created using whichever embedding dimension initializes first. If the Sentence Transformers model is unavailable, dimension is 384; verify that existing collection vectors and the active embedding mode agree.
5. **Rule-based routing is keyword-limited:** selected document IDs always force RAG; without explicit selection, exact prompt routing and the LLM classifier decide the route. The word "graph" can route to Python because it is included in the calculation keyword list.
6. **Session title auto-generation:** backend uses title equality with `New Chat` to decide whether to title a session from its first question. A manually renamed title equal to `New Chat` could therefore be treated as a placeholder later.
7. **Startup/configuration:** `main.py` creates database tables at import, and clients for Qdrant/LLM/Guardrails are initialized at import or app startup. Missing or unreachable infrastructure can prevent startup. There are no schema migrations.
8. **Frontend identity scope:** current auth is a bearer token in localStorage; avoid moving credentials into frontend source. The protected route checks token presence and the dashboard validates it with `/auth/me`.

## Existing working-tree changes

The repository was not clean during inspection. Modified paths included frontend package/UI/store/API files; `server/app/api.py`, `server/app/config.py`, `server/app/llm.py`, `server/app/schemas.py`, `server/memory/checkpoint.py`, `server/requirements.txt`, `server/routers/session_router.py`, `server/services/prompt_builder.py`, `server/graph/builder.py`, `server/graph/state.py`, and `server/bifrost-data/config.db`; untracked files included `server/retry_test_server.py`, `server/graph/nodes/cache.py`, `server/infrastructure/`, `server/services/cache_service.py`, and Bifrost SQLite WAL/SHM files. Treat these as intentional in-progress state until the owner reviews them. Do not discard them as cleanup.
