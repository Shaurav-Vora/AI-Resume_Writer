import { useRef, useEffect } from "react";

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

export default AutoResizeTextarea;
