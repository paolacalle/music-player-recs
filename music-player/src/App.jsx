import React from 'react'
import './App.css'
import './styles/music-player.css';
import './styles/icon-button.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MusicPlayer from './components/MusicPlayer';
import Header from "./components/Header";


function App() {
  return (
    <div >
      <Router>
        <Header />
      </Router>
      <MusicPlayer />
    </div>

  );
}

export default App
