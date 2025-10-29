const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_LEGACY_JWT_SECRET = process.env.SUPABASE_LEGACY_JWT_SECRET;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

require("dotenv").config();

async function jwtCreation(req, res) {
  try {
    const { user_json_url, name = "", role } = req.body || {};
    if (!user_json_url)
      return res.status(400).json({ error: "Missing user_json_url" });

    // 1) Validate URL origin and scheme
    const u = new URL(user_json_url);
    if (u.protocol !== "https:" || u.hostname !== "user.phone.email") {
      return res.status(400).json({ error: "Invalid provider URL" });
    }

    // 2) Fetch provider JSON server-side
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    const r = await fetch(user_json_url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!r.ok) return res.status(400).json({ error: "Provider fetch failed" });
    const payload = await r.json();

    const cc = String(payload.user_country_code || "");
    const phone = String(payload.user_phone_number || "");
    if (!cc || !phone)
      return res.status(400).json({ error: "Invalid provider response" });

    // 3) Upsert user by phone (normalize phone: cc + phone digits)
    const digits = `${phone}`.replace(/\D+/g, "");
    const e164 = `${digits}`;
    // Try to find user

    let user_id;

    if(role === "client"){
    const { data: existing, error: selErr } = await supabase
      .from("users")
      .select("user_id")
      .eq("mobile_number", e164)
      .limit(1)
      .maybeSingle();
    if (selErr) return res.status(500).json({ error: selErr.message });

    user_id = existing?.user_id;
    if (!user_id) {
      // Create user row with minimal fields
      const { data: ins, error: insErr } = await supabase
        .from("users")
        .insert([{ mobile_number: e164, name: name || null }])
        .select("user_id")
        .single();
      if (insErr) return res.status(500).json({ error: insErr.message });
      user_id = ins.user_id;
    }
}
    else{
      const { data: existing, error: selErr } = await supabase
      .from("trainers")
      .select("user_id")
      .eq("mobile_number", e164)
      .limit(1)
      .maybeSingle();
    if (selErr) return res.status(500).json({ error: selErr.message });

    user_id = existing?.user_id;
      if (!user_id) {
        const { data: ins, error: insErr } = await supabase
          .from("trainers")
          .insert([{ mobile_number: e164 }]) // add other trainer fields as needed
          .select("user_id")
          .single();
        if (insErr) return res.status(500).json({ error: insErr.message });
        user_id = ins.user_id;
      }
    }

    if (!user_id) {
      return res.status(500).json({ error: "Failed to resolve user_id" });
    }
    
    // 4) Mint Supabase‑compatible JWT (sub=user_id)
    // const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // 2h
    console.log("user_id from phoneverification before", user_id);
    const token = jwt.sign(
      { sub: user_id, role: "authenticated", user_role: role },
      SUPABASE_LEGACY_JWT_SECRET,
      { algorithm: "HS256", expiresIn: "30d" } // or ES256 with kid if you configured asymmetric keys
    );
    console.log("token from phoneverification", token);
    console.log("user_id from phoneverification", user_id); 

    return res.json({ access_token: token, user_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { jwtCreation };
