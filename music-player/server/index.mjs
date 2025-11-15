import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import spotifyRouter from "./routes/spotify.mjs";
import youtubeRouter from "./routes/youtube.mjs";

// The index.mjs file serves as the main entry point for the Express server application.
// It sets up middleware, loads environment variables, and
// mounts route handlers for Spotify and YouTube-related endpoints.

// load env vars

dotenv.config();
const app = express();

const {
  ALLOW_ORIGIN,
  PORT = 8888,
  API_BASE_URL = "https://api.spotify.com/v1",
  TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token",
} = process.env;

// --- core middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ALLOW_ORIGIN || "https://127.0.0.1:5173",
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);


// -- health check endpoint ---
// Health check endpoint to verify server is running
app.get("/health", (_req, res) => res.json({ ok: true }));

// make env vars available in req.app.locals
app.locals.spotifyConfig = {
  API_BASE_URL,
  TOKEN_ENDPOINT,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
};

// --- mount routers ---
app.use(spotifyRouter);
app.use(youtubeRouter);

// --- start server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});