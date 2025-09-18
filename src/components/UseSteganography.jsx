import React from "react";
import { insertUpload } from "../utils/supabaseQueries";
import { useUser } from "../context/UserContext";

const UseSteganography = () => {
  const { userData } = useUser();

  const toBase64 = (file) =>
    new Promise((res) => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result);
      reader.readAsDataURL(file);
    });

    console.time("Encoding total");
  const encodeAndUpload = async (secretImageFile) => {
    try {
        console.time("toBase64 carrier");
      const carrierPath = "/carrier.png"; // must be placed in `/public`
      const carrierBlob = await fetch(carrierPath).then((res) => res.blob());
      const carrierBase64 = await toBase64(carrierBlob);
      console.timeEnd("toBase64 carrier");
      console.time("toBase64 secret");
      console.time("POST encode");
      const secretBase64 = await toBase64(secretImageFile);
      console.timeEnd("toBase64 secret");

      const res = await fetch("http://localhost:5000/encode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainImageBase64: carrierBase64,
          secretImageBase64: secretBase64,
        }),
      });
      console.timeEnd("POST encode");

      const data = await res.json();
      if (!data.success) throw new Error("Encoding or upload failed");

      const uploadedUrl = data.uploadedUrl;

      console.time("Supabase insert");
      await insertUpload({
        user_id: userData.user_id,
        image_url: uploadedUrl,
      });

      console.timeEnd("Supabase insert");

      console.timeEnd("Encoding total");
      return { success: true, imageUrl: uploadedUrl };
    } catch (error) {
      console.error("Encode failed:", error);
      return { success: false, error };
    }
  };

  const decodeFromUrl = async (decodeUrl) => {
    try {
      const res = await fetch("http://localhost:5000/decodeFromUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: decodeUrl }),
      });

      const data = await res.json();
      if (data.success) {
        const decodedUrl = `http://localhost:5000${data.decodedFile}`;
        return { success: true, decodedImageUrl: decodedUrl };
      } else {
        return {
          success: false,
          error: "No hidden image found or decode failed.",
        };
      }
    } catch (err) {
      console.error("Decode error:", err.message);
      return { success: false, error: err.message };
    }
  };
  return { encodeAndUpload, decodeFromUrl };
};

export default UseSteganography;
