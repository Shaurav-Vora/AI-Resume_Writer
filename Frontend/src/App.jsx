import { useState, useEffect } from "react";
import ResumeEditor from "./components/ResumeEditor";
import LivePreview from "./components/LivePreview";

function App() {
  const [jobTitle, setJobTitle] = useState(
    () => localStorage.getItem("draftJobTitle") || "",
  );
  const [jobDescription, setJobDescription] = useState(
    () => localStorage.getItem("draftJobDesc") || "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [resumeData, setResumeData] = useState(() => {
    const savedData = localStorage.getItem("draftResumeData");
    return savedData ? JSON.parse(savedData) : null;
  });

  useEffect(() => {
    localStorage.setItem("draftJobTitle", jobTitle);
    localStorage.setItem("draftJobDesc", jobDescription);
    if (resumeData) {
      localStorage.setItem("draftResumeData", JSON.stringify(resumeData));
    } else {
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
    } finally {
      setIsExporting(false);
    }
  };

  const handleEdit = (field, value) =>
    setResumeData({ ...resumeData, [field]: value });
  const handlePrint = () => window.print();

  return (
    <div className="max-w-400 mx-auto p-8 font-sans flex gap-10 items-start justify-center min-h-screen print:p-0 print:m-0 print:block print:bg-white">
      <ResumeEditor
        jobTitle={jobTitle}
        setJobTitle={setJobTitle}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        resumeData={resumeData}
        setResumeData={setResumeData}
        isLoading={isLoading}
        handleGenerate={handleGenerate}
        handleEdit={handleEdit}
      />

      <LivePreview
        resumeData={resumeData}
        isExporting={isExporting}
        handleExport={handleExport}
        handlePrint={handlePrint}
      />
    </div>
  );
}

export default App;
