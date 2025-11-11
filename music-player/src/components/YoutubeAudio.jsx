import { useEffect, useState, useRef } from "react";
import YouTube from "react-youtube";

export default function YouTubeAudio({ query, durationSec }) {
  const [videoId, setVideoId] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const q = (query ?? "").trim();
    if (!q) {
      setVideoId(null);
      setErr("");
      return;
    }

    const ac = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setErr("");

        const params = new URLSearchParams({
          q,
          ...(durationSec ? { durationSec: String(durationSec) } : {})
        });

        const r = await fetch(`/yt/search?${params.toString()}`, {
          signal: ac.signal
        });
        const data = await r.json().catch(() => ({}));

        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
        if (!data.videoId) throw new Error(data.error || "No match");

        setVideoId(data.videoId);
      } catch (e) {
        if (e.name !== "AbortError") {
          setVideoId(null);
          setErr(e.message || "Lookup failed");
        }
      } finally {
        setLoading(false);
      }
    };

    run();
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
      <div className="flex gap-2 mt-2">
        <button onClick={() => playerRef.current?.playVideo()}>Play</button>
        <button onClick={() => playerRef.current?.pauseVideo()}>Pause</button>
        <button onClick={() => playerRef.current?.seekTo(0, true)}>↺</button>
      </div>
    </div>
  );
}
