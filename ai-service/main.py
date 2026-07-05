import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import our custom services
from services.parser import extract_text_from_pdf_bytes
from services.vectorstore import create_vector_store, delete_vector_store
from services.rag import generate_document_summary, query_rag

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Knowledge Hub - AI Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    userId: str
    documentId: str
    question: str = ""
    mode: str = "ask"

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "groq_api_key_configured": os.getenv("GROQ_API_KEY") is not None and not os.getenv("GROQ_API_KEY").startswith("gsk_placeholder")
    }

@app.post("/process-document")
async def process_document(
    file: UploadFile = File(...),
    userId: str = Form(...),
    documentId: str = Form(...)
):
    """
    Processes the uploaded PDF: extracts text, generates summary, chunks text, 
    and builds the FAISS vector store.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported.")
        
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # 1. Parse text & get stats
        parsed = extract_text_from_pdf_bytes(file_bytes)
        
        # 2. Split & create local FAISS vector store
        chunk_count, vector_dir = create_vector_store(parsed["text"], userId, documentId)
        
        # 3. Generate summary using LLM
        summary = generate_document_summary(parsed["text"])
        
        return {
            "success": True,
            "message": "Document vectorized successfully",
            "pages": parsed["pages"],
            "wordCount": parsed["word_count"],
            "chunks": chunk_count,
            "summary": summary
        }
    except Exception as e:
        print(f"Error processing document {documentId}: {e}")
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")

@app.post("/chat")
def chat_with_document(req: ChatRequest):
    """
    Retrieves context and queries LLM based on user question and mode.
    """
    if not req.userId or not req.documentId:
        raise HTTPException(status_code=400, detail="userId and documentId are required.")
        
    try:
        result = query_rag(req.userId, req.documentId, req.question, req.mode)
        return {
            "success": True,
            "answer": result["answer"],
            "sourceChunks": result["source_chunks"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/document/{userId}/{documentId}")
def remove_document_index(userId: str, documentId: str):
    """
    Deletes the FAISS index from disk.
    """
    purged = delete_vector_store(userId, documentId)
    if purged:
        return {"success": True, "message": "Document vector index deleted successfully."}
    else:
        return {"success": True, "message": "No vector index found to delete."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
