const LivePreview = ({
  resumeData,
  isExporting,
  handleExport,
  handlePrint,
}) => {
  const previewHeaderClass =
    "uppercase text-[13px] tracking-wide border-b border-slate-300 pb-1 mb-3 text-slate-900 mt-6 first:mt-0";

  return (
    <div className="flex-1 min-w-150 flex flex-col h-full print:block print:w-full print:m-0 print:p-0">
      {resumeData ? (
        <div className="bg-white rounded-2xl p-10 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
          <div className="flex justify-between items-center mb-8 border-b-2 border-slate-100 pb-5 print:hidden">
            <h2 className="m-0 text-slate-900 text-2xl font-bold">
              📄 Live Preview{" "}
              <span className="font-normal text-slate-500 text-sm">
                *Layout may slightly differ in Word
              </span>
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-6 py-3 text-[15px] font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                🖨️ Save as PDF
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-3 text-[15px] font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-400"
              >
                {isExporting ? "Building Document..." : "📥 Download .docx"}
              </button>
            </div>
          </div>

          <div className="font-serif text-slate-700 leading-relaxed">
            <h3 className={previewHeaderClass}>Objective</h3>
            <p className="text-[14.5px] mb-6">{resumeData.resume_objective}</p>

            <h3 className={previewHeaderClass}>Skills & Certifications</h3>
            <p className="text-[14.5px] m-0 mb-1.5">
              <strong>Technical:</strong> {resumeData.tech_skills}
            </p>
            <p className="text-[14.5px] m-0 mb-1.5">
              <strong>Soft Skills:</strong> {resumeData.soft_skills}
            </p>
            <p className="text-[14.5px] m-0 mb-6">
              <strong>Certifications:</strong> {resumeData.certs}
            </p>

            <h3 className={previewHeaderClass}>Experience</h3>
            <div className="mb-6">
              <p className="text-[14.5px] m-0 mb-2 font-bold text-slate-900">
                {resumeData.work_company_1} | {resumeData.work_title_1}
              </p>
              <ul className="m-0 pl-6 text-[14.5px] list-disc">
                <li>{resumeData.work_exp_1}</li>
              </ul>
            </div>

            <h3 className={previewHeaderClass}>Selected Projects</h3>
            {[1, 2, 3].map((num) => (
              <div key={num} className={num !== 3 ? "mb-4" : "mb-6"}>
                <p className="text-[14.5px] m-0 mb-1 font-bold text-slate-900">
                  {resumeData[`project_title_${num}`]}
                </p>
                <ul className="m-0 pl-6 text-[14.5px] list-disc">
                  <li>{resumeData[`project_description_${num}`]}</li>
                </ul>
              </div>
            ))}

            {resumeData.achievements && (
              <>
                <h3 className={previewHeaderClass}>Achievements</h3>
                <p className="text-[14.5px] mb-2 whitespace-pre-line">
                  {resumeData.achievements}
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        /* MODERN EMPTY STATE */
        <div className="h-full min-h-162.5 w-full flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-10 flex-col print:hidden">
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
            Enter a job title and paste the description on the left. Our AI will
            analyze the requirements and dynamically align your experience and
            projects to match perfectly.
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
  );
};

export default LivePreview;
