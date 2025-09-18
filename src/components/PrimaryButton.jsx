const PrimaryButton = ({
  text,
  onClick,
  disabled = false,
  ariaDisabled = false,
  customStyle = {},
  className = "", 
  dense = false,      // still reduces height
}) => {
  // No shadows anywhere
  const base = {
    width: "275px",
    height: dense ? "44px" : "48px",
    fontSize: "16px",
    lineHeight: "1",
    borderRadius: "12px",
    fontFamily: "urbanist, system-ui, -apple-system, Segoe UI, Roboto",
    fontWeight: 700,
    background: "#FF7675",
    color: "#FFFFFF",
    border: "none",
    boxShadow: "none",
    transition:
      "transform 120ms ease, background-color 120ms ease, opacity 120ms ease",
    ...(disabled
      ? {
          background: "#FFC2BE",
          cursor: "not-allowed",
          opacity: 0.96,
        }
      : {}),
  };

  const mergedStyles = { ...base, ...customStyle };

  const setTransform = (el, value) => {
    if (disabled || !el) return;
    el.style.transform = value;
  };

  // Keep keyboard focus visible with a subtle outline ring only (no shadow)
  let lastPointerType = "mouse";
  const onPointerDown = () => { lastPointerType = "mouse"; };
  const onKeyDown = () => { lastPointerType = "keyboard"; };

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={ariaDisabled || disabled}
      className={`text-white focus:outline-none ${className}`}
      style={mergedStyles}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onMouseDown={(e) => {
        if (disabled) return;
        setTransform(e.currentTarget, "translateY(1px)");
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        setTransform(e.currentTarget, "translateY(0)");
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        setTransform(e.currentTarget, "translateY(0)");
      }}
      onFocus={(e) => {
        if (disabled) return;
        if (lastPointerType === "keyboard") {
          // 3px focus ring using currentColor overlay; adjust color if desired
          e.currentTarget.style.outline = "none";
        }
      }}
      onBlur={(e) => {
        if (disabled) return;
        // remove ring
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {text}
    </button>
  );
};

export default PrimaryButton;
