import sys
import os
import traceback
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.parser import extract_text_from_pdf_bytes
from services.vectorstore import create_vector_store
from services.rag import generate_document_summary

pdf_path = r"c:\AiKnowledgeHub\server\uploads\6a4a6c556fd4b3b0a67c7ecb\1783262308616-986110172-harshibar_s_resume__1___2_.pdf"

print(f"Reading PDF from: {pdf_path}")
try:
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()
    print("PDF read successfully. Parsing...")
    
    parsed = extract_text_from_pdf_bytes(file_bytes)
    print("Parsed successfully!")
    print(f"Pages: {parsed['pages']}, Word count: {parsed['word_count']}")
    
    print("Creating vector store...")
    chunk_count, vector_dir = create_vector_store(parsed["text"], "test_user", "test_doc")
    print(f"Vector store created with {chunk_count} chunks in {vector_dir}")
    
    print("Generating summary...")
    summary = generate_document_summary(parsed["text"])
    print(f"Summary generated: {summary}")

except Exception as e:
    print("--- ERROR OCCURRED ---")
    traceback.print_exc()
    sys.exit(1)

print("Test complete successfully!")
