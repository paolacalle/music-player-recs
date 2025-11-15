import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";
import  {LoginSpotifyBtn, LoginYTBtn} from "./Header/LoginBtn.jsx";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current || !hamburgerRef.current) return;

      const target = event.target as Node | null;

      if (
        target &&
        !menuRef.current.contains(target) &&
        !hamburgerRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left: Logo / Brand */}
        <div className="navbar-logo">
          <Link to="/" className="navbar-logo-link" onClick={closeMenu}>
            Spotify Vibe Matcher
          </Link>
        </div>

        {/* Menu */}
        <ul
          ref={menuRef}
          className={`navbar-menu ${isOpen ? "open" : ""}`}
        >
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link" onClick={closeMenu}>
              About
            </Link>
          </li>
          <li className="navbar-item">
            <LoginSpotifyBtn />
          </li>
          <li className="navbar-item">
            <LoginYTBtn />
          </li>
        </ul>

        {/* Hamburger (mobile) */}
        <button
          ref={hamburgerRef}
          className={`hamburger ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>
    </nav>
  );
}

export default Header;
