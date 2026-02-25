from google import genai
from dotenv import load_dotenv

load_dotenv()

# 1. Set up your API Key (Get this from Google AI Studio)
# It's best practice to use environment variables, but you can paste it directly for a quick test.
client = genai.Client()

# 2. Define the Model
model = "gemini-3-flash-preview"

# 3. Define your Inputs (Hardcode these just for testing)
system_prompt = """
You are an expert Executive Resume Writer and Technical Career Coach. 
I will provide you with two things:
1. My "Master Resume" data (JSON or plain text).
2. A "Job Description" for a role I am applying for.

Your task is to rewrite the "Experience" and "Projects" sections of my resume to perfectly align with the Job Description. 

Strict Rules you MUST follow:
- DO NOT invent or fabricate any skills, metrics, or experiences I do not have.
- Transform passive "doer" language (e.g., "Responsible for building", "Maintained") into active "achiever" language (e.g., "Architected", "Optimized", "Spearheaded").
- Highlight the specific tools and languages from my master resume that match the job description's required skills.
- Structure every bullet point using the format: [Strong Action Verb] + [What I did] + [Technology Used] + [Result/Impact].
- Keep the output concise, professional, and formatted in clean Markdown.
"""

master_resume = """
Experience: Veracitiz Solutions Pvt. Ltd Intern (July 2025-Aug 2025)
- Engineered a full-stack Al solution using Python and RAG architecture to process uploaded PDFs and generate context-aware assessment questions.
- Implemented vector embeddings and transformers to optimize information retrieval, connecting to the Gemini API for relevant outputs.
"""

job_description = """
Job Title: Python Backend Intern
Requirements: Looking for a developer with strong Python skills, experience working with LLMs, and an understanding of data pipelines and APIs. Must be focused on reducing latency and improving data processing efficiency.
"""

# 4. Combine and Generate
combined_prompt = f"{system_prompt}\n\nMaster Resume:\n{master_resume}\n\nJob Description:\n{job_description}"

print("Thinking...\n")
response = client.models.generate_content(
    model=model,
    contents=combined_prompt
)

print("--- TAILORED RESUME OUTPUT ---")
print(response.text)