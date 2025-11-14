import { useEffect, useState, useRef } from "react";
import YouTube from "react-youtube";
import TransportBar from './TransportBar';

export default function YouTubeAudio({ query, durationSec }) {
  // params: query (string), durationSec (number)
  // query is the search term to find the YouTube video
  // durationSec is optional, used to filter results by duration

  // state variables
  const [videoId, setVideoId] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false); // loading state
  const playerRef = useRef(null);
  const [duration, setDuration] = useState(0);
  
  console.log("YouTubeAudio Props:", { query, durationSec });

  // useEffect to fetch video ID based on query
  useEffect(() => {
    // runs whenever query or durationSec changes
    const q = (query ?? "").trim();
    if (!q) {
        setVideoId(null);
        setErr("");
        return;
    }

    const ac = new AbortController();
    const run = async () => {
      try {
        setLoading(true); // start loading state
        setErr("");

        const params = new URLSearchParams({
            q,
            ...(durationSec ? { durationSec: String(durationSec) } : {}) // optional
        });

        const r = await fetch(`/yt/search?${params.toString()}`, {
            signal: ac.signal
        });
        const data = await r.json().catch(() => ({}));

        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
        if (!data.videoId) throw new Error(data.error || "No match");

        setVideoId(data.videoId);
        setDuration(data.durationSec || 0);
      } catch (e) {
        if (e.name !== "AbortError") {
            setVideoId(null);
            setDuration(0);
            setErr(e.message || "Lookup failed");
        }
      } finally {
            setLoading(false);
      }
    };

    run(); // invoke the async function
    return () => ac.abort();
  }, [query, durationSec]);

  if (err) return <div className="text-red-500">Error: {err}</div>;
  if (loading || !videoId) return <div>Finding a playable match…</div>;

  return (
    <div className="w-full max-w-[720px]">
        <YouTube
        videoId={videoId}
        opts={{
            width: "100%",
            height: "64", // slim “audio bar”
            playerVars: { enablejsapi: 1, modestbranding: 1, rel: 0, controls: 1, iv_load_policy: 3 }
        }}
        onReady={(e) => { playerRef.current = e.target; }}
        />
        <TransportBar 
            ref={playerRef}
            currentTime={0} 
            duration={duration}
            onSeek={(time) => {
                if (playerRef.current) {
                    playerRef.current.seekTo(time, true);
                }
            }} 
        />

    </div>
  );
}
