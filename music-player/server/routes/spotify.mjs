// server/routes/spotify.mjs
import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto"; // for generating random state strings


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

// --- Our Client credentials flow ---
// Mainly used for non-user-specific data access or app-level access
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

// --- User Authorization Flow ---

router.get("/spotify/login", (_req, res) => {
  console.log("Initiating Spotify login flow");
  const state = crypto.randomBytes(16).toString("hex");

  // configure for https 
  res.cookie("spotify_auth_state", state, {
    // httpOnly: true,
    sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
  });

  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-library-read",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: scopes,
    state,
    client_id: SPOTIFY_CLIENT_ID,
  });


  const authorizeUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  try {
    console.log("Redirecting to Spotify authorize URL:", authorizeUrl);
    res.redirect(authorizeUrl);
  } catch (err) {
    console.error("Error constructing Spotify authorize URL:", err);
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


// we set the callback URL in our Spotify app
// this is where Spotify redirects after user authorizes
// we would handle the exchange of code for tokens here

router.get("/auth/spotify/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error("Spotify error:", error);
    return res.status(400).send("Spotify authorization failed");
  }

  const storedState = req.cookies["spotify_auth_state"];
  if (!state || state !== storedState) {
    console.error("State mismatch:", { state, storedState });
    return res.status(400).send("State mismatch");
  }

  res.clearCookie("spotify_auth_state");

  // TODO: exchange `code` for tokens at https://accounts.spotify.com/api/token

  const tokenResponse = await axios.post(TOKEN_ENDPOINT, new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  }).toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
  }).catch(err => {
    console.error("Error exchanging code for tokens:", err.response?.data || err.message);
    return null;
  });

  if (!tokenResponse || !tokenResponse.data) {
    return res.status(500).send("Failed to obtain tokens from Spotify");
  }

  const { access_token, refresh_token, expires_in } = tokenResponse.data;

  // TODO: In a real app, you'd store these tokens in a database or session
  console.log("Obtained tokens:", { access_token, refresh_token, expires_in });

  // We will store in session 
  req.session = req.session || {};
  req.session.spotify = {
    access_token,
    refresh_token,
    expires_at: Date.now() + expires_in * 1000, // expiry timestamp
  };

  // session allows us to avoid exposing tokens in URL params

  // print session info for debugging
  console.log("Session after Spotify callback:", req.session);

  return res.redirect("http://localhost:5173?spotify=ok");
});

// export the router for use in main server file to mount it
export default router;