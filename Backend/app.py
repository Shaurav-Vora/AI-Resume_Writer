from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import io
import typing # NEW: Import typing for the schema
from dotenv import load_dotenv
from docxtpl import DocxTemplate
from pydantic import BaseModel, Field

load_dotenv()

app = Flask(__name__)
CORS(app)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# NEW: Define the exact blueprint Gemini MUST follow
class ResumeOutput(BaseModel):
    tech_skills: str = Field(description="Comma-separated list of the top 7 technical keywords from the Job Description relevant to the user's skills.")
    soft_skills: str = Field(description="Comma-separated list of the top 7 soft skills from the Job Description relevant to the user.")
    certs: str = Field(description="Comma-separated list of up to 4 relevant certifications from the Master Resume.")
    resume_objective: str = Field(description="A concise, 1-2 sentence Resume Objective tailored to the Job Description, including the UK Design patent if relevant.")
    project_title_1: str = Field(description="Name of the best matching project.")
    project_description_1: str = Field(description="A 40-50 word description of the project using unique action verbs and quantified impact.")
    project_title_2: str = Field(description="Name of the 2nd best matching project.")
    project_description_2: str = Field(description="A 40-50 word description of the project using unique action verbs and quantified impact.")
    project_title_3: str = Field(description="Name of the 3rd best matching project.")
    project_description_3: str = Field(description="A 40-50 word description of the project using unique action verbs and quantified impact.")
    work_title_1: str = Field(description="Title of the work experience.")
    work_company_1: str = Field(description="Company name of the work experience.")
    work_exp_1: str = Field(description="Rewritten description of work experience enforcing unique action verbs and quantified impact.")
    achievements: str = Field(description="A SINGLE continuous string formatted with bullet points (\n• ) containing 2-3 key achievements. DO NOT output a JSON array.")

model = genai.GenerativeModel(
    'gemini-2.5-flash',
    generation_config={
        "response_mime_type": "application/json",
        "response_schema": ResumeOutput
    }
)

MASTER_RESUME = """
[Technical Skills]
Programming Languages: Python, Java, JavaScript, SQL, C, C++
Frameworks & Libraries: Spring Boot, TensorFlow, OpenCV, Flask, Android Studio, React, BeautifulSoup, Selenium
Tools & Technologies: Apache Kafka, REST APIs, JWT, Firebase, Google Gemini API, Git

[Soft Skills]
Problem Solving, Communication, Teamwork, Adaptability, Time Management, Leadership, Creativity, Critical Thinking, Attention to Detail, Collaboration, Empathy, Resilience, Conflict Resolution, Decision Making, Interpersonal Skills, Work Ethic, Emotional Intelligence, Project Management, Self-Motivation, Active Listening.

[Certifications]
Generative AI with AWS, Microsoft Excel, Fundamentals of Java

[Achievements]
- Awarded UK Design Patent (No. 6482196) for an "Autonomous Robot for Sustainable Desert Restoration" validating innovation in robotics and sustainable engineering.
- Awarded merit scholarship by Manipal University for the degree of BTech in Computer Science and Engineering.
- Received dean’s list award for all semesters at USIU-Africa.

[Experience]
Company - Veracitiz Solutions Pvt. Ltd
Role - AI Intern (July 2025 - August 2025)
Tasks - Engineered a full-stack AI solution using Python and RAG architecture to process 100+ uploaded PDFs daily, generating context-aware assessment questions. Implemented vector embeddings and transformers to optimize information retrieval by 40%, connecting to the Gemini API to reduce manual query time by 2.5 hours per day.

[Projects Pool]
1. JPMorgan Chase & Co. Software Engineering Simulation: Engineered a real-time banking backend using Spring Boot to process high-volume financial transactions daily with Apache Kafka to decouple transaction ingestion from database persistence, ensuring 99% data integrity via Spring Data JPA. 
2. Recipe AI: Built a Java-based Android app integrating Google Gemini API to generate personalized recipes. Reduced user meal-planning time by 30% by implementing a user-friendly interface for inputting preferences, dietary restrictions, and available ingredients.
3. Banana leaf disease classifier: Trained a Python Machine Learning model achieving 90% classification accuracy using a dataset of 5,000+ images. Leveraged OpenCV for image processing and TensorFlow for model training using Flask, enabling real-time disease detection for local farmers.
4. Sustain Dubai: Developed a gamified sustainability prototype mobile app for Dubai residents using Java and Android Studio. Designed challenges allowing users to earn points, increasing projected eco-friendly habit retention by 25%.
5. Course search automation: Created a Python script automating university course searches, utilizing web scraping (BeautifulSoup, Selenium) to extract and structure data, saving 5+ hours of manual browsing per semester.
6. Chat application: Architected a real-time chat app using Spring Boot (backend) and Java Swing (frontend). Implemented WebSocket communication for <50ms latency messaging and integrated JWT for secure access for 50+ concurrent mock users.
"""

