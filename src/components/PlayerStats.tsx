import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PlayerStatsProps {
  currentXP: number;
  currentLevel: number;
  onLevelUp?: (newLevel: number) => void;
}

const PlayerStats = ({ currentXP, currentLevel, onLevelUp }: PlayerStatsProps) => {
  const [displayLevel, setDisplayLevel] = useState(currentLevel);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  
  // Calculate XP needed for next level (Supercell-style exponential scaling)
  const getXPForLevel = (level: number) => {
    if (level === 1) return 0;
    if (level <= 5) return Math.floor(1000 * Math.pow(1.8, level - 1));
    if (level <= 10) return Math.floor(5000 * Math.pow(1.6, level - 5));
    if (level <= 20) return Math.floor(25000 * Math.pow(1.4, level - 10));
    return Math.floor(100000 * Math.pow(1.3, level - 20));
  };
  
  const currentLevelXP = getXPForLevel(displayLevel);
  const nextLevelXP = getXPForLevel(displayLevel + 1);
  const progressToNext = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  useEffect(() => {
    // Calculate level based on total XP (Supercell-style)
    let targetLevel = 1;
    let totalXPNeeded = 0;
    
    while (currentXP >= totalXPNeeded + getXPForLevel(targetLevel + 1)) {
      totalXPNeeded += getXPForLevel(targetLevel + 1);
      targetLevel++;
    }
    
    if (targetLevel > displayLevel) {
      setIsLevelingUp(true);
      setTimeout(() => {
        setDisplayLevel(targetLevel);
        onLevelUp?.(targetLevel);
        setTimeout(() => setIsLevelingUp(false), 800);
      }, 300);
    }
  }, [currentXP, displayLevel, onLevelUp]);

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted border-2 border-primary/20 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Level {displayLevel}</h2>
          <p className="text-muted-foreground">Spiritual Warrior</p>
        </div>
        <div className={`text-4xl font-bold text-success ${isLevelingUp ? 'animate-level-up' : ''}`}>
          {currentXP.toLocaleString()} XP
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress to Level {displayLevel + 1}</span>
          <span>{Math.round(progressToNext)}%</span>
        </div>
        <Progress 
          value={Math.max(0, Math.min(100, progressToNext))} 
          className="h-3 bg-muted"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentLevelXP.toLocaleString()} XP</span>
          <span>{nextLevelXP.toLocaleString()} XP</span>
        </div>
      </div>
      
      {isLevelingUp && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg animate-bounce-in">
          <div className="text-center">
            <div className="text-6xl mb-2">🎉</div>
            <div className="text-2xl font-bold text-success">LEVEL UP!</div>
            <div className="text-lg text-foreground">Level {displayLevel}</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PlayerStats;