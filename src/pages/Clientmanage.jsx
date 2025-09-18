import React, { useEffect } from "react";
import { useState } from "react";
// import { useNavigate } from 'react-router-dom';
import NotificationBell from "../assets/notificationbell.svg";
import Search from "../assets/search.svg";
import ClientCard from "../components/ClientCard";
import BackArrow from "../assets/backarrow.svg";
import NotificationCard from "../components/NotificationCard";
import LetterBox from "../assets/letterbox.svg";
import {
  fetchClientsForTrainer,
  fetchClientRequestForTrainer,
  acceptClientRequest,
  rejectClientRequest,
  removeClientFromTrainer,
} from "../utils/supabaseQueries";
import SlothSleeping from "../assets/slothsleeping.json";
import Lottie from "lottie-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// yyyy-mm-dd -> dd-mm-yyyy (safe for empty/null)
function formatDdMmYyyy(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-"); // expects 'YYYY-MM-DD'
  if (!y || !m || !d) return String(iso);
  return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
}

// Days remaining from today to subscription_expiry (UTC-safe, clamp at 0 if past)
function daysRemainingFromToday(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return "";
  // Build UTC timestamps to avoid local timezone shifting dates
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
  // const navigate = useNavigate();
  const [isClientRequest, setIsClientRequest] = useState(false);
  const [allClients, setAllClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownClient, setOpenDropdownClient] = useState(null);
  const [clientRequests, setClientRequests] = useState([]);

  const trainerId = localStorage.getItem("trainer_id");

  useEffect(() => {
    let ignore = false; // avoid race conditions on rapid trainer change
    const fetchClients = async () => {
      const { data, error } = await fetchClientsForTrainer(trainerId);
      if (error) {
        console.error("fetchClientsForTrainer failed:", error.message);
        return;
      }
      if (ignore) return;
      // Normalize to ClientCard shape
      const normalized = (data || []).map((u) => ({
        user_id: u.user_id, // unique key
        name: u.name ?? "Unknown",
        mobile_number: u.mobile_number ?? "",
        subscription_expiry: formatDdMmYyyy(u.subscription_expiry),
        days: daysRemainingFromToday(u.subscription_expiry),
        raw: u, // keep original row if needed
      }));
      setAllClients(normalized);
    };
    if (trainerId) fetchClients();
    return () => {
      ignore = true;
    };
  }, [trainerId]);

  useEffect(() => {
    let ignore = false; // avoid race conditions on rapid trainer change
    const fetchClientRequests = async () => {
      const { data, error } = await fetchClientRequestForTrainer(trainerId);
      if (error) {
        console.error("fetchClientRequestForTrainer failed:", error.message);
        return;
      }
      if (ignore) return;
      setClientRequests(data || []);
    };
    if (trainerId) fetchClientRequests();
    return () => {
      ignore = true;
    };
  });

  const filteredClients = allClients.filter((clientObj) =>
    (clientObj.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleUpdateClient = (clientId, updatedData) => {
    setAllClients((prev) =>
      prev.map((c) => (c.user_id === clientId ? { ...c, ...updatedData } : c))
    );
  };

  function handleClientRequest() {
    setIsClientRequest((prevState) => !prevState);
  }

  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        background: "#FFFFFF",
      }}
    >
      <div className="w-[94%] flex justify-end mt-[50px]">
        <div className="w-[65px] h-[26px] border border-1 border-[#E9ECEF] rounded-[10px] bg-white">
          <p className="text-center text-[16px] font-urbanist font-semibold text-[#2D3436]">
            <span>{trainerId}</span>
          </p>
        </div>
      </div>
      <div className="relative flex gap-x-[10px] mt-[10px]">
        <div className="w-[325px] h-[51px] border border-[#ff7675] rounded-[50px] bg-white flex justify-center items-center text-center">
          <div className="gap-x-[30px] flex text-center justify-center h-[51px] text-[20px] font-urbanist font-semibold text-[#000000] w-[95%]">
            <div
              className="z-10 h-full w-[40%] ml-[10px]"
              onClick={handleClientRequest}
            >
              <span
                className="flex justify-center items-center text-center z-10 h-full w-full mt-[0px]"
                style={{ color: isClientRequest ? "#2D3436" : "#ffffff" }}
              >
                Your Client
              </span>
            </div>
            <div
              className="flex z-10 h-full w-[60%]"
              onClick={handleClientRequest}
            >
              <span
                className="flex justify-center items-center text-center z-10 h-full w-full ml-[15px] mt-[0px]"
                style={{ color: isClientRequest ? "#ffffff" : "#2D3436" }}
              >
                Client Request
              </span>
            </div>
          </div>

          <motion.div
            className="z-0 absolute top-[0px] right-[62px] w-[185px] h-[51px] bg-[#ff7675]"
            style={{
              borderBottomLeftRadius: "100px",
              borderTopRightRadius: "50px",
              borderBottomRightRadius: "50px",
            }}
            initial={{ opacity: 0, x: -55 }}
            animate={{
              opacity: isClientRequest ? 1 : 0,
              x: isClientRequest ? 0 : -55,
            }}
            transition={{ duration: 0.3, ease: "easeIn" }}
          />
          <motion.div
            className="z-0 absolute top-[0px] left-[0px] w-[161px] h-[51px] bg-[#ff7675]"
            style={{
              borderBottomLeftRadius: "50px",
              borderTopLeftRadius: "50px",
              borderBottomRightRadius: "100px",
            }}
            initial={{ opacity: 0, x: 51 }}
            animate={{
              opacity: !isClientRequest ? 1 : 0,
              x: !isClientRequest ? 0 : 51,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <div
          className="mb-[10px] flex justify-center items-center w-[51px] h-[51px] rounded-[50%] border border-[#E9ECEF] bg-white"
          style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)" }}
          // onClick={handleNotification}
        >
          <NotificationBell />
        </div>
      </div>
      <div className="gap-x-[10px] flex items-center justify-start w-[94%] h-[43px] border border-[#E9ECEF] rounded-[50px] mt-[10px] bg-white">
        <Search className="ml-[12px]" />
        <p className="flex text-center text-[20px] font-urbanist text-[#565656] w-[86%]">
          <input
            className="w-full h-full text-[20px] font-urbanist text-[#565656]"
            placeholder="Search Name"
            style={{ outline: "none", border: "none" }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </p>
      </div>
      <div className="w-full mt-[10px]">
        <div className="justify-between items-center h-[1px] bg-[#F1F3F5]"></div>
      </div>
      <div
        className="flex h-[75vh] overflow-y-scroll"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
        }}
      >
        {isClientRequest ? (
          <div className="z-10 w-full h-full overflow-y-scroll">
            {clientRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40vh] text-[#6C757D]">
                <Lottie
                  animationData={SlothSleeping}
                  style={{ width: "250px", height: "250px" }}
                  loop={true}
                  autoplay={true}
                />
                <p className="text-[18px] font-urbanist font-semibold">
                  No client requests
                </p>
                <p className="text-[14px] font-urbanist">
                  New join requests will appear here.
                </p>
              </div>
            ) : (
              clientRequests.map((req) => (
                <ClientCard
                  key={req.user_id}
                  client={{
                    user_id: req.user_id,
                    name: req.users?.name ?? req.user_id,
                    mobile_number: req.users?.mobile_number ?? "",
                    subscription_expiry: "",
                    days: "",
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
                    setClientRequests((reqs) =>
                      reqs.filter((r) => r.user_id !== req.user_id)
                    );
                  }}
                  onRejectClick={async () => {
                    await rejectClientRequest(req.user_id, trainerId);
                    setClientRequests((reqs) =>
                      reqs.filter((r) => r.user_id !== req.user_id)
                    );
                  }}
                />
              ))
            )}
          </div>
        ) : (
          <div className="z-10 w-full h-full overflow-y-scroll">
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40vh] text-[#6C757D]">
                <Lottie
                  animationData={SlothSleeping}
                  style={{ width: "250px", height: "250px" }}
                  loop={true}
                  autoplay={true}
                />
                <p className="text-[18px] font-urbanist font-semibold">
                  No clients available
                </p>
                <p className="text-[14px] font-urbanist">
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
                    console.log(`Client ${clientObj.user_id}: clicked ${action}`)
                  }
                  isClientRequest={false}
                  onRemoveClient={async () => {
                    await removeClientFromTrainer(clientObj.user_id);
                    setAllClients((clients) =>
                      clients.filter((c) => c.user_id !== clientObj.user_id)
                    );
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clientmanage;