# UPDATED: We removed the giant JSON block at the bottom since the schema handles it!
SYSTEM_PROMPT = """
You are an expert Technical Recruiter and Resume Writer. 
I will provide my "Master Resume" (which includes a pool of projects) and a "Job Description".

Task 1: Read the Job Description and select the THREE projects from my 'Projects Pool' that most closely match the required skills. 
Task 2: Rewrite the description for the THREE chosen projects to perfectly align with the JD keywords. Ensure the action words do not sound robotic and that the descriptions are concise (40-50 words) while quantifying the impact of my work using realistic metrics which you can either find in the project details or estimate.
Task 3: Rewrite my work experience to align with the JD keywords and again, ensure the action words do not sound robotic or repetitive.

CRITICAL RULES FOR BEATING ATS (STRICT COMPLIANCE REQUIRED):
- Less REPETITION: You MUST use a unique, strong action verb to start every single bullet point across the entire resume. Do not repeat verbs like "Developed", "Engineered", or "Created". Use additional diverse vocabulary (e.g., Architected, Synthesized, Optimized, Formulated, etc.).
- KEYWORD MIRRORING: Seamlessly embed exact phrases and keywords from the Job Description into the project and work experience descriptions without sounding robotic.
- REALISTIC METRIC ESTIMATION: ATS systems require numbers. If my Master Resume describes an accomplishment without specific numbers, you MUST estimate a highly realistic, conservative metric based on standard industry benchmarks for the technologies used (e.g., "accelerated processing by ~20%", "managed dataset of 10,000+ records", "optimized latency by 15%"). Do NOT invent entirely new features or skills, but DO quantify the existing achievements realistically.
- Structure every project and experience description using the format: [Unique Action Verb] + [What I did] + [Technology Used] + [Quantifiable Result/Impact].
- Do not apply * (asterisk) for bolding or any other formatting in the output.
"""

@app.route('/api/generate', methods=['POST'])
def generate_resume():
    data = request.json
    job_title = data.get('jobTitle', '')
    job_description = data.get('jobDescription', '')

    combined_prompt = f"{SYSTEM_PROMPT}\n\nMaster Resume:\n{MASTER_RESUME}\n\nJob Title: {job_title}\nJob Description:\n{job_description}"

    try:
        response = model.generate_content(combined_prompt)
        clean_text = response.text.strip()
        
        # Sometimes even with response_mime_type, the model adds markdown ticks
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:-3].strip()
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:-3].strip()
            
        ai_content = json.loads(clean_text)

        # CLEANUP: We completely removed the 'if isinstance(list)' safety net here!
        # The schema guarantees it will be a string.

        return jsonify({"success": True, "data": ai_content})

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/export', methods=['POST'])
def export_resume():
    try:
        edited_data = request.json
        job_title = edited_data.get('jobTitle_meta', 'Tailored') 
        
        doc = DocxTemplate("FAANG_template - Copy.docx")
        doc.render(edited_data)
        
        file_stream = io.BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        
        output_filename = f"Shaurav_Vora_Resume_{job_title.replace(' ', '_')}.docx"

        return send_file(
            file_stream, 
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            as_attachment=True, 
            download_name=output_filename
        )

    except Exception as e:
        print(f"Export Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)