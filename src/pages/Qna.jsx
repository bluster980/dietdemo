import React, { useEffect, useState, useMemo } from "react";
import BackArrow from "../assets/backarrow.svg";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavBar";
import PrimaryButton from "../components/PrimaryButton";
import { useUser } from "../context/UserContext";
import { toast } from "react-hot-toast";
import {
  createQnaNotification,
  getTrainerUserId,
  fetchLatestQnaQuestion,
} from "../utils/supabaseQueries";

const STORAGE_KEY = "lastQna";

const CARD_MAX_W = 420;
const PAGE_GUTTER = 7; // left/right padding for the whole page [11]
const RING = "#4ECDC4";
const BORDER_DEFAULT = "#E9ECEF";
const BORDER_FOCUS = "#4ECDC4";

const contentWidth = {
  width: `calc(100% - ${PAGE_GUTTER * 2}px)`, // respect page gutters [7]
  maxWidth: CARD_MAX_W - PAGE_GUTTER * 2, // align internal content
  margin: "0 auto",
  boxSizing: "border-box",
};

const fieldWrapBase = {
  width: "100%",
  borderRadius: 12,
  border: `1px solid ${BORDER_DEFAULT}`,
  background: "#FFFFFF",
  transition: "box-shadow 120ms ease, border-color 120ms ease",
  boxSizing: "border-box",
};

const fieldArea = {
  width: "100%",
  maxWidth: "100%",
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: 18,
  lineHeight: 1.3,
  color: "#2D3436",
  padding: "14px 16px",
  resize: "none",
  boxSizing: "border-box",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
};

