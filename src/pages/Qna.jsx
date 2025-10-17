import React, { useEffect, useState } from "react";
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
import "../styles/qnaresponsive.css";

const STORAGE_KEY = "lastQna";

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
  }, [setLastQnaTime]);

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

  if (loading || isSubmitted === null) {
    return (
      <div className="qna-loading">
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
      wrap.classList.add("qna-field-focused");
    } else {
      wrap.classList.remove("qna-field-focused");
    }
  };
  const onFocus = (e) => applyFocus(e.currentTarget, true);
  const onBlur = (e) => applyFocus(e.currentTarget, false);

  return (
    <div className="df-viewport">
      <main className="qna-page">
        {/* Back Arrow */}
        <button 
          className="qna-back-btn" 
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="profile-back-icon" />
        </button>

        {/* Page Title */}
        <h1 className="qna-page-title" style={{ color: "var(--general-charcoal-text)"}}>Question &amp; Answer</h1>

        {/* QNA Card */}
        <div className="qna-card" style={{backgroundColor: "var(--dietcard-bg)", borderColor: "var(--profile-border)"}}>
          {/* Intro Text */}
          <div className="qna-intro">
            <p className="qna-intro-text" style={{ color: "var(--faded-text)"}}>
              Feel free to ask questions regarding
              <br />
              diet, workout, and supplements.
              <br />
              We will respond as soon
              <br />
              as possible.
            </p>
          </div>

          {/* Title Field */}
          <div className="qna-field-group">
            <label htmlFor="qna-title" className="qna-label" style={{ color: "var(--general-charcoal-text)" }}>
              Title
            </label>
            <div 
              data-fieldwrap="1" 
              className={`qna-field-wrap ${locked ? 'qna-field-locked' : ''}`}
              style={{backgroundColor: "var(--profile-section-card-bg)", borderColor: "var(--profile-border)"}}
            >
              <textarea
                id="qna-title"
                rows={1}
                placeholder={locked ? "" : "Add your title here"}
                value={locked ? lastAskedTitle : title}
                onChange={(e) => !locked && setTitle(e.target.value)}
                onFocus={!locked ? onFocus : undefined}
                onBlur={!locked ? onBlur : undefined}
                readOnly={locked}
                className="qna-textarea qna-textarea-title"
                aria-readonly={locked}
                style={{color: "var(--faded-text)"}}
              />
            </div>
            {locked && (
              <div className="qna-field-hint">Viewing only during cooldown.</div>
            )}
          </div>

          {/* Description Field */}
          <div className="qna-field-group">
            <label htmlFor="qna-desc" className="qna-label" style={{ color: "var(--general-charcoal-text)"}}>
              Explain your doubt
            </label>
            <div 
              data-fieldwrap="1" 
              className={`qna-field-wrap ${locked ? 'qna-field-locked' : ''}`}
              style={{backgroundColor: "var(--profile-section-card-bg)", borderColor: "var(--profile-border)"}}
            >
              <textarea
                id="qna-desc"
                rows={9}
                placeholder={locked ? "" : "Type your query here"}
                value={locked ? lastAskedDesc : description}
                onChange={(e) => !locked && setDescription(e.target.value)}
                onFocus={!locked ? onFocus : undefined}
                onBlur={!locked ? onBlur : undefined}
                readOnly={locked}
                className={`qna-textarea ${locked ? 'qna-textarea-locked' : ''}`}
                aria-readonly={locked}
                style={{color: "var(--faded-text)"}}
              />
            </div>
            {locked && (
              <div className="qna-field-hint">Viewing only during cooldown.</div>
            )}
          </div>

          {/* Spacer */}
          <div className="qna-spacer"></div>

          {/* Submit Button */}
          <div className="qna-button-wrapper">
            <PrimaryButton
              text={locked ? btnLabelLocked : btnLabel}
              onClick={locked ? () => {} : handleSubmit}
              disabled={locked || !isFormReady}
              ariaDisabled={locked}
              customStyle={{
                width: "100%",
                height: "var(--qna-button-height)",
                borderRadius: 12,
                background: locked 
                  ? progressBg 
                  : (!isFormReady ? "#FFC2BE" : "#FF7675"),
                cursor: (locked || !isFormReady) ? "not-allowed" : "pointer",
                opacity: (locked || !isFormReady) ? (locked ? 1 : 0.7) : 1,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                boxShadow: locked ? "none" : undefined,
              }}
            />
            <div className="qna-cooldown-notice">
              <div className="qna-cooldown-dot"></div>
              <span className="qna-cooldown-text">One question every 24 hours</span>
            </div>
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

export default Qna;
