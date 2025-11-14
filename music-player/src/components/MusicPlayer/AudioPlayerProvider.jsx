// AudioPlayerProvider.jsx
import React, { createContext, useContext, useState, useRef, useEffect } from "react";


// This file would contain the context and provider for managing audio playback state
// including play, pause, seek, volume control, and track management functionalities.

const getClientToken = async () => {
  const r = await fetch("/auth/client-credentials", { credentials: "include" });
  const j = await r.json();
  return j.access_token;
};

const parseData = (data) => {
  return {
      trackTitle: data.name,
      trackArtist: data.artists.map(artist => artist.name).join(", "),
      album: data.album.name,
      year: data.album.release_date.split("-")[0],
      coverURL: data.album.images[0]?.url || "",
      duration: data.duration_ms / 1000, // convert to seconds
      audioURL: data.preview_url // using preview URL for demo purposes
  }
}

// fetch a track by its ID
export const fetchTrackById = async (trackId) => {
    const t = await getClientToken();
    const response = await fetch(`/spotify/tracks/${trackId}`, {
        headers: {
            "Authorization": `Bearer ${t}`
        }
    });
    const data = await response.json();

    return parseData(data);
};

export const fetchTrackBySearch = async (trackName) => {
    const t = await getClientToken();
    const response = await fetch(`/spotify/search?type=track&q=${encodeURIComponent(trackName)}`, {
        headers: {
            "Authorization": `Bearer ${t}`
        }
    });
    const data = await response.json();
    console.log("Search Track Data:", data);

    return parseData(data.tracks.items[0]);
};
