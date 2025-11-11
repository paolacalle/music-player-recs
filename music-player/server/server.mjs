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

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36",
      "Cookie": "CONSENT=YES+; SOCS=CAISNQgDEg.."
    }
  });
  return await res.text();
}

async function asJSON(html, wantSec) {
  // the best song is determined by how closely the duration matches
  // this is fast and simple but fragile—YouTube could change their HTML structure at any time
  console.log("Parsing YouTube HTML for video search results", { wantSec });
  // turn html into JSON
  const initialDataMatch = html.match(/var ytInitialData = (.*?});<\/script>/);
  if (!initialDataMatch) return null;

  const initialDataJson = initialDataMatch[1];
  const initialData = JSON.parse(initialDataJson);

  const videoItems =
    initialData.contents.twoColumnSearchResultsRenderer.primaryContents
      .sectionListRenderer.contents.flatMap(
        (section) =>
          section.itemSectionRenderer?.contents || []
      )
      .map((item) => item.videoRenderer)
      .filter((vr) => vr !== undefined);

  for (const video of videoItems) {
    const videoId = video.videoId;
    const lengthText = video.lengthText?.simpleText || "0:00";
    const parts = lengthText.split(":").map(Number);
    let durationSec = 0;
    if (parts.length === 3) {
      durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      durationSec = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      durationSec = parts[0];
    }

    console.log(`Found videoId=${videoId} duration=${durationSec}s`);

    if (wantSec === null || Math.abs(durationSec - wantSec) <= 10) {
      return { videoId, durationSec };
    }
  }

  return null;  
}

app.get("/yt/search", async (req, res) => {
  console.log("YT search request:", req.query);
  try {
    const raw = (req.query.q || "").trim();
    if (!raw) return res.status(400).json({ error: "Missing q" });

    const wantSec = req.query.durationSec ? Number(req.query.durationSec) : null;
    const searchUrl = `https://www.youtube.com/results?hl=en&gl=US&search_query=${encodeURIComponent(raw)}`;

    // (use fetch/undici/axios—just make sure it's the absolute URL above)
    const html = await fetchHTML(searchUrl);
    const result = await asJSON(html, wantSec); 

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: "No video found" });
    }
  } catch (e) {
    console.error("YT search error:", e);
    res.status(500).json({ error: String(e?.message || e) });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`API_BASE_URL: ${API_BASE_URL}`);
  console.log(`TOKEN_ENDPOINT: ${TOKEN_ENDPOINT}`);
});
