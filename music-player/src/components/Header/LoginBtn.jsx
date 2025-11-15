import React, { useState } from "react";

function LoginSpotifyBtn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);

    // Go directly to backend, no proxy.
    window.location.href = "http://127.0.0.1:8888/spotify/login";
  };

  return (
    <button className="login-btn" onClick={handleLogin} disabled={isLoading}>
      {isLoading ? "Redirecting..." : "Connect Spotify"}
    </button>
  );
}

function LoginYTBtn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);

    // Go directly to backend, no proxy.
    window.location.href = "http://127.0.0.1:8888/yt/login";
  };

  return (
    <button className="login-btn" onClick={handleLogin} disabled={isLoading}>
      {isLoading ? "Redirecting..." : "Connect YouTube"}
    </button>
  );
}

export { LoginSpotifyBtn, LoginYTBtn };
