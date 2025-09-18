import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";

const ImagePicker = forwardRef(({ onImageSelect, accept = "image/*" }, ref) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const open = () => inputRef.current?.click();

  useImperativeHandle(ref, () => ({ open, clear: () => (inputRef.current.value = "") }), []);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelect?.(file, url);
    }
  };

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  return (
    <>
      {/* Visually hidden, not interactive overlay */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );
});

export default ImagePicker;
