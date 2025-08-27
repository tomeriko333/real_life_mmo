import { useState, useEffect } from "react";
import GameDashboard from "@/components/GameDashboard";
import MainMenu from "./MainMenu";
import CharacterCreation from "./CharacterCreation";

interface PlayerData {
  name: string;
  gender: string;
}

type GameState = 'menu' | 'character-creation' | 'playing';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isHebrew, setIsHebrew] = useState(false);

  useEffect(() => {
    const savedPlayer = localStorage.getItem('playerData');
    const savedLanguage = localStorage.getItem('gameLanguage');
    
    if (savedPlayer) {
      setPlayerData(JSON.parse(savedPlayer));
    }
    
    if (savedLanguage) {
      setIsHebrew(savedLanguage === 'hebrew');
    }
  }, []);

  const handlePlay = () => {
    if (playerData) {
      setGameState('playing');
    } else {
      setGameState('character-creation');
    }
  };

  const handleSettings = () => {
    // Toggle language for now - can expand later
    const newLanguage = !isHebrew;
    setIsHebrew(newLanguage);
    localStorage.setItem('gameLanguage', newLanguage ? 'hebrew' : 'english');
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
    <GameDashboard 
      playerData={playerData}
      isHebrew={isHebrew}
      onBackToMenu={handleBackToMenu}
    />
  );
};

export default Index;
