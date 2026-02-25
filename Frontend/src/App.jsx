import { useState } from "react";

function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [docUrl, setDocUrl] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setDocUrl(null);

    try {
      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, jobDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate resume");
      }

      // Capture the Word Document as a File Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDocUrl(url);
    } catch (error) {
      console.error(error);
      alert("❌ Error: Could not generate the document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!docUrl) return;

    const link = document.createElement("a");
    link.href = docUrl;

    // Update the filename to match what the backend actually sends
    // or use a generic one if you prefer.
    const fileName = `Shaurav_Vora_Resume_${jobTitle.replace(/\s+/g, "_") || "Tailored"}.docx`;

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    // Cleanup: Remove the link and revoke the URL to free up memory
    document.body.removeChild(link);
    window.URL.revokeObjectURL(docUrl);
  };

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "30px",
        fontFamily: "sans-serif",
        display: "flex",
        gap: "40px",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      {/* CSS for the animated loading bar */}
      <style>
        {`
          @keyframes loadingAnimation {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}
      </style>

      {/* LEFT COLUMN: Input Form */}
      <div
        style={{
          flex: "1",
          minWidth: "400px",
          position: "sticky",
          top: "30px",
        }}
      >
        <h1>🚀 AI Resume Tailor</h1>
        <p style={{ color: "#555", marginBottom: "20px" }}>
          Generate a tailored, editable Word Document.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            placeholder="Job Title (e.g., Data Engineering Intern)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            style={{
              padding: "12px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <textarea
            placeholder="Paste the full Job Description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
            style={{
              padding: "12px",
              fontSize: "14px",
              resize: "vertical",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={isLoading || !jobDescription}
            style={{
              padding: "15px",
              fontSize: "16px",
              backgroundColor: isLoading ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              borderRadius: "6px",
              fontWeight: "bold",
              transition: "background-color 0.2s",
            }}
          >
            {isLoading ? "Processing..." : "Generate Word Document"}
          </button>

          {/* NEW: Sleek Loading Bar */}
          {isLoading && (
            <div style={{ marginTop: "5px" }}>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                🧠 AI is analyzing projects and rewriting bullets...
              </p>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "50%",
                    backgroundColor: "#007bff",
                    borderRadius: "4px",
                    animation: "loadingAnimation 1.5s infinite ease-in-out",
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Output Dashboard */}
      <div
        style={{
          flex: "2",
          minWidth: "600px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {docUrl ? (
          /* SUCCESS STATE */
          <div
            style={{
              height: "600px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0fdf4", // Light green background
              border: "2px solid #28a745",
              borderRadius: "8px",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            {/* Word Document Icon */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2b579a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M9 15l2 2 4-4"></path>
            </svg>

            <div style={{ textAlign: "center" }}>
              <h2 style={{ margin: "0 0 10px 0", color: "#155724" }}>
                Your Resume is Ready!
              </h2>
              <p
                style={{
                  margin: "0 0 20px 0",
                  color: "#3d8b40",
                  fontSize: "16px",
                }}
              >
                The AI successfully selected and tailored your projects.
              </p>
            </div>

            <button
              onClick={handleDownload}
              style={{
                padding: "15px 30px",
                fontSize: "18px",
                backgroundColor: "#2b579a",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "6px",
                fontWeight: "bold",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              📥 Download Editable .docx
            </button>
          </div>
        ) : (
          /* EMPTY STATE */
          <div
            style={{
              height: "600px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f8f9fa",
              border: "2px dashed #ced4da",
              borderRadius: "8px",
              color: "#6c757d",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <svg
              width="64"
              height="64"
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
            <p style={{ fontSize: "18px", margin: 0 }}>
              Paste a Job Description to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
