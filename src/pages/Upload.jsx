import React, { useEffect, useRef, useState, useMemo } from "react";
import BackArrow from "../assets/backarrow.svg";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavBar";
import PrimaryButton from "../components/PrimaryButton";
import UploadFile from "../assets/uploadfile.svg";
import ImagePicker from "../components/ImagePicker";
import UseSteganography from "../components/UseSteganography";
import toast from "react-hot-toast";

/* Layout constants cloned from QnA for identical alignment */
const CARD_MAX_W = 420;
const PAGE_GUTTER = 7;
const BORDER_DEFAULT = "#E9ECEF";

/* width helper (matches qna.jsx) */
const contentWidth = {
  width: `calc(100% - ${PAGE_GUTTER * 2}px)`, // respect page gutters [7]
  maxWidth: CARD_MAX_W - PAGE_GUTTER * 2, // align internal content
  margin: "0 auto",
  boxSizing: "border-box",
};

/* helper: middle-truncate preserving extension */
const middleTruncate = (fileName = "") => {
  //   console.log(fileName.slice(-4));
  if (fileName.length <= 25) return fileName;
  const name = fileName.slice(0, 18);
  const ext = fileName.slice(-4);
  return `${name}…${ext}`;
};

/* Circular progress with teal glow and larger head */
/* Smooth CircularProgress with rAF tween + perfectly aligned head */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3); // 0..1 -> eased [1][6]

