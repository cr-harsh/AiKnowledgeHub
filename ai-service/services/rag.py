import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough

from services.vectorstore import load_vector_store
from services.prompts import (
    ASK_PROMPT,
    SUMMARY_PROMPT,
    EXPLAIN_PROMPT,
    KEY_POINTS_PROMPT,
    INTERVIEW_PROMPT
)


def get_llm():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key or api_key.startswith("gsk_placeholder"):
        raise ValueError("GROQ_API_KEY is not configured.")

    return ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.3,
        groq_api_key=api_key
    )


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def get_prompt_by_mode(mode: str):
    prompts = {
        "ask": ASK_PROMPT,
        "summarize": SUMMARY_PROMPT,
        "explain": EXPLAIN_PROMPT,
        "key_points": KEY_POINTS_PROMPT,
        "interview_questions": INTERVIEW_PROMPT
    }

    return prompts.get(mode, ASK_PROMPT)


def get_query_by_mode(question: str, mode: str):
    if mode == "ask":
        return question

    mode_queries = {
        "summarize": "Summarize the main ideas of this document",
        "explain": "Explain the core concepts of this document",
        "key_points": "Extract important key points from this document",
        "interview_questions": "Generate interview questions from this document"
    }

    return mode_queries.get(mode, question)


def generate_document_summary(text: str) -> str:
    try:
        llm = get_llm()

        prompt = ChatPromptTemplate.from_template("""
        Generate a clear 2-3 sentence summary of this document.

        Document:
        {text}
        """)

        chain = prompt | llm | StrOutputParser()

        summary = chain.invoke({
            "text": text[:6000]
        })

        return summary.strip()

    except Exception as e:
        print(f"Error generating summary: {e}")
        return "Could not generate automated summary."


def query_rag(user_id: str, document_id: str, question: str, mode: str = "ask") -> dict:
    try:
        db = load_vector_store(user_id, document_id)

        retriever = db.as_retriever(search_kwargs={"k": 4})
        llm = get_llm()

        prompt_template = get_prompt_by_mode(mode)
        prompt = ChatPromptTemplate.from_messages([
            ("system", prompt_template),
            ("human", "{question}")
        ])

        query = get_query_by_mode(question, mode)

        rag_chain = (
            {
                "context": retriever | RunnableLambda(format_docs),
                "question": RunnablePassthrough()
            }
            | prompt
            | llm
            | StrOutputParser()
        )

        answer = rag_chain.invoke(query)

        retrieved_docs = retriever.invoke(query)
        source_chunks = [doc.page_content for doc in retrieved_docs]

        return {
            "answer": answer.strip(),
            "source_chunks": source_chunks
        }

    except Exception as e:
        print(f"Error in query_rag: {e}")
        return {
            "answer": f"Error running AI query: {str(e)}",
            "source_chunks": []
        }