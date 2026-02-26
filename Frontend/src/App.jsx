import { useState } from "react";

function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setResumeData(null);
    try {
      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, jobDescription }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setResumeData(result.data);
    } catch (error) {
      console.error(error);
      alert("❌ Error: Could not generate the document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!resumeData) return;
    setIsExporting(true);
    try {
      const payload = { ...resumeData, jobTitle_meta: jobTitle };
      const response = await fetch("http://localhost:5000/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Shaurav_Vora_Resume_${jobTitle.replace(/\s+/g, "_") || "Tailored"}.docx`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Error:", error);
      alert("❌ Error: Could not download the document.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleEdit = (field, value) => {
    setResumeData({ ...resumeData, [field]: value });
  };

  return (
    <div
      style={{
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "30px",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        gap: "40px",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#f4f7f9",
        minHeight: "100vh",
      }}
    >
      <style>
        {`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          
          body { 
            margin: 0; 
            padding: 0; 
            background-color: #f4f7f9; 
          }
          * { 
            box-sizing: border-box; 
          }
          
          .scroll-panel::-webkit-scrollbar { width: 8px; }
          .scroll-panel::-webkit-scrollbar-track { background: transparent; }
          .scroll-panel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .scroll-panel::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          
          .input-field {
            width: 100%; padding: 14px 16px; font-size: 15px; border-radius: 8px; border: 1px solid #cbd5e1; font-family: inherit; box-sizing: border-box; background-color: #f8fafc; transition: all 0.2s ease; color: #1e293b; line-height: 1.6;
          }
          .input-field::placeholder { color: #94a3b8; }
          .input-field:focus {
            outline: none; border-color: #3b82f6; background-color: #ffffff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          }
          
          .edit-label { font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block; }
          
          .editor-card {
            background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;
          }
          .card-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 20px; display: flex; alignItems: center; gap: 8px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
          .form-group { margin-bottom: 20px; }
          
          .generate-btn {
            width: 100%; padding: 16px; font-size: 16px; font-weight: 600; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; display: flex; justify-content: center; align-items: center; gap: 10px;
          }
          .generate-btn:not(:disabled) {
            background: linear-gradient(135deg, #2563eb, #4f46e5); box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39);
          }
          .generate-btn:not(:disabled):hover {
            transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          }
          .generate-btn:disabled {
            background: #cbd5e1; cursor: not-allowed;
          }

          .feature-pill {
            padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
          }
        `}
      </style>

      {/* LEFT COLUMN: Input Form or Editor */}
      <div
        className="scroll-panel"
        style={{
          flex: "1",
          minWidth: "500px",
          position: "sticky",
          top: "30px",
          maxHeight: "90vh",
          overflowY: "auto",
          paddingRight: "10px",
        }}
      >
        {!resumeData ? (
          <div
            className="editor-card"
            style={{ borderTop: "4px solid #3b82f6" }}
          >
            <h1
              style={{
                marginTop: 0,
                fontSize: "32px",
                letterSpacing: "-0.5px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(to right, #2563eb, #9333ea)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: "800",
                }}
              >
                AI Resume Tailor
              </span>
            </h1>
            <p
              style={{
                color: "#64748b",
                marginBottom: "32px",
                fontSize: "16px",
                lineHeight: "1.6",
              }}
            >
              Paste the target job details below. The AI will analyze the ATS
              keywords and perfectly align your master resume to match.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div>
                <label className="edit-label">Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g., Data Engineering Intern"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="input-field"
                  style={{ backgroundColor: "#fff" }}
                />
              </div>
              <div>
                <label className="edit-label">Full Job Description</label>
                <textarea
                  placeholder="Paste the requirements, responsibilities, and qualifications here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={12}
                  className="input-field"
                  style={{ resize: "vertical", backgroundColor: "#fff" }}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !jobDescription}
                className="generate-btn"
              >
                {isLoading ? (
                  <>
                    <svg
                      style={{
                        animation: "spin 1s linear infinite",
                        width: "20px",
                        height: "20px",
                        color: "white",
                      }}
                      xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeOpacity="0.25"
                      ></circle>
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing & Tailoring...
                  </>
                ) : (
                  "✨ Generate Tailored Resume"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                padding: "0 4px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>
                  ✏️ Editor Mode
                </h2>
                <span style={{ color: "#64748b", fontSize: "14px" }}>
                  Changes auto-sync to your preview
                </span>
              </div>
              <button
                onClick={() => setResumeData(null)}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Start Over
              </button>
            </div>

            {/* CARD 1: Profile Summary */}
            <div className="editor-card">
              <h3 className="card-title">👤 Profile Summary</h3>
              <div className="form-group">
                <textarea
                  className="input-field"
                  rows={4}
                  value={resumeData.resume_summary}
                  onChange={(e) => handleEdit("resume_summary", e.target.value)}
                />
              </div>
            </div>

            {/* CARD 2: Skills & Certifications */}
            <div className="editor-card">
              <h3 className="card-title">🛠️ Skills, Certs & Achievements</h3>
              <div
                style={{ display: "flex", gap: "16px", marginBottom: "20px" }}
              >
                <div style={{ flex: 1 }}>
                  <label className="edit-label">Tech Skills</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={resumeData.tech_skills}
                    onChange={(e) => handleEdit("tech_skills", e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="edit-label">Soft Skills</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={resumeData.soft_skills}
                    onChange={(e) => handleEdit("soft_skills", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="edit-label">Certifications</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={resumeData.certs || ""}
                  onChange={(e) => handleEdit("certs", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="edit-label">Key Achievements</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={resumeData.achievements || ""}
                  onChange={(e) => handleEdit("achievements", e.target.value)}
                  placeholder="e.g., • UK Design Patent Holder..."
                />
              </div>
            </div>

            {/* CARD 3: Work Experience */}
            <div className="editor-card">
              <h3 className="card-title">💼 Work Experience</h3>
              <div className="form-group">
                <label className="edit-label">Company & Role</label>
                <div
                  style={{ display: "flex", gap: "12px", marginBottom: "12px" }}
                >
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1 }}
                    value={resumeData.work_company_1}
                    onChange={(e) =>
                      handleEdit("work_company_1", e.target.value)
                    }
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1 }}
                    value={resumeData.work_title_1}
                    onChange={(e) => handleEdit("work_title_1", e.target.value)}
                    placeholder="Job Title"
                  />
                </div>
                <label className="edit-label">Description Bullets</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={resumeData.work_exp_1}
                  onChange={(e) => handleEdit("work_exp_1", e.target.value)}
                />
              </div>
            </div>

            {/* CARD 4: Projects */}
            <div className="editor-card">
              <h3 className="card-title">🚀 Selected Projects</h3>

              <div
                className="form-group"
                style={{
                  paddingBottom: "20px",
                  borderBottom: "1px dashed #e2e8f0",
                }}
              >
                <label className="edit-label">Project 1</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ marginBottom: "10px", fontWeight: "600" }}
                  value={resumeData.project_title_1}
                  onChange={(e) =>
                    handleEdit("project_title_1", e.target.value)
                  }
                />
                <textarea
                  className="input-field"
                  rows={3}
                  value={resumeData.project_description_1}
                  onChange={(e) =>
                    handleEdit("project_description_1", e.target.value)
                  }
                />
              </div>

              <div
                className="form-group"
                style={{
                  paddingBottom: "20px",
                  borderBottom: "1px dashed #e2e8f0",
                }}
              >
                <label className="edit-label">Project 2</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ marginBottom: "10px", fontWeight: "600" }}
                  value={resumeData.project_title_2}
                  onChange={(e) =>
                    handleEdit("project_title_2", e.target.value)
                  }
                />
                <textarea
                  className="input-field"
                  rows={3}
                  value={resumeData.project_description_2}
                  onChange={(e) =>
                    handleEdit("project_description_2", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label className="edit-label">Project 3</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ marginBottom: "10px", fontWeight: "600" }}
                  value={resumeData.project_title_3}
                  onChange={(e) =>
                    handleEdit("project_title_3", e.target.value)
                  }
                />
                <textarea
                  className="input-field"
                  rows={3}
                  value={resumeData.project_description_3}
                  onChange={(e) =>
                    handleEdit("project_description_3", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Output Dashboard & Preview */}
      <div
        style={{
          flex: "1",
          minWidth: "600px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {resumeData ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
                borderBottom: "2px solid #f1f5f9",
                paddingBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>
                📄 Live Preview
              </h2>
              <button
                onClick={handleExport}
                disabled={isExporting}
                style={{
                  padding: "12px 24px",
                  fontSize: "15px",
                  backgroundColor: isExporting ? "#94a3b8" : "#16a34a",
                  color: "white",
                  border: "none",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  borderRadius: "8px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  boxShadow: isExporting
                    ? "none"
                    : "0 4px 6px rgba(22, 163, 74, 0.2)",
                }}
              >
                {isExporting ? "Building Document..." : "📥 Download .docx"}
              </button>
            </div>

            {/* Resume Content Preview */}
            <div
              style={{
                fontFamily: "Georgia, serif",
                color: "#334155",
                lineHeight: "1.6",
              }}
            >
              <h3
                style={{
                  textTransform: "uppercase",
                  fontSize: "13px",
                  letterSpacing: "1px",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "4px",
                  marginBottom: "12px",
                  color: "#0f172a",
                }}
              >
                Summary
              </h3>
              <p style={{ fontSize: "14.5px", marginBottom: "24px" }}>
                {resumeData.resume_summary}
              </p>

              <h3
                style={{
                  textTransform: "uppercase",
                  fontSize: "13px",
                  letterSpacing: "1px",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "4px",
                  marginBottom: "12px",
                  color: "#0f172a",
                }}
              >
                Skills & Certifications
              </h3>
              <p style={{ fontSize: "14.5px", margin: "0 0 6px 0" }}>
                <strong>Technical:</strong> {resumeData.tech_skills}
              </p>
              <p style={{ fontSize: "14.5px", margin: "0 0 6px 0" }}>
                <strong>Soft Skills:</strong> {resumeData.soft_skills}
              </p>
              <p style={{ fontSize: "14.5px", margin: "0 0 6px 0" }}>
                <strong>Certifications:</strong> {resumeData.certs}
              </p>

              {resumeData.achievements && (
                <>
                  <h3
                    style={{
                      textTransform: "uppercase",
                      fontSize: "13px",
                      letterSpacing: "1px",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "4px",
                      marginBottom: "12px",
                      color: "#0f172a",
                      marginTop: "24px",
                    }}
                  >
                    Achievements
                  </h3>
                  <p
                    style={{
                      fontSize: "14.5px",
                      marginBottom: "24px",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {resumeData.achievements}
                  </p>
                </>
              )}

              <h3
                style={{
                  textTransform: "uppercase",
                  fontSize: "13px",
                  letterSpacing: "1px",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "4px",
                  marginBottom: "12px",
                  color: "#0f172a",
                  marginTop: "24px",
                }}
              >
                Experience
              </h3>
              <div style={{ marginBottom: "24px" }}>
                <p
                  style={{
                    fontSize: "14.5px",
                    margin: "0 0 8px 0",
                    fontWeight: "bold",
                    color: "#0f172a",
                  }}
                >
                  {resumeData.work_company_1} | {resumeData.work_title_1}
                </p>
                <ul
                  style={{ margin: 0, paddingLeft: "24px", fontSize: "14.5px" }}
                >
                  <li>{resumeData.work_exp_1}</li>
                </ul>
              </div>

              <h3
                style={{
                  textTransform: "uppercase",
                  fontSize: "13px",
                  letterSpacing: "1px",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "4px",
                  marginBottom: "12px",
                  color: "#0f172a",
                }}
              >
                Selected Projects
              </h3>
              <div style={{ marginBottom: "16px" }}>
                <p
                  style={{
                    fontSize: "14.5px",
                    margin: "0 0 4px 0",
                    fontWeight: "bold",
                    color: "#0f172a",
                  }}
                >
                  {resumeData.project_title_1}
                </p>
                <ul
                  style={{ margin: 0, paddingLeft: "24px", fontSize: "14.5px" }}
                >
                  <li>{resumeData.project_description_1}</li>
                </ul>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <p
                  style={{
                    fontSize: "14.5px",
                    margin: "0 0 4px 0",
                    fontWeight: "bold",
                    color: "#0f172a",
                  }}
                >
                  {resumeData.project_title_2}
                </p>
                <ul
                  style={{ margin: 0, paddingLeft: "24px", fontSize: "14.5px" }}
                >
                  <li>{resumeData.project_description_2}</li>
                </ul>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <p
                  style={{
                    fontSize: "14.5px",
                    margin: "0 0 4px 0",
                    fontWeight: "bold",
                    color: "#0f172a",
                  }}
                >
                  {resumeData.project_title_3}
                </p>
                <ul
                  style={{ margin: 0, paddingLeft: "24px", fontSize: "14.5px" }}
                >
                  <li>{resumeData.project_description_3}</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: "100%",
              minHeight: "650px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)",
              padding: "40px",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: "#f1f5f9",
                padding: "24px",
                borderRadius: "50%",
                marginBottom: "24px",
                color: "#3b82f6",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>

            <h3
              style={{
                color: "#0f172a",
                fontSize: "22px",
                margin: "0 0 12px 0",
                fontWeight: "700",
              }}
            >
              Ready to tailor your resume?
            </h3>
            <p
              style={{
                color: "#64748b",
                textAlign: "center",
                maxWidth: "420px",
                lineHeight: "1.6",
                fontSize: "15px",
                margin: "0 0 32px 0",
              }}
            >
              Enter a job title and paste the description on the left. Our AI
              will analyze the requirements and dynamically align your
              experience and projects to match perfectly.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <span
                className="feature-pill"
                style={{ background: "#eff6ff", color: "#1d4ed8" }}
              >
                🎯 ATS Optimized Output
              </span>
              <span
                className="feature-pill"
                style={{ background: "#f0fdf4", color: "#15803d" }}
              >
                ✨ AI Keyword Matching
              </span>
              <span
                className="feature-pill"
                style={{ background: "#fdf4ff", color: "#a21caf" }}
              >
                📝 Editable Word Doc
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
