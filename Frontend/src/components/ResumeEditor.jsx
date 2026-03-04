import AutoResizeTextarea from "./AutoResizeTextarea";

const ResumeEditor = ({
  jobTitle,
  setJobTitle,
  jobDescription,
  setJobDescription,
  resumeData,
  setResumeData,
  isLoading,
  handleGenerate,
  handleEdit,
}) => {
  const classes = {
    input:
      "w-full px-4 py-3.5 text-[15px] rounded-lg border border-slate-300 bg-slate-50 transition-all duration-200 text-slate-800 leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder-slate-400",
    label:
      "block text-[13px] font-bold text-slate-600 uppercase tracking-wide mb-2",
    card: "bg-white rounded-2xl p-8 mb-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-200",
    cardTitle:
      "text-lg font-bold text-slate-900 mt-0 mb-5 flex items-center gap-2 pb-3 border-b border-slate-100",
  };

  return (
    <div className="custom-scrollbar flex-1 min-w-125 sticky top-8 max-h-[90vh] overflow-y-auto pr-3 print:hidden">
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
              className="w-full p-4 text-base font-semibold text-white rounded-lg transition-all duration-200 flex justify-center items-center gap-2.5 bg-linear-to-br from-blue-600 to-indigo-600 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading
                ? "Analyzing & Tailoring..."
                : "✨ Generate Tailored Resume"}
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

          <div className={classes.card}>
            <h3 className={classes.cardTitle}>🎯 Objective</h3>
            <div className="mb-4">
              <AutoResizeTextarea
                className={classes.input}
                value={resumeData.resume_objective}
                onChange={(e) => handleEdit("resume_objective", e.target.value)}
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <div className={classes.card}>
            <h3 className={classes.cardTitle}>💼 Work Experience</h3>
            <div>
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  className={`${classes.input} flex-1`}
                  value={resumeData.work_company_1}
                  onChange={(e) => handleEdit("work_company_1", e.target.value)}
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
              <AutoResizeTextarea
                className={classes.input}
                value={resumeData.work_exp_1}
                onChange={(e) => handleEdit("work_exp_1", e.target.value)}
              />
            </div>
          </div>

          <div className={classes.card}>
            <h3 className={classes.cardTitle}>🚀 Selected Projects</h3>
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={
                  num !== 3
                    ? "pb-5 border-b border-dashed border-slate-200 mb-5"
                    : ""
                }
              >
                <label className={classes.label}>Project {num}</label>
                <input
                  type="text"
                  className={`${classes.input} mb-2.5 font-semibold`}
                  value={resumeData[`project_title_${num}`]}
                  onChange={(e) =>
                    handleEdit(`project_title_${num}`, e.target.value)
                  }
                />
                <AutoResizeTextarea
                  className={classes.input}
                  value={resumeData[`project_description_${num}`]}
                  onChange={(e) =>
                    handleEdit(`project_description_${num}`, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeEditor;
