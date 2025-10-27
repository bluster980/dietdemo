import React, { useEffect, useRef, useState } from "react";
import BackArrow from "../assets/backarrow.svg";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavBar";
import PrimaryButton from "../components/PrimaryButton";
import UploadFile from "../assets/uploadfile.svg";
import ImagePicker from "../components/ImagePicker";
import UseSteganography from "../components/UseSteganography";
import toast from "react-hot-toast";
import "../styles/uploadresponsive.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/* helper: middle-truncate preserving extension */
const middleTruncate = (fileName = "") => {
  if (fileName.length <= 25) return fileName;
  const name = fileName.slice(0, 18);
  const ext = fileName.slice(-4);
  return `${name}…${ext}`;
};

/* Circular progress with teal glow and larger head */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const CircularProgress = ({
  size = 220,
  stroke = 14,
  progress = 0,
  trackColor = "var(--calorie-ring-track)",
  gradientFrom = "#34E3CF",
  gradientTo = "#19B9A7",
  glow = "#38D6C4",
  duration = 500,
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [tweened, setTweened] = React.useState(progress);
  const rafRef = React.useRef(null);
  const startRef = React.useRef({ from: progress, to: progress, t0: 0 });

  React.useEffect(
    () => () => rafRef.current && cancelAnimationFrame(rafRef.current),
    []
  );

  React.useEffect(() => {
    if (progress === startRef.current.to && tweened === progress) return;

    startRef.current = { from: tweened, to: progress, t0: performance.now() };

    const step = (now) => {
      const { from, to, t0 } = startRef.current;
      const elapsed = Math.min(1, (now - t0) / duration);
      const eased = easeOutCubic(elapsed);
      const value = from + (to - from) * eased;
      setTweened(value);

      if (elapsed < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setTweened(to);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [progress, duration, tweened]);

  const offset = circumference * (1 - tweened / 100);
  const id = React.useId();

  const angle = (tweened / 100) * Math.PI * 2 - Math.PI / 2;
  const cx = size / 2 + radius * Math.cos(angle);
  const cy = size / 2 + radius * Math.sin(angle);

  const margin = Math.max(stroke, 28);
  const vb = `-${margin} -${margin} ${size + margin * 2} ${size + margin * 2}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={vb}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="100%" stopColor={gradientTo} />
        </linearGradient>
        <filter
          id={`tealGlow-${id}`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="BLUR" />
          <feColorMatrix
            in="BLUR"
            type="matrix"
            values="0 0 0 0 0.22  0 0 0 0 0.84  0 0 0 0 0.77  0 0 0 0.85 0"
            result="GLOW"
          />
          <feMerge>
            <feMergeNode in="GLOW" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={stroke}
        fill="none"
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`url(#grad-${id})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        fill="none"
        style={{ filter: `url(#tealGlow-${id})` }}
      />

      <circle
        cx={cx}
        cy={cy}
        r={stroke / 1.1}
        fill={glow}
        opacity={tweened > 0 ? 1 : 0}
      />

      <text
        x="43%"
        y="43%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="urbanist, system-ui"
        fontWeight="600"
        fontSize={size * 0.22}
        fill="var(--general-charcoal-text)"
      >
        {Math.round(Math.min(100, Math.max(0, tweened)))}%
      </text>
    </svg>
  );
};

const Upload = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadAborted, setUploadAborted] = useState(false);

  const pickerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handleImageSelect = (file) => {
    setSelectedFile(file);
    setProgress(0);
    setIsUploading(false);
    setUploadAborted(false);
  };

  /**
   * Upload file to R2 using presigned URL
   */
  const uploadToR2 = async (file) => {
    try {
      // Step 1: Get presigned URL from backend
      setProgress(5);

      const urlResponse = await fetch(
        `${API_BASE_URL}/api/upload/generate-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
          }),
        }
      );

      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        throw new Error(error.message || "Failed to generate upload URL");
      }

      const { signedUrl, fileKey, publicUrl } = await urlResponse.json();
      setProgress(10);

      // Step 2: Upload directly to R2 using presigned URL
      abortControllerRef.current = new AbortController();

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && !uploadAborted) {
          // Map progress from 10% to 90%
          const percentComplete = 10 + (e.loaded / e.total) * 80;
          setProgress(Math.round(percentComplete));
        }
      });

      // Handle completion
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ fileKey, publicUrl });
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload aborted"));
        });
      });

      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);

      // Allow cancellation
      abortControllerRef.current.signal.addEventListener("abort", () => {
        xhr.abort();
      });

      const result = await uploadPromise;

      if (!uploadAborted) {
        setProgress(95);

        // Step 3: Optional - Verify upload with backend
        await fetch(`${API_BASE_URL}/api/upload/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileKey: result.fileKey,
          }),
        });

        setProgress(100);
        return { success: true, publicUrl: result.publicUrl };
      }

      return { success: false };
    } catch (error) {
      if (uploadAborted || error.message === "Upload aborted") {
        return { success: false, aborted: true };
      }
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    setUploadAborted(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsUploading(false);
    setProgress(0);
    toast.error("Upload canceled");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    // Validate file size (30MB max)
    const maxSize = 30 * 1024 * 1024; // 30MB in bytes
    if (selectedFile.size > maxSize) {
      toast.error("File size exceeds 30MB limit");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadAborted(false);

    try {
      const response = await uploadToR2(selectedFile);

      if (response?.success) {
        toast.success("Image uploaded successfully!");
        console.log("Public URL:", response.publicUrl);

        // Reset after brief delay to show 100%
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
          setSelectedFile(null);
        }, 650);
      } else if (!response?.aborted) {
        toast.error("Upload failed. Please try again.");
        setIsUploading(false);
        setProgress(0);
      }
    } catch (error) {
      if (!uploadAborted) {
        toast.error("Upload failed due to network or server error.");
        setIsUploading(false);
        setProgress(0);
      }
      console.error("Upload error:", error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const uploadingLabel = (
    <span className="inline-flex items-center">
      Uploading
      <span className="ml-[2px] ellipsis-dots" aria-hidden="true" />
    </span>
  );

  return (
    <div className="df-viewport">
      <main className="upload-page">
        {/* Back Arrow */}
        <button
          className="upload-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="profile-back-icon" />
        </button>

        {/* Page Title */}
        <h1
          className="upload-page-title"
          style={{ color: "var(--general-charcoal-text)" }}
        >
          Upload &amp; Files
        </h1>

        {/* Upload Card */}
        <div
          className="upload-card"
          style={{
            backgroundColor: "var(--dietcard-bg)",
            borderColor: "var(--profile-border)",
          }}
        >
          {!isUploading ? (
            /* Idle State */
            <div className="upload-idle-content">
              <p
                className="upload-idle-title"
                style={{ color: "var(--faded-text)" }}
              >
                Upload Progress Photos
              </p>
              <p
                className="upload-idle-subtitle"
                style={{ color: "var(--macros-unit)" }}
              >
                PNG, JPG, JPEG, WEBP supported
                <br />
                max allowed size is 30MB
              </p>

              <div className="upload-button-area">
                <button
                  type="button"
                  onClick={() => pickerRef.current?.open()}
                  className="upload-button"
                  aria-label="Choose image"
                >
                  <UploadFile className="upload-icon" />
                </button>
                <ImagePicker
                  ref={pickerRef}
                  onImageSelect={handleImageSelect}
                />
              </div>

              <p
                className="upload-label"
                style={{ color: "var(--faded-text)" }}
              >
                Upload
              </p>

              <div className="upload-filename-area">
                {selectedFile && (
                  <p
                    className="upload-filename"
                    style={{ color: "var(--general-charcoal-text)" }}
                  >
                    {middleTruncate(selectedFile.name)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Uploading State */
            <div className="upload-progress-content">
              <div className="upload-progress-wrapper">
                <CircularProgress
                  size={parseInt(
                    getComputedStyle(document.documentElement).getPropertyValue(
                      "--upload-progress-size"
                    ) || "280"
                  )}
                  stroke={14}
                  progress={progress}
                />
              </div>
              <p
                className="upload-progress-label"
                style={{ color: "var(--faded-text)" }}
              >
                {uploadingLabel}
              </p>
              <div className="upload-filename-area">
                <p
                  className="upload-progress-filename"
                  style={{ color: "var(--general-charcoal-text)" }}
                >
                  {selectedFile ? middleTruncate(selectedFile.name) : ""}
                </p>
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="upload-spacer"></div>

          {/* Submit Button */}
          <div className="upload-button-wrapper">
            <PrimaryButton
              text={!isUploading ? "SEND" : "CANCEL"}
              onClick={!isUploading ? handleUpload : handleCancel}
              disabled={!isUploading && !selectedFile}
              customStyle={{
                width: "100%",
                height: "var(--upload-button-height)",
                borderRadius: 12,
                background:
                  !isUploading && !selectedFile ? "#FFC2BE" : "#FF6F7A",
                boxShadow: "none",
                cursor:
                  !isUploading && !selectedFile ? "not-allowed" : "pointer",
                opacity: !isUploading && !selectedFile ? 0.7 : 1,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            />
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="nav-wrap">
          <NavigationBar />
        </div>
      </main>
    </div>
  );
};

export default Upload;
