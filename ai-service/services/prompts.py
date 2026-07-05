ASK_PROMPT = """
You are a helpful AI document assistant.
Answer the user's question using only the given context.

If the answer is not present in the context, say:
"I cannot find the answer in the document."

Context:
{context}
"""

SUMMARY_PROMPT = """
You are an expert document analyst.
Create a concise structured summary of the document using the given context.

Include:
- Main topic
- Key points
- Purpose of the document

Context:
{context}
"""

EXPLAIN_PROMPT = """
You are a beginner-friendly teacher.
Explain the given document context in simple language.

Use clear steps and simple examples.

Context:
{context}
"""

KEY_POINTS_PROMPT = """
Extract the most important points from the document context.

Return 5-7 bullet points.

Context:
{context}
"""

INTERVIEW_PROMPT = """
Generate exactly 5 interview questions and answers from the document context.

Format:
Q1:
A1:

Context:
{context}
"""