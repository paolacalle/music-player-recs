import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

dotenv.config();

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  ALLOW_ORIGIN,
  PORT = 8888,
  TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token",
  API_BASE_URL = "https://api.spotify.com/v1",
} = process.env;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ALLOW_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

// --- helpers ---
function basicAuthHeader() {
  const raw = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`;
  return "Basic " + Buffer.from(raw).toString("base64");
}

// --- health ---
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- client credentials flow ---
app.get("/auth/client-credentials", async (_req, res) => {
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
    res.json(rsp.data); // {access_token, token_type, expires_in}
  } catch (err) {
    console.error("client_credentials_failed:", err.response?.data || err.message);
    res.status(500).json({ error: "client_credentials_failed" });
  }
});

// optional: make /auth redirect to the token endpoint for convenience
app.get("/auth", (_req, res) => res.redirect("/auth/client-credentials"));

// --- generic Spotify proxy ---
// usage from frontend: /spotify/search?type=track&q=Imagine%20Dragons
app.use("/spotify", async (req, res) => {
  try {
    const auth = req.headers.authorization; // "Bearer <token>"
    console.log("Spotify proxy auth header:", auth ? "present" : "missing");
    if (!auth) return res.status(401).json({ error: "missing_authorization" });

    // Strip prefix so /spotify/search -> /search (keep query string intact)
    const upstreamPath = req.originalUrl.replace(/^\/spotify/, "");
    const url = `${API_BASE_URL}${upstreamPath}`;

    const method = req.method.toLowerCase();
    const headers = { Authorization: auth };
    const config = { method, url, headers };

    // Only forward a body for non-GET/HEAD
    if (method !== "get" && method !== "head") {
      if (req.headers["content-type"]) {
        headers["Content-Type"] = req.headers["content-type"];
      }
      config.data = req.body;
    }

    const rsp = await axios(config);
    res
      .status(rsp.status)
      .set("content-type", rsp.headers["content-type"] || "application/json")
      .send(rsp.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { error: "spotify_proxy_error" };
    console.error("Spotify proxy error:", status, data);
    res.status(status).json(data);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`API_BASE_URL: ${API_BASE_URL}`);
  console.log(`TOKEN_ENDPOINT: ${TOKEN_ENDPOINT}`);
});