const CircularProgress = ({
  size = 220,
  stroke = 14,
  progress = 0, // target 0..100
  trackColor = "#EAF3F5",
  gradientFrom = "#34E3CF",
  gradientTo = "#19B9A7",
  glow = "#38D6C4",
  duration = 500, // ms per tween towards the new value
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [tweened, setTweened] = React.useState(progress); // displayed value
  const rafRef = React.useRef(null);
  const startRef = React.useRef({ from: progress, to: progress, t0: 0 });

  // cancel on unmount
  React.useEffect(
    () => () => rafRef.current && cancelAnimationFrame(rafRef.current),
    []
  );

  // tween whenever target 'progress' changes
  React.useEffect(() => {
    if (progress === startRef.current.to && tweened === progress) return;

    // setup tween
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
        setTweened(to); // snap at end
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [progress, duration, tweened]);

  // geometry based on tweened value
  const offset = circumference * (1 - tweened / 100);
  const id = React.useId();

  // end angle for the knob: start at -90deg and add tweened fraction of 360deg
  const angle = (tweened / 100) * Math.PI * 2 - Math.PI / 2;
  const cx = size / 2 + radius * Math.cos(angle);
  const cy = size / 2 + radius * Math.sin(angle);

  const margin = Math.max(stroke, 28); // safe gutter around ring
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
        style={{ filter: `url(#tealGlow-${id})` }} // JS drives animation; remove CSS transition
      />

      {/* knob centered on the arc end so it "merges" with the stroke */}
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
        fill="#1C2B32"
      >
        {Math.round(Math.min(100, Math.max(0, tweened)))}%
      </text>
    </svg>
  );
};

const Upload = () => {
  const { encodeAndUpload } = UseSteganography();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickerRef = useRef(null);
  const intervalRef = useRef(null);

  const handleImageSelect = (file) => {
    setSelectedFile(file);
    setProgress(0);
    setIsUploading(false);
  };

  const clearProgressTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  useEffect(() => () => clearProgressTimer(), []);

  const startFakeProgress = () => {
    clearProgressTimer();
    let value = 0;
    intervalRef.current = setInterval(() => {
      const delta = value < 70 ? 5 : value < 90 ? 3 : 1;
      value = Math.min(99, value + delta);
      setProgress(value);
    }, 200);
  };

  const handleCancel = () => {
    clearProgressTimer();
    setIsUploading(false);
    setProgress(0);
    toast.error("Upload canceled");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }
    setIsUploading(true);
    setProgress(0);
    startFakeProgress();

    try {
      const response = await encodeAndUpload(selectedFile);
      clearProgressTimer();
      setProgress(100);

      if (response?.success) {
        toast.success("Image uploaded successfully!");
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
          setSelectedFile(null);
        }, 650);
      } else {
        toast.error("Upload failed. Please try again.");
        setIsUploading(false);
      }
    } catch {
      clearProgressTimer();
      toast.error("Upload failed due to network or server error.");
      setIsUploading(false);
      setProgress(0);
    }
  };

  const uploadingLabel = (
    <span className="inline-flex items-center">
      Uploading
      <span className="ml-[2px] ellipsis-dots" aria-hidden="true" />
    </span>
  ); // CSS keyframes is defined globally

  /* Card container style copied from qna.jsx (only marginTop differs to match its 28px) */
  const containerStyle = useMemo(
    () => ({
      width: `calc(100% - ${PAGE_GUTTER * 2}px)`,
      maxWidth: CARD_MAX_W,
      margin: "20px auto 0px",
      background: "#fff",
      borderRadius: 16,
      border: `1px solid ${BORDER_DEFAULT}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      padding: "0px 12px 20px ",
      boxSizing: "border-box",
      minHeight: "calc(100vh - 240px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
    }),
    []
  );

  return (
    <div
      className="flex flex-col items-center"
      style={{
        background: "#ffffff",
        overflowX: "hidden",
        minHeight: "100vh",
        width: "100%",
        paddingLeft: PAGE_GUTTER, // global gutters [11]
        paddingRight: PAGE_GUTTER, // global gutters
        boxSizing: "border-box",
      }}
    >
      {/* Back */}
      {/* Back header row */}
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          height: 40, // compact bar
          display: "flex",
          alignItems: "end",
          position: "relative",
        }}
      >
        <BackArrow
          alt="back arrow"
          onClick={() => navigate(-1)}
          style={{
            width: 30,
            height: 30,
            position: "absolute",
            left: -1, // sticks to left gutter
            cursor: "pointer",
          }}
        />
      </div>

      {/* Title aligned like QnA */}
      <h1
        style={{
          width: "100%",
          textAlign: "left",
          margin: "24px 0 0 20px", // small space under the back row
          fontSize: 32,
          lineHeight: "36px",
          fontWeight: 600,
          fontFamily: "urbanist, system-ui, sans-serif",
        }}
      >
        Upload &amp; Files
      </h1>

      {/* Card with top / spacer / bottom like QnA */}
      <div style={containerStyle}>
        {/* TOP GROUP: first or second state */}
        <div id="upload-top" style={{ ...contentWidth }}>
          {!isUploading && (
            <div className="w-full flex flex-col items-center">
              <p className="text-[23px] leading-[26px] font-urbanist font-semibold text-center mt-[100px]">
                Upload Progress Photos
              </p>
              <p className="text-[20px] leading-[26px] text-[#6C757D] font-urbanist text-center mt-[20px]">
                PNG, JPG, JPEG, WEBP supported
                <br />
                max allowed size is 30MB
              </p>

              <div className="relative h-[170px] w-[170px] bg-[#f8f9fa] rounded-full flex items-center justify-center mt-[90px] mb-4">
                <UploadFile />
                <button
                  type="button"
                  onClick={() => pickerRef.current?.open()}
                  className="absolute inset-0 rounded-full"
                  aria-label="Choose image"
                />
                <ImagePicker
                  ref={pickerRef}
                  onImageSelect={handleImageSelect}
                />
              </div>

              <p className="font-urbanist font-semibold text-[26px] mt-[40px]">
                Upload
              </p>

              {/* fixed-height filename line to prevent jumps */}
              <div className="h-[15px] leading-[18px] ">
                {selectedFile && (
                  <p className="text-[#6B7280] text-[15px] max-w-[100%] mx-auto">
                    {middleTruncate(selectedFile.name)}
                  </p>
                )}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="w-full flex flex-col items-center">
              <div
                className="relative flex items-center justify-center mt-[50px]"
                style={{
                  // shell that protects against rounded card borders
                  padding: 24, // >= head radius + glow spread
                  overflow: "visible", // let SVG paint outside its box
                }}
              >
                <div
                  // extra wrapper to escape any ancestor overflow rules
                  style={{ overflow: "visible" }}
                >
                  <CircularProgress
                    size={280}
                    stroke={14}
                    progress={progress}
                  />
                </div>
              </div>
              <p className="text-[#2D3436] font-urbanist text-[23px] font-semibold mt-[50px]">
                {uploadingLabel}
              </p>

              <div className="h-[24px] leading-[24px] mt-2">
                <p className="text-[#9AA3A7] text-[16px] max-w-[280px]">
                  {selectedFile ? middleTruncate(selectedFile.name) : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FLEX SPACER like QnA pushes CTA to card bottom */}
        <div style={{ flex: 1 }} />

        {/* BOTTOM GROUP: single PrimaryButton aligned with contentWidth */}
        <div
          id="upload-bottom"
          style={{ ...contentWidth, marginTop: 12, paddingBottom: 0 }}
          className="flex flex-col items-center"
        >
          <PrimaryButton
            text={!isUploading ? "SEND" : "CANCEL"}
            onClick={!isUploading ? handleUpload : handleCancel}
            disabled={!isUploading && !selectedFile}
            customStyle={{
              width: "100%",
              height: 52,
              borderRadius: 12,
            //   background: "#FF6F7A",
              background: !isUploading && !selectedFile ? "#FFC2BE" : "#FF6F7A",
              boxShadow: "none",
              cursor: !isUploading && !selectedFile ? "not-allowed" : "pointer",
              opacity: !isUploading && !selectedFile ? 0.7 : 1,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          />
          {/* optional helper row to mirror QnA spacing; leave empty or add tips */}
        </div>
      </div>

      <NavigationBar />
    </div>
  );
};

export default Upload;
