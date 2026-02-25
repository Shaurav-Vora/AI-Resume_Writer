from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from docxtpl import DocxTemplate

load_dotenv()

app = Flask(__name__)
CORS(app) # Allows React to talk to this API

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    'gemini-2.5-flash',
    generation_config={"response_mime_type": "application/json"}
)

MASTER_RESUME = """
[Technical Skills]
Programming Languages: Python, Java, JavaScript, SQL, C, C++
Frameworks & Libraries: Spring Boot, TensorFlow, OpenCV, Flask, Android Studio, React, BeautifulSoup, Selenium
Tools & Technologies: Apache Kafka, REST APIs, JWT, BeautifulSoup, Selenium, Firebase, Google Gemini API, Git

[Soft Skills]
Problem Solving, Communication, Teamwork, Adaptability, Time Management, Leadership, Creativity, Critical Thinking, Attention to Detail, Collaboration, Empathy, Resilience, Conflict Resolution, Decision Making, Interpersonal Skills, Work Ethic, Emotional Intelligence, Project Management, Self-Motivation, Active Listening.

[Certifications]
Generative AI with AWS, Microsoft Excel, Fundamentals of Java

[Experience]
Company - Veracitiz Solutions Pvt. Ltd
Role - AI Intern
Tasks - Engineered a full-stack AI solution using Python and RAG architecture to process uploaded PDFs daily, generating context-aware assessment questions. Implemented vector embeddings and transformers to optimize information retrieval by 40%, connecting to the Gemini API to reduce manual query time by 2.5 hours per day.

[Projects Pool]
1. JPMorgan Chase & Co. Software Engineering Simulation: Engineered a real-time banking backend using Spring Boot to process high-volume financial transactions daily with Apache Kafka to decouple transaction ingestion from database persistence, ensuring 99.9% data integrity via Spring Data JPA. 
2. Recipe AI: Built a Java-based Android app integrating Google Gemini API to generate personalized recipes. Reduced user meal-planning time by 30% by implementing a user-friendly interface for inputting preferences, dietary restrictions, and available ingredients.
3. Banana leaf disease classifier: Trained a Python Machine Learning model achieving 90% classification accuracy using a dataset of 5,000+ images. Leveraged OpenCV for image processing and TensorFlow for model training using Flask, enabling real-time disease detection for local farmers.
4. Sustain Dubai: Developed a gamified sustainability prototype mobile app for Dubai residents using Java and Android Studio. Designed challenges allowing users to earn points, increasing projected eco-friendly habit retention by 25%.
5. Course search automation: Created a Python script automating university course searches, utilizing web scraping (BeautifulSoup, Selenium) to extract and structure data, reducing manual browsing from 2+ hours to less than 5 minutes.
6. Chat application: Architected a real-time chat app using Spring Boot (backend) and Java Swing (frontend). Implemented WebSocket communication for <50ms latency messaging and integrated JWT for secure access.
"""

SYSTEM_PROMPT = """
You are an expert Technical Recruiter and Resume Writer. 
I will provide my "Master Resume" (which includes a pool of projects) and a "Job Description".

Task 1: Read the Job Description and select the THREE projects from my 'Projects Pool' that most closely match the required skills.
Task 2: Rewrite the description for the THREE chosen projects to perfectly align with the JD keywords.
Task 3: Write a powerful 45-50 word professional summary tailored to the Job Description.
Task 4: Write a comma-separated list of the top 7 technical keywords from the Job Description that are relevant to my skills and experience.
Task 5: Write a comma-separated list of the top 7 soft skills from the Job Description that are relevant to my skills.
Task 6: Select up to 4 relevant certifications from my Master Resume. Do not invent any.
Task 7: Rewrite my work experience to align with the JD keywords.

CRITICAL RULES FOR BEATING ATS (STRICT COMPLIANCE REQUIRED):
- NO REPETITION: You MUST use a unique, strong action verb to start every single bullet point across the entire resume. Do not repeat verbs like "Developed", "Engineered", or "Created". Use a diverse vocabulary (e.g., Architected, Spearheaded, Orchestrated, Synthesized, Optimized, Formulated).
- QUANTIFY IMPACT: You MUST retain and highlight all numbers, percentages, and metrics provided in the Master Resume. Format them clearly (e.g., "90%", "10,000+").
- Structure every project and experience description using the format: [Unique Action Verb] + [What I did] + [Technology Used] + [Quantifiable Result/Impact].
- Length: Keep project descriptions between 40 and 50 words.
- Do NOT invent metrics or skills that are not in the Master Resume.
- FOR THE SUMMARY: You MUST include the fact that I hold a "UK design patent for a smart home device interface".
- FOR THE SUMMARY: Incorporate the target job title and top technical keywords from the Job Description. Keep it strictly between 45 and 50 words.

Output a strictly valid JSON object with these exact keys:
{
    "tech_skills": "[Insert comma separated list of top 7 technical keywords here]",
    "soft_skills": "[Insert comma separated list of top 7 soft skills here]",
    "certs": "[Insert comma separated list of top 4 certifications here]",
    "resume_summary": "[Insert tailored 45-50 word summary here]",
    "project_title_1": "[Insert Name of Best Matching Project]",
    "project_description_1": "[Insert a 2-3 sentence description of the project]",
    "project_title_2": "[Insert Name of 2nd Best Matching Project]",
    "project_description_2": "[Insert a 2-3 sentence description of the project]",
    "project_title_3": "[Insert Name of 3rd Best Matching Project]",
    "project_description_3": "[Insert a 2-3 sentence description of the project]",
    "work_title_1": "[Insert the title of the work experience]",
    "work_company_1": "[Insert the company name]",
    "work_exp_1": "[Insert the rewritten description enforcing unique action verbs and quantified impact]"
}
"""

@app.route('/api/generate', methods=['POST'])
def generate_resume():
    data = request.json
    job_title = data.get('jobTitle', '')
    job_description = data.get('jobDescription', '')

    combined_prompt = f"{SYSTEM_PROMPT}\n\nMaster Resume:\n{MASTER_RESUME}\n\nJob Title: {job_title}\nJob Description:\n{job_description}"

    try:

        response = model.generate_content(combined_prompt)
        ai_content = json.loads(response.text) # Parse the JSON

        
        doc = DocxTemplate("FAANG_template - Copy.docx")
        doc.render(ai_content)
        # Change the extension from .pdf to .docx
        output_file = f"Shaurav_Vora_Resume_{job_title.replace(' ', '_')}.docx"
        doc.save(output_file)

        # Update the send_file parameters
        return send_file(
            output_file, 
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            as_attachment=True, 
            download_name=output_file
        )

    except Exception as e:
        print(f"Error occurred: {e}") # Prints to your terminal for easy debugging
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)