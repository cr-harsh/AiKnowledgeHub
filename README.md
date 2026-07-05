# AI Knowledge Hub

A full-stack, production-style SaaS application that lets users upload PDF documents and chat with them using Retrieval-Augmented Generation (RAG).

Built as a portfolio and interview-prep project — three separate services, real MongoDB persistence, and a modern dark-themed UI.

---

## Project Overview

**AI Knowledge Hub** is a personal AI-powered document assistant. Users register, upload PDFs, and interact with their documents through an intelligent chat interface powered by vector search and a large language model.

| Capability | Description |
|---|---|
| Authentication | JWT-based register/login with protected routes |
| Document Upload | PDF-only upload with async AI processing |
| RAG Chat | Ask questions, summarize, explain, get key points, generate interview Q&A |
| Chat History | Every conversation persisted in MongoDB |
| Dashboard | Search, list, delete documents with live processing status |

---

## Architecture

```
┌─────────────┐       REST        ┌─────────────┐       REST        ┌─────────────┐
│   React     │  ──────────────►  │   Express   │  ──────────────►  │   FastAPI   │
│   (Vite)    │   JWT Auth        │   (Node)    │   File + Chat     │   (Python)  │
│   :5173     │  ◄──────────────  │   :5000     │  ◄──────────────  │   :8000     │
└─────────────┘                   └──────┬──────┘                   └──────┬──────┘
                                         │                                  │
                                         ▼                                  ▼
                                   ┌──────────┐                    ┌──────────────┐
                                   │ MongoDB  │                    │ FAISS Vectors│
                                   │          │                    │ vectors/     │
                                   └──────────┘                    │ userId/docId │
                                                                   └──────────────┘
```

**Key rule:** The React frontend only talks to Express. Express talks to FastAPI. The frontend never calls the AI service directly.

---

## Folder Structure

```
AiKnowledgeHub/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Sidebar, DocumentCard, UploadZone, ProtectedRoute
│       ├── context/        # AuthContext, ToastContext
│       ├── pages/          # Login, Register, Dashboard, Chat, Profile
│       └── services/       # Axios API clients
│
├── server/                 # Express backend
│   ├── config/             # DB connection, Multer upload config
│   ├── controllers/        # auth, document, chat business logic
│   ├── middleware/         # JWT auth guard
│   ├── models/             # User, Document, Chat (Mongoose)
│   ├── routes/             # API route definitions
│   ├── services/           # FastAPI REST client (ai.service.js)
│   ├── utils/              # Standardized API responses
│   └── validation/         # Input validation
│
└── ai-service/             # FastAPI AI microservice
    ├── main.py             # API endpoints
    └── services/
        ├── parser.py       # PDF text extraction (PyPDF)
        ├── embedding.py    # Sentence Transformers embeddings
        ├── vectorstore.py  # FAISS index create/load/delete
        └── rag.py          # Groq LLM + RAG query pipeline
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, TailwindCSS, React Router, Axios |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Multer |
| AI Service | Python, FastAPI, LangChain, Groq, FAISS, Sentence Transformers, PyPDF |

---

## Installation

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB running locally (or Atlas URI)

### 1. Clone & install dependencies

```bash
# Backend
cd server
npm install
cp .env.example .env   # fill in values

# Frontend
cd ../client
npm install

# AI Service
cd ../ai-service
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env          # add GROQ_API_KEY
```

### 2. Environment Variables

**server/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-knowledge-hub
JWT_SECRET=your_super_secret_jwt_key
AI_SERVICE_URL=http://localhost:8000
```

**ai-service/.env**
```
PORT=8000
GROQ_API_KEY=gsk_your_groq_api_key
```

**client/.env** (optional)
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run all three services

```bash
# Terminal 1 — MongoDB (if local)
mongod

# Terminal 2 — Express backend
cd server && npm run dev

# Terminal 3 — FastAPI AI service
cd ai-service && python main.py

# Terminal 4 — React frontend
cd client && npm run dev
```

Open **http://localhost:5173**

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents` | List user documents (`?search=`) |
| GET | `/api/documents/:id` | Get single document |
| POST | `/api/documents/upload` | Upload PDF (multipart) |
| DELETE | `/api/documents/:id` | Delete document + vectors + chats |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chat/:documentId` | Get chat history |
| POST | `/api/chat/:documentId` | Send message `{ question, mode }` |
| DELETE | `/api/chat/:documentId` | Clear chat history |

**Chat modes:** `ask`, `summarize`, `explain`, `key_points`, `interview_questions`

### AI Service (internal — called by Express only)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/process-document` | Parse PDF, embed, build FAISS index |
| POST | `/chat` | RAG query |
| DELETE | `/document/{userId}/{documentId}` | Remove vector index |

---

## Request Flow Examples

### Document Upload
1. User drops PDF on Dashboard → `POST /api/documents/upload`
2. Express saves file to `uploads/{userId}/`, creates MongoDB record (`status: Uploading`)
3. Returns immediately; background job sets `Processing` and calls FastAPI
4. FastAPI extracts text → chunks → embeddings → FAISS index at `vectors/{userId}/{documentId}/`
5. FastAPI generates summary via Groq → Express updates MongoDB (`status: Ready`)
6. Dashboard polls every 4s until status changes

### RAG Chat
1. User asks question → `POST /api/chat/:documentId` with `{ question, mode: "ask" }`
2. Express verifies document belongs to user and is `Ready`
3. Express calls FastAPI `/chat` with userId, documentId, question, mode
4. FastAPI loads FAISS index → retrieves top-4 chunks → sends to Groq LLM
5. Response saved to `Chats` collection → returned to frontend with source chunks

---

## Future Improvements

- [ ] WebSocket for real-time processing status (replace polling)
- [ ] Redis queue for document processing (Bull/BullMQ)
- [ ] Cloud storage (S3) instead of local file uploads
- [ ] Pinecone/Weaviate instead of local FAISS
- [ ] Multi-document chat (cross-document RAG)
- [ ] OAuth (Google/GitHub login)
- [ ] Rate limiting and usage quotas
- [ ] Docker Compose for one-command startup
- [ ] Unit + integration tests (Jest, Pytest)

---

## License

MIT — built for learning and interview preparation.
