import React, { useEffect } from "react";
import { useState } from "react";
import NotificationBell from "../assets/notificationbell.svg";
import Search from "../assets/search.svg";
import ClientCard from "../components/ClientCard";
import BackArrow from "../assets/backarrow.svg";
import Notification from "./Notification";
import NotificationCard from "../components/NotificationCard";
import LetterBox from "../assets/letterbox.svg";
import {
  fetchClientsForTrainer,
  fetchClientRequestForTrainer,
  acceptClientRequest,
  rejectClientRequest,
  removeClientFromTrainer,
  trainerIdDecided,
} from "../utils/supabaseQueries";
import SlothSleeping from "../assets/slothsleeping.json";
import Lottie from "lottie-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import "../styles/clientmanageresponsive.css";

// yyyy-mm-dd -> dd-mm-yyyy (safe for empty/null)
function formatDdMmYyyy(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return String(iso);
  return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
}

// Days remaining from today to subscription_expiry (UTC-safe, clamp at 0 if past)
function daysRemainingFromToday(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return "";
  const today = new Date();
  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const expiryUTC = Date.UTC(y, m - 1, d);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.ceil((expiryUTC - todayUTC) / msPerDay);
  return String(Math.max(diff, 0));
}

const Clientmanage = () => {
  const [isClientRequest, setIsClientRequest] = useState(false);
  const [allClients, setAllClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownClient, setOpenDropdownClient] = useState(null);
  const [clientRequests, setClientRequests] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const trainerId = userData?.trainer_id || null;
  const trainerUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    if (!trainerId) {
      trainerIdDecided(trainerUserId).then((res) => {
        if (res.data.exists) {
          localStorage.setItem("trainer_id", res.data.trainer_id);
          loadList(isClientRequest ? "requests" : "clients");
        }
      });
    }
  });

  const loadList = async (kind) => {
    if (!trainerId) return;

    if (kind === "clients") {
      const { data, error } = await fetchClientsForTrainer(trainerId);
      if (error) {
        console.error("fetchClientsForTrainer failed:", error.message);
        return;
      }
      const normalized = (data || []).map((u) => ({
        user_id: u.user_id,
        name: u.name ?? "Unknown",
        mobile_number: u.mobile_number ?? "",
        subscription_expiry: formatDdMmYyyy(u.subscription_expiry),
        days: daysRemainingFromToday(u.subscription_expiry),
        raw: u,
        gender: u.gender,
      }));
      setAllClients(normalized);
    } else {
      const { data, error } = await fetchClientRequestForTrainer(trainerId);
      if (error) {
        console.error("fetchClientRequestForTrainer failed:", error.message);
        return;
      }
      setClientRequests(data || []);
    }
  };

  useEffect(() => {
    loadList(isClientRequest ? "requests" : "clients");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredClients = allClients.filter((clientObj) =>
    (clientObj.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateClient = (clientId, updatedData) => {
    setAllClients((prev) =>
      prev.map((c) => (c.user_id === clientId ? { ...c, ...updatedData } : c))
    );
  };

  function handleClientRequest() {
    setIsClientRequest((prev) => {
      const next = !prev;
      loadList(next ? "requests" : "clients");
      return next;
    });
  }

  const handleNotification = () => {
    setShowNotification(!showNotification);
  };

  return (
    <div className="clientmanage-viewport">
      <div className="clientmanage-page" style={{backgroundColor: "var(--bg)"}}>
        {/* Trainer ID Badge */}
        <div className="clientmanage-header">
          <div 
            className="clientmanage-trainer-badge"
            style={{ 
              backgroundColor: "var(--dietcard-bg)", 
              borderColor: "var(--profile-border)" 
            }}
          >
            <span className="clientmanage-trainer-id" style={{ color: "var(--general-charcoal-text)" }}>
              {trainerId}
            </span>
          </div>
        </div>

        {/* Toggle Switch and Notification */}
        <div className="clientmanage-controls-wrapper">
          <div 
            className="clientmanage-toggle-container"
            style={{ 
              backgroundColor: "var(--dietcard-bg)", 
              borderColor: "var(--toggle-border)" 
            }}
          >
            <div className="clientmanage-toggle-options">
              <div
                className="clientmanage-toggle-option clientmanage-toggle-left"
                onClick={handleClientRequest}
              >
                <span
                  className="clientmanage-toggle-text"
                  style={{ color: isClientRequest ? "var(--general-charcoal-text)" : "#ffffff" }}
                >
                  Your Client
                </span>
              </div>
              <div
                className="clientmanage-toggle-option clientmanage-toggle-right"
                onClick={handleClientRequest}
              >
                <span
                  className="clientmanage-toggle-text"
                  style={{ color: isClientRequest ? "#ffffff" : "var(--general-charcoal-text)" }}
                >
                  Client Request
                </span>
              </div>
            </div>

            {/* Animated backgrounds */}
            <motion.div
              className="clientmanage-toggle-bg clientmanage-toggle-bg-right"
              initial={{ opacity: 0, x: -55 }}
              animate={{
                opacity: isClientRequest ? 1 : 0,
                x: isClientRequest ? 0 : -55,
              }}
              transition={{ duration: 0.3, ease: "easeIn" }}
            />
            <motion.div
              className="clientmanage-toggle-bg clientmanage-toggle-bg-left"
              initial={{ opacity: 0, x: 51 }}
              animate={{
                opacity: !isClientRequest ? 1 : 0,
                x: !isClientRequest ? 0 : 51,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          <button
            className="clientmanage-notification-btn"
            onClick={handleNotification}
            style={{ 
              backgroundColor: "var(--dietcard-bg)", 
              borderColor: "var(--profile-border)",
              color: "var(--general-charcoal-text)"
            }}
            aria-label="Open notifications"
          >
            <NotificationBell className="clientmanage-notification-icon" />
          </button>
        </div>

        {/* Notification Modal */}
        {showNotification && (
          <motion.div
            className="clientmanage-notification-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Notification
              trainerUserId={trainerUserId}
              role="trainer"
              onClose={() => setShowNotification(false)}
            />
          </motion.div>
        )}

        {/* Search Bar */}
        <div 
          className="clientmanage-search-container"
          style={{ 
            backgroundColor: "var(--dietcard-bg)", 
            borderColor: "var(--profile-border)" 
          }}
        >
          <Search className="clientmanage-search-icon" />
          <input
            className="clientmanage-search-input"
            placeholder="Search Name"
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ color: "var(--faded-text)" }}
          />
        </div>

        {/* Divider */}
        <div className="clientmanage-divider" style={{ backgroundColor: "var(--profile-border)" }} />

        {/* Client List */}
        <div className="clientmanage-list-container">
          {isClientRequest ? (
            <div className="clientmanage-list-scroll">
              {clientRequests.length === 0 ? (
                <div className="clientmanage-empty-state">
                  <Lottie
                    animationData={SlothSleeping}
                    className="clientmanage-empty-animation"
                    loop={true}
                    autoplay={true}
                  />
                  <p className="clientmanage-empty-title" style={{ color: "var(--faded-text)" }}>
                    No client requests
                  </p>
                  <p className="clientmanage-empty-subtitle" style={{ color: "var(--faded-text)" }}>
                    New join requests will appear here.
                  </p>
                </div>
              ) : (
                clientRequests.map((req) => (
                  console.log(req),
                  <ClientCard
                    key={req.user_id}
                    client={{
                      user_id: req.user_id,
                      name: req.users?.name ?? req.user_id,
                      mobile_number: req.users?.mobile_number ?? "",
                      subscription_expiry: "",
                      days: "",
                      gender: req.users?.gender ?? "",
                    }}
                    isDropdownOpen={openDropdownClient === req.user_id}
                    onDropdownToggle={() =>
                      setOpenDropdownClient((prev) =>
                        prev === req.user_id ? null : req.user_id
                      )
                    }
                    onCloseDropdown={() => setOpenDropdownClient(null)}
                    onUpdateClient={handleUpdateClient}
                    onActionClick={(action) =>
                      console.log(`Request ${req.user_id}: clicked ${action}`)
                    }
                    isClientRequest={true}
                    onAcceptClick={async () => {
                      await acceptClientRequest(req.user_id, trainerId);
                      await Promise.all([
                        loadList("requests"),
                        loadList("clients"),
                      ]);
                    }}
                    onRejectClick={async () => {
                      await rejectClientRequest(req.user_id, trainerId);
                      await loadList("requests");
                    }}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="clientmanage-list-scroll">
              {filteredClients.length === 0 ? (
                <div className="clientmanage-empty-state">
                  <Lottie
                    animationData={SlothSleeping}
                    className="clientmanage-empty-animation"
                    loop={true}
                    autoplay={true}
                  />
                  <p className="clientmanage-empty-title" style={{ color: "var(--faded-text)" }}>
                    No clients available
                  </p>
                  <p className="clientmanage-empty-subtitle" style={{ color: "var(--faded-text)" }}>
                    Invite or approve requests to see them here.
                  </p>
                </div>
              ) : (
                filteredClients.map((clientObj) => (
                  <ClientCard
                    key={clientObj.user_id}
                    client={clientObj}
                    isDropdownOpen={openDropdownClient === clientObj.user_id}
                    onDropdownToggle={() =>
                      setOpenDropdownClient((prev) =>
                        prev === clientObj.user_id ? null : clientObj.user_id
                      )
                    }
                    onCloseDropdown={() => setOpenDropdownClient(null)}
                    onUpdateClient={handleUpdateClient}
                    onActionClick={(action) =>
                      console.log(
                        `Client ${clientObj.user_id}: clicked ${action}`
                      )
                    }
                    isClientRequest={false}
                    onRemoveClient={async () => {
                      await removeClientFromTrainer(clientObj.user_id);
                      await loadList("clients");
                    }}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clientmanage;