const formatRemaining = (ms) => {
  if (ms <= 0) return "0m";
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const Qna = () => {
  const navigate = useNavigate();
  const { userData, lastQnaTime, setLastQnaTime } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAskedTitle, setLastAskedTitle] = useState("");
  const [lastAskedDesc, setLastAskedDesc] = useState("");
  const totalMs = 24 * 60 * 60 * 1000;
  const progress = Math.min(1, Math.max(0, 1 - remainingMs / totalMs));
  const sec = Math.ceil(remainingMs / 1000);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  const btnLabelLocked = `Ask again in ${hrs}h ${mins}m ${secs}s`;
  const filled = Math.round(progress * 100);
  const fillColor = "#FF7675";
  const restColor = "#FFC2BE";
  const progressBg = `linear-gradient(to right, ${fillColor} ${filled}%, ${restColor} ${filled}%)`;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setLastAskedTitle(parsed.title);
      setLastAskedDesc(parsed.description);
      setLastQnaTime(parsed.time);
      setIsSubmitted(true);
    }
  }, [setLastQnaTime]); // [11]

  useEffect(() => {
    if (!userData?.user_id) {
      setLoading(false);
      setIsSubmitted(false);
      return;
    }
    if (lastQnaTime) {
      const diffHours =
        (Date.now() - new Date(lastQnaTime).getTime()) / (1000 * 60 * 60);
      setIsSubmitted(diffHours < 24);
    }
  }, [lastQnaTime, userData]);

  useEffect(() => {
    const checkQnaEligibility = async () => {
      if (!userData?.user_id) {
        setLoading(false);
        return;
      }
      const { data, error } = await fetchLatestQnaQuestion(userData.user_id);
      if (!error) {
        if (!data) {
          setIsSubmitted(false);
        } else {
          const diffHours =
            (Date.now() - new Date(data.time).getTime()) / (1000 * 60 * 60);
          setIsSubmitted(diffHours < 24);
          setLastQnaTime(data.time);
          const raw = typeof data.content === "string" ? data.content : "";
          const delim = " - ";
          const i = raw.indexOf(delim);
          const parsedTitle = i >= 0 ? raw.slice(0, i).trim() : raw.trim();
          const parsedDesc = i >= 0 ? raw.slice(i + delim.length).trim() : "";
          setLastAskedTitle(parsedTitle);
          setLastAskedDesc(parsedDesc);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              title: parsedTitle,
              description: parsedDesc,
              time: data.time,
            })
          );
        }
      }
      setLoading(false);
    };
    checkQnaEligibility();
  }, [userData?.user_id, setLastQnaTime]);

  useEffect(() => {
    if (!lastQnaTime) {
      setRemainingMs(0);
      return;
    }
    const last = new Date(lastQnaTime).getTime();
    const end = last + 24 * 60 * 60 * 1000;

    let intervalId;
    const tick = () => {
      const left = Math.max(0, end - Date.now());
      setRemainingMs(left);
      if (left === 0) {
        setIsSubmitted(false);
        setLastAskedTitle("");
        setLastAskedDesc("");
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };
    tick();
    intervalId = setInterval(tick, 1000);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [lastQnaTime]);

  const containerStyle = useMemo(
    () => ({
      width: `calc(100% - ${PAGE_GUTTER * 2}px)`, // sits inside page gutters [7]
      maxWidth: CARD_MAX_W,
      margin: "16px auto 0",
      background: "#fff",
      borderRadius: 16,
      border: `1px solid ${BORDER_DEFAULT}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      padding: "22px 12px 10px 12px",
      boxSizing: "border-box",
      minHeight: "calc(100vh - 260px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
    }),
    []
  );

  if (loading || isSubmitted === null) {
    return (
      <div
        style={{ height: "100vh" }}
        className="flex justify-center items-center"
      >
        {/* loader */}
      </div>
    );
  }

  const handleSubmit = async () => {
    const empty = !title.trim() || !description.trim();
    if (locked || isSubmitting || empty) {
        if (empty) toast.error("Please fill all the fields", { duration: 5000 });
        return;
    }
    setIsSubmitting(true);
    const nowIso = new Date().toISOString();
    setIsSubmitted(true);
    setLastQnaTime(nowIso);
    const fullContent = `${title.trim()} - ${description.trim()}`;
    const trainerUserId = await getTrainerUserId(userData.trainer_id);
    if (!trainerUserId) {
      setIsSubmitted(false);
      setLastQnaTime(null);
      setIsSubmitting(false);
      toast.error("Please set Trainer's ID First.");
      return;
    }
    const response = await createQnaNotification({
      content: fullContent,
      sender_id: userData.user_id,
      receiver_id: trainerUserId,
    });
    if (!response.success) {
      setIsSubmitted(false);
      setLastQnaTime(null);
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        time: nowIso,
      })
    );
    setLastAskedTitle(title.trim());
    setLastAskedDesc(description.trim());
    toast.success("Question submitted successfully", { duration: 5000 });
    setTitle("");
    setDescription("");
    setIsSubmitting(false);
  };

  const locked = !!isSubmitted;
  const isFormReady =
    !locked && title.trim().length > 0 && description.trim().length > 0 && !isSubmitting;
  const btnLabel = locked
    ? `Ask again in ${formatRemaining(remainingMs)}`
    : isSubmitting
    ? "Submitting..."
    : "SUBMIT";

  const applyFocus = (el, focused) => {
    const wrap = el.closest("[data-fieldwrap='1']");
    if (!wrap) return;
    if (focused) {
      wrap.style.boxShadow = `${RING}, inset 0 0 0 1px ${BORDER_FOCUS}`;
      wrap.style.borderColor = BORDER_FOCUS;
    } else {
      wrap.style.boxShadow = "none";
      wrap.style.borderColor = BORDER_DEFAULT;
    }
  };
  const onFocus = (e) => applyFocus(e.currentTarget, true);
  const onBlur = (e) => applyFocus(e.currentTarget, false);

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
      {/* Back header row */}
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "50 auto",
          height: 70, // compact bar
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

      {/* Title below back arrow */}
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
        Question &amp; Answer
      </h1>

      {/* Unlocked card */}
      {!locked && (
        <div style={containerStyle}>
          <div id="qna-top" style={{ ...contentWidth }}>
            <div style={{ textAlign: "center" }}>
              <p className="text-[20px] leading-[26px] text-[#6C757D] font-urbanist">
                Feel free to ask questions regarding
                <br />
                diet, workout, and supplements.
                <br />
                We will respond as soon
                <br />
                as possible.
              </p>
            </div>

            <div className="mt-6">
              <label
                htmlFor="qna-title"
                className="block text-[20px] font-urbanist font-medium text-[#2D3436] mb-[5px]"
              >
                Title
              </label>
              <div data-fieldwrap="1" style={{ ...fieldWrapBase }}>
                <textarea
                  id="qna-title"
                  rows={1}
                  placeholder="Add your title here"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={{ ...fieldArea, height: 56, fontFamily: "urbanist"  }}
                  className="placeholder-[#909497]"
                />
              </div>
              <div style={{ height: 18, marginTop: 6 }} />
            </div>

            <div className="mt-5">
              <label
                htmlFor="qna-desc"
                className="block text-[20px] font-urbanist font-medium text-[#2D3436] mb-[5px]"
              >
                Explain your doubt
              </label>
              <div data-fieldwrap="1" style={{ ...fieldWrapBase }}>
                <textarea
                  id="qna-desc"
                  rows={10}
                  placeholder="Type your query here"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={{ ...fieldArea, minHeight: 112, fontFamily: "urbanist" }}
                  className="placeholder-[#909497]"
                />
              </div>
              <div style={{ height: 15, marginTop: 0 }} />
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div
            id="qna-bottom"
            style={{ ...contentWidth, marginTop: 12, paddingBottom: 0 }}
            className="flex flex-col items-center"
          >
            <PrimaryButton
              text={btnLabel}
              onClick={handleSubmit}
              disabled={!isFormReady}
              customStyle={{
                width: "100%",
                height: 52,
                borderRadius: 12,
                background: !isFormReady ? "#FFC2BE" : "#FF7675",
                cursor: !isFormReady ? "not-allowed" : "pointer",
                opacity: !isFormReady ? 0.7 : 1,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            />
            <div
              className="w-full flex justify-center items-center gap-x-[5px]"
              style={{ marginTop: 8 }}
            >
              <div className="h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4] mt-[0px]" />
              <span className="text-[12px] text-[#909497]">
                One question every 24 hours
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Locked card */}
      {locked && (
        <div style={containerStyle}>
          <div id="qna-top" style={{ ...contentWidth }}>
            <div style={{ textAlign: "center" }}>
              <p className="text-[20px] leading-[26px] text-[#6C757D] font-urbanist">
                Feel free to ask questions regarding
                <br />
                diet, workout, and supplements.
                <br />
                We will respond as soon
                <br />
                as possible.
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-[20px] font-urbanist font-medium text-[#2D3436] mb-[10px]">
                Title
              </label>
              <div
                data-fieldwrap="1"
                style={{ ...fieldWrapBase, background: "#F8F9FA" }}
              >
                <textarea
                  readOnly
                  value={lastAskedTitle}
                  wrap="soft"
                  style={{
                    ...fieldArea,
                    height: 56,
                    color: "#6C757D",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                  aria-readonly="true"
                />
              </div>
              <div
                style={{
                  height: 18,
                  marginTop: 6,
                  marginBottom: 6,
                  color: "#909497",
                  fontSize: 13,
                  fontFamily: "urbanist",
                  lineHeight: "18px",
                }}
              >
                Viewing only during cooldown.
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-[20px] font-urbanist font-medium text-[#2D3436] mb-[10px]">
                Explain your doubt
              </label>
              <div
                data-fieldwrap="1"
                style={{ ...fieldWrapBase, background: "#F8F9FA" }}
              >
                <textarea
                  readOnly
                  value={lastAskedDesc}
                  wrap="soft"
                  style={{
                    ...fieldArea,
                    minHeight: 230,
                    color: "#6C757D",
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarGutter: "stable",
                  }}
                  aria-readonly="true"
                />
              </div>
              <div
                style={{
                  height: 18,
                  marginTop: 6,
                  marginBottom: 6,
                  color: "#909497",
                  fontSize: 13,
                  fontFamily: "urbanist",
                  lineHeight: "18px",
                }}
              >
                Viewing only during cooldown.
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div
            id="qna-bottom"
            style={{ ...contentWidth, marginTop: 12, paddingBottom: 0 }}
            className="flex flex-col items-center"
          >
            <PrimaryButton
              text={btnLabelLocked}
              onClick={() => {}}
              disabled
              ariaDisabled
              customStyle={{
                width: "100%",
                height: 52,
                borderRadius: 12,
                background: progressBg,
                boxShadow: "none",
                color: "#FFFFFF",
                opacity: 1,
                cursor: "not-allowed",
                position: "relative",
                overflow: "hidden",
              }}
              className="qna-progress"
            />
            <div
              className="w-full flex justify-center items-center gap-x-[5px]"
              style={{ marginTop: 8 }}
            >
              <div className="h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4]" />
              <span className="text-[12px] text-[#909497] font-urbanist">
                One question every 24 hours
              </span>
            </div>
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  );
};

export default Qna;
