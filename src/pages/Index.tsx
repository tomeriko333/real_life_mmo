import { useState, useEffect } from "react";
import GameDashboard from "@/components/GameDashboard";
import MainMenu from "./MainMenu";
import CharacterCreation from "./CharacterCreation";
import Settings from "@/components/Settings";

interface PlayerData {
  name: string;
  gender: string;
}

type GameState = 'menu' | 'character-creation' | 'playing';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isHebrew, setIsHebrew] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage and system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const savedPlayer = localStorage.getItem('playerData');
    const savedLanguage = localStorage.getItem('gameLanguage');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedPlayer) {
      setPlayerData(JSON.parse(savedPlayer));
    }
    
    if (savedLanguage) {
      setIsHebrew(savedLanguage === 'hebrew');
    }
    
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handlePlay = () => {
    if (playerData) {
      setGameState('playing');
    } else {
      setGameState('character-creation');
    }
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleLanguageChange = (newIsHebrew: boolean) => {
    setIsHebrew(newIsHebrew);
    localStorage.setItem('gameLanguage', newIsHebrew ? 'hebrew' : 'english');
  };

  const handleDarkModeChange = (newDarkMode: boolean) => {
    setDarkMode(newDarkMode);
  };

  const handleCharacterCreated = (data: PlayerData) => {
    setPlayerData(data);
    localStorage.setItem('playerData', JSON.stringify(data));
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  if (gameState === 'menu') {
    return (
      <MainMenu 
        onPlay={handlePlay}
        onSettings={handleSettings}
        isHebrew={isHebrew}
      />
    );
  }

  if (gameState === 'character-creation') {
    return (
      <CharacterCreation 
        onComplete={handleCharacterCreated}
        isHebrew={isHebrew}
      />
    );
  }

  return (
    <>
      <GameDashboard 
        playerData={playerData}
        isHebrew={isHebrew}
        onBackToMenu={handleBackToMenu}
      />
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={darkMode}
        onDarkModeChange={handleDarkModeChange}
        isHebrew={isHebrew}
        onLanguageChange={handleLanguageChange}
      />
    </>
  );
};

export default Index;
