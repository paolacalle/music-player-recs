// server/routes/spotify.mjs
import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";


dotenv.config();

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  TOKEN_ENDPOINT,
  API_BASE_URL,
} = process.env;


// This router handles Spotify-related API endpoints, 
// including track retrieval and search functionalities.
const router = Router();

// --- helpers ---
function basicAuthHeader() {
  const raw = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`;
  return "Basic " + Buffer.from(raw).toString("base64");
}

// --- client credentials flow ---
router.get("/auth/client-credentials", async (_req, res) => {
  try {
    const rsp = await axios.post(
      TOKEN_ENDPOINT,
      new URLSearchParams({ grant_type: "client_credentials" }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: basicAuthHeader(),
        },
      }
    );

    res.json(rsp.data);
  } catch (error) {
    console.error(
      "Error in /auth/client-credentials:", 
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to obtain client credentials token" });
  }
});

// redirect shorthand
router.get("/auth", (_req, res) => res.redirect("/auth/client-credentials"));

// ----- generic Spotify API proxy -----
router.use("/spotify", async (req, res) => {
  try {
    const auth = req.headers.authorization; // "Bearer <token>" -- requirement
    console.log("Spotify proxy auth header:", auth ? "present" : "missing");
    if (!auth) return res.status(401).json({ error: "missing_authorization" });

    const upstreamPath = req.originalUrl.replace(/^\/spotify/, "");
    const url = `${API_BASE_URL}${upstreamPath}`;

    const method = req.method.toLowerCase();
    const headers = { Authorization: auth };
    const config = { method, url, headers };

    // Only forward a body for non-GET/HEAD requests
    if (method !== "get" && method !== "head") {
      if (req.headers["content-type"]) {
        headers["Content-Type"] = req.headers["content-type"];
      }
      config.data = req.body;
    }

    // Make the request to Spotify API
    const rsp = await axios(config);
    res
      .status(rsp.status) // preserve status code
      .set("content-type", rsp.headers["content-type"] || "application/json") // preserve content-type
      .send(rsp.data); // send back the data
  } catch (err) {
    // Error handling
    const status = err.response?.status || 500;
    const data = err.response?.data || { error: "spotify_proxy_error" };
    console.error("Spotify proxy error:", status, data);
    res.status(status).json(data);
  }
});

// export the router for use in main server file to mount it
export default router;