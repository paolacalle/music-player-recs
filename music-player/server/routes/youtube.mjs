// server/routes/youtube.mjs
import { Router } from "express";
import { fetchHTML, findBestVideo } from "../lib/youtubeSearch.mjs";
import dotenv from "dotenv";
import crypto from "crypto"; // for generating random state strings

dotenv.config();

const { YOUTUBE_CLIENT_ID } = process.env;

// This router handles YouTube-related API endpoints,
// including search functionalities and login flow.

const router = Router();

// YouTube search endpoint
router.get("/yt/search", async (req, res) => {
    console.log("YT search request:", req.query);

    // try to process the request
    // if successful, return JSON with videoId and durationSec
    // on error, return appropriate HTTP status and error message
    try {
        // validate query parameter -- required 
        // trim whitespace
        // if missing, return 400 error
        const raw = (req.query.q || "").trim(); 
        if (!raw) return res.status(400).json({ error: "Missing q" });

        // parse optional durationSec parameter
        const wantSec = req.query.durationSec ? Number(req.query.durationSec) : null;

        // construct YouTube search URL
        // we use hl=en and gl=US for consistent results
        // we also URL-encode the search query to handle special characters
        const searchUrl = `https://www.youtube.com/results?hl=en&gl=US&search_query=${encodeURIComponent(
            raw
        )}`;

        console.log("Fetching YouTube search URL:", searchUrl);

        // fetch the HTML content of the search results page
        const html = await fetchHTML(searchUrl);
        // parse the HTML to find the best matching video based on duration
        const result = await findBestVideo(html, wantSec);

        // if successful, return JSON with videoId and durationSec
        // if no match found, return 404 error
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

// youtube login route
router.get("/yt/login", (req, res) => {
    console.log("Initiating YouTube login flow");
    const state = crypto.randomBytes(16).toString("hex");

    // configure for https
    res.cookie("youtube_auth_state", state, {
        // httpOnly: true,
        sameSite: "lax",
        // secure: process.env.NODE_ENV === "production",
    });

    const scopes = [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube.force-ssl",
    ].join(" ");

    const params = new URLSearchParams({
        response_type: "code",
        redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
        scope: scopes,
        state,
        client_id: YOUTUBE_CLIENT_ID,
    });

    const authorizeUrl = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;

    try {
        console.log("Redirecting to YouTube authorize URL:", authorizeUrl);
        res.redirect(authorizeUrl);
    } catch (err) {
        console.error("Error constructing YouTube authorize URL:", err);
    }
});


export default router;