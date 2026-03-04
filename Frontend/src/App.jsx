import { useState, useRef, useEffect } from "react";

// A reusable component that automatically adjusts its height based on content
const AutoResizeTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} resize-none overflow-hidden`}
      rows={1}
    />
  );
};

function App() {
  // NEW: Check local storage on initial load. If nothing is there, default to ""
  const [jobTitle, setJobTitle] = useState(() => {
    return localStorage.getItem("draftJobTitle") || "";
  });

  const [jobDescription, setJobDescription] = useState(() => {
    return localStorage.getItem("draftJobDesc") || "";
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [resumeData, setResumeData] = useState(() => {
    const savedData = localStorage.getItem("draftResumeData");
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // NEW: Save everything, including the generated resume object
  useEffect(() => {
    localStorage.setItem("draftJobTitle", jobTitle);
    localStorage.setItem("draftJobDesc", jobDescription);

    // Since resumeData is an object, we must convert it to a string to save it
    if (resumeData) {
      localStorage.setItem("draftResumeData", JSON.stringify(resumeData));
    } else {
      // If user clicks "Start Over" and sets resumeData to null, clear it from memory
      localStorage.removeItem("draftResumeData");
    }
  }, [jobTitle, jobDescription, resumeData]);

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

  const classes = {
    input:
      "w-full px-4 py-3.5 text-[15px] rounded-lg border border-slate-300 bg-slate-50 transition-all duration-200 text-slate-800 leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder-slate-400",
    label:
      "block text-[13px] font-bold text-slate-600 uppercase tracking-wide mb-2",
    card: "bg-white rounded-2xl p-8 mb-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-200",
    cardTitle:
      "text-lg font-bold text-slate-900 mt-0 mb-5 flex items-center gap-2 pb-3 border-b border-slate-100",
    previewHeader:
      "uppercase text-[13px] tracking-wide border-b border-slate-300 pb-1 mb-3 text-slate-900 mt-6 first:mt-0",
  };

  return (
    <div className="max-w-400 mx-auto p-8 font-sans flex gap-10 items-start justify-center min-h-screen">
      {/* LEFT COLUMN: Input Form or Editor */}
      <div className="custom-scrollbar flex-1 min-w-125 sticky top-8 max-h-[90vh] overflow-y-auto pr-3">
        {!resumeData ? (
          <div className={`${classes.card} border-t-4 border-t-blue-500`}>
            <h1 className="mt-0 text-[32px] tracking-tight mb-2">
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
                AI Resume Tailor
              </span>
            </h1>
            <p className="text-slate-500 mb-8 text-base leading-relaxed">
              Paste the target job details below. The AI will analyze the ATS
              keywords and perfectly align your master resume to match.
            </p>

            <div className="flex flex-col gap-6">
              <div>
                <label className={classes.label}>Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g., Data Engineering Intern"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={`${classes.input} bg-white`}
                />
              </div>
              <div>
                <label className={classes.label}>Full Job Description</label>
                <textarea
                  placeholder="Paste the requirements, responsibilities, and qualifications here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={12}
                  className={`${classes.input} resize-y bg-white`}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !jobDescription}
                className="w-full p-4 text-base font-semibold text-white rounded-lg transition-all duration-200 flex justify-center items-center gap-2.5 bg-linear-to-br from-blue-600 to-indigo-600 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
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
            <div className="flex justify-between items-center mb-5 px-1">
              <div className="flex flex-col">
                <h2 className="m-0 text-slate-900 text-2xl font-bold">
                  ✏️ Editor Mode
                </h2>
                <span className="text-slate-500 text-sm">
                  Changes auto-sync to your preview
                </span>
              </div>
              <button
                onClick={() => setResumeData(null)}
                className="px-4 py-2 text-[13px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
              >
                Start Over
              </button>
            </div>

            {/* CARD 1: Objective */}
            <div className={classes.card}>
              <h3 className={classes.cardTitle}>🎯 Objective</h3>
              <div className="mb-4">
                <AutoResizeTextarea
                  className={classes.input}
                  value={resumeData.resume_objective}
                  onChange={(e) =>
                    handleEdit("resume_objective", e.target.value)
                  }
                />
              </div>
            </div>

            {/* CARD 2: Skills, Certs & Achievements */}
            <div className={classes.card}>
              <h3 className={classes.cardTitle}>
                🛠️ Skills, Certs & Achievements
              </h3>
              <div className="flex gap-4 mb-5">
                <div className="flex-1">
                  <label className={classes.label}>Tech Skills</label>
                  <AutoResizeTextarea
                    className={classes.input}
                    value={resumeData.tech_skills}
                    onChange={(e) => handleEdit("tech_skills", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className={classes.label}>Soft Skills</label>
                  <AutoResizeTextarea
                    className={classes.input}
                    value={resumeData.soft_skills}
                    onChange={(e) => handleEdit("soft_skills", e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className={classes.label}>Certifications</label>
                <AutoResizeTextarea
                  className={classes.input}
                  value={resumeData.certs}
                  onChange={(e) => handleEdit("certs", e.target.value)}
                />
              </div>
              <div>
                <label className={classes.label}>Key Achievements</label>
                <AutoResizeTextarea
                  className={classes.input}
                  value={resumeData.achievements}
                  onChange={(e) => handleEdit("achievements", e.target.value)}
                  placeholder="e.g., • UK Design Patent Holder..."
                />
              </div>
            </div>

            {/* CARD 3: Work Experience */}
            <div className={classes.card}>
              <h3 className={classes.cardTitle}>💼 Work Experience</h3>
              <div>
                <label className={classes.label}>Company & Role</label>
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    className={`${classes.input} flex-1`}
                    value={resumeData.work_company_1}
                    onChange={(e) =>
                      handleEdit("work_company_1", e.target.value)
                    }
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    className={`${classes.input} flex-1`}
                    value={resumeData.work_title_1}
                    onChange={(e) => handleEdit("work_title_1", e.target.value)}
                    placeholder="Job Title"
                  />
                </div>
                <label className={classes.label}>Description Bullets</label>
                <AutoResizeTextarea
                  className={classes.input}
                  value={resumeData.work_exp_1}
                  onChange={(e) => handleEdit("work_exp_1", e.target.value)}
                />
              </div>
            </div>

            {/* CARD 4: Projects */}
            <div className={classes.card}>
              <h3 className={classes.cardTitle}>🚀 Selected Projects</h3>

              <div className="pb-5 border-b border-dashed border-slate-200 mb-5">
                <label className={classes.label}>Project 1</label>
                <input
                  type="text"
                  className={`${classes.input} mb-2.5 font-semibold`}
                  value={resumeData.project_title_1}
                  onChange={(e) =>
                    handleEdit("project_title_1", e.target.value)
                  }
                />
                <AutoResizeTextarea
                  className={classes.input}
                  value={resumeData.project_description_1}
                  onChange={(e) =>
                    handleEdit("project_description_1", e.target.value)
                  }
                />
              </div>

              <div className="pb-5 border-b border-dashed border-slate-200 mb-5">
                <label className={classes.label}>Project 2</label>
                <input
                  type="text"
                  className={`${classes.input} mb-2.5 font-semibold`}
                  value={resumeData.project_title_2}
                  onChange={(e) =>
                    handleEdit("project_title_2", e.target.value)
                  }
                />
                <AutoResizeTextarea
                  className={classes.input}
                  value={resumeData.project_description_2}
                  onChange={(e) =>
                    handleEdit("project_description_2", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={classes.label}>Project 3</label>
                <input
                  type="text"
                  className={`${classes.input} mb-2.5 font-semibold`}
                  value={resumeData.project_title_3}
                  onChange={(e) =>
                    handleEdit("project_title_3", e.target.value)
                  }
                />
                <AutoResizeTextarea
                  className={classes.input}
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
      <div className="flex-1 min-w-150 flex flex-col h-full">
        {resumeData ? (
          <div className="bg-white rounded-2xl p-10 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-200">
            <div className="flex justify-between items-center mb-8 border-b-2 border-slate-100 pb-5">
              <h2 className="m-0 text-slate-900 text-2xl font-bold">
                📄 Live Preview{" "}
                <span className="font-normal text-slate-500 text-sm">
                  *Layout may slightly differ in Word
                </span>
              </h2>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-3 text-[15px] font-semibold rounded-lg transition-all duration-200 bg-green-600 text-white hover:bg-green-700 shadow-[0_4px_6px_rgba(22,163,74,0.2)] disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isExporting ? "Building Document..." : "📥 Download .docx"}
              </button>
            </div>

            {/* Resume Content Preview */}
            <div className="font-serif text-slate-700 leading-relaxed">
              <h3 className={classes.previewHeader}>Objective</h3>
              <p className="text-[14.5px] mb-6">
                {resumeData.resume_objective}
              </p>

              <h3 className={classes.previewHeader}>Skills & Certifications</h3>
              <p className="text-[14.5px] m-0 mb-1.5">
                <strong>Technical:</strong> {resumeData.tech_skills}
              </p>
              <p className="text-[14.5px] m-0 mb-1.5">
                <strong>Soft Skills:</strong> {resumeData.soft_skills}
              </p>
              <p className="text-[14.5px] m-0 mb-6">
                <strong>Certifications:</strong> {resumeData.certs}
              </p>

              <h3 className={classes.previewHeader}>Experience</h3>
              <div className="mb-6">
                <p className="text-[14.5px] m-0 mb-2 font-bold text-slate-900">
                  {resumeData.work_company_1} | {resumeData.work_title_1}
                </p>
                <ul className="m-0 pl-6 text-[14.5px] list-disc">
                  <li>{resumeData.work_exp_1}</li>
                </ul>
              </div>

              <h3 className={classes.previewHeader}>Selected Projects</h3>
              <div className="mb-4">
                <p className="text-[14.5px] m-0 mb-1 font-bold text-slate-900">
                  {resumeData.project_title_1}
                </p>
                <ul className="m-0 pl-6 text-[14.5px] list-disc">
                  <li>{resumeData.project_description_1}</li>
                </ul>
              </div>
              <div className="mb-4">
                <p className="text-[14.5px] m-0 mb-1 font-bold text-slate-900">
                  {resumeData.project_title_2}
                </p>
                <ul className="m-0 pl-6 text-[14.5px] list-disc">
                  <li>{resumeData.project_description_2}</li>
                </ul>
              </div>
              <div className="mb-6">
                <p className="text-[14.5px] m-0 mb-1 font-bold text-slate-900">
                  {resumeData.project_title_3}
                </p>
                <ul className="m-0 pl-6 text-[14.5px] list-disc">
                  <li>{resumeData.project_description_3}</li>
                </ul>
              </div>

              {resumeData.achievements && (
                <>
                  <h3 className={classes.previewHeader}>Achievements</h3>
                  <p className="text-[14.5px] mb-2 whitespace-pre-line">
                    {resumeData.achievements}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          /* MODERN EMPTY STATE */
          <div className="h-full min-h-162.5 w-full flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-10 flex-col">
            <div className="bg-slate-100 p-6 rounded-full mb-6 text-blue-500">
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

            <h3 className="text-slate-900 text-[22px] m-0 mb-3 font-bold">
              Ready to tailor your resume?
            </h3>
            <p className="text-slate-500 text-center max-w-105 leading-relaxed text-[15px] m-0 mb-8">
              Enter a job title and paste the description on the left. Our AI
              will analyze the requirements and dynamically align your
              experience and projects to match perfectly.
            </p>

            <div className="flex gap-3 flex-wrap justify-center">
              <span className="px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 bg-blue-50 text-blue-700">
                🎯 ATS Optimized Output
              </span>
              <span className="px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 bg-green-50 text-green-700">
                ✨ AI Keyword Matching
              </span>
              <span className="px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 bg-fuchsia-50 text-fuchsia-700">
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
