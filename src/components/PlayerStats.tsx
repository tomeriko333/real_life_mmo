import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LevelingSystem } from "../utils/levelingSystem";

interface PlayerStatsProps {
  currentXP: number;
  currentLevel: number;
  onLevelUp?: (newLevel: number) => void;
  isHebrew?: boolean;
}

const PlayerStats = ({ currentXP, currentLevel, onLevelUp, isHebrew = false }: PlayerStatsProps) => {
  const [displayLevel, setDisplayLevel] = useState(currentLevel);
  
  // Update displayLevel when currentLevel changes (for dev panel resets)
  useEffect(() => {
    setDisplayLevel(currentLevel);
  }, [currentLevel]);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  
  // Use the new advanced leveling system
  const levelInfo = LevelingSystem.getLevelInfo(currentXP);
  
  // Level-based titles
  const getTitleForLevel = (level: number) => {
    const titles = {
      english: [
        { min: 1, title: "Seeker", icon: "🌱" },
        { min: 3, title: "Student", icon: "📚" },
        { min: 5, title: "Devotee", icon: "🙏" },
        { min: 8, title: "Guardian", icon: "🛡️" },
        { min: 12, title: "Spiritual Warrior", icon: "⚔️" },
        { min: 16, title: "Shabbat Master", icon: "🕯️" },
        { min: 20, title: "Mitzvah Champion", icon: "🏆" },
        { min: 25, title: "Torah Scholar", icon: "📖" },
        { min: 30, title: "Righteous Soul", icon: "✨" },
        { min: 40, title: "Light Bearer", icon: "🔥" },
        { min: 50, title: "Holy Sage", icon: "👑" }
      ],
      hebrew: [
        { min: 1, title: "מבקש", icon: "🌱" },
        { min: 3, title: "תלמיד", icon: "📚" },
        { min: 5, title: "נאמן", icon: "🙏" },
        { min: 8, title: "שומר", icon: "🛡️" },
        { min: 12, title: "לוחם רוחני", icon: "⚔️" },
        { min: 16, title: "מאסטר שבת", icon: "🕯️" },
        { min: 20, title: "אלוף מצוות", icon: "🏆" },
        { min: 25, title: "חכם תורה", icon: "📖" },
        { min: 30, title: "נשמה צדיקה", icon: "✨" },
        { min: 40, title: "נושא אור", icon: "🔥" },
        { min: 50, title: "חכם קדוש", icon: "👑" }
      ]
    };
    
    const titleList = isHebrew ? titles.hebrew : titles.english;
    
    // Find the highest applicable title
    let currentTitle = titleList[0];
    for (const title of titleList) {
      if (level >= title.min) {
        currentTitle = title;
      } else {
        break;
      }
    }
    return currentTitle;
  };

  const currentTitle = getTitleForLevel(displayLevel);
  
  const translations = {
    english: {
      level: "Level",
      progressTo: "Progress to Level",
      levelUp: "LEVEL UP!"
    },
    hebrew: {
      level: "רמה",
      progressTo: "התקדמות לרמה",
      levelUp: "עלייה ברמה!"
    }
  };
  
  const t = isHebrew ? translations.hebrew : translations.english;
  
  useEffect(() => {
    const targetLevel = levelInfo.currentLevel;
    
    if (targetLevel > displayLevel) {
      setIsLevelingUp(true);
      setTimeout(() => {
        setDisplayLevel(targetLevel);
        onLevelUp?.(targetLevel);
        setTimeout(() => setIsLevelingUp(false), 800);
      }, 300);
    }
  }, [currentXP, displayLevel, onLevelUp, levelInfo.currentLevel]);

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted border-2 border-primary/20 animate-slide-up" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.level} {displayLevel}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentTitle.icon}</span>
            <p className="text-muted-foreground font-medium">{currentTitle.title}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{t.progressTo} {displayLevel + 1}</span>
          <span>{Math.round(levelInfo.progressToNext)}%</span>
        </div>
        <Progress 
          value={Math.max(0, Math.min(100, levelInfo.progressToNext))} 
          className="h-3 bg-muted"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{levelInfo.currentLevelXP.toLocaleString()} XP</span>
          <span>{levelInfo.nextLevelXP.toLocaleString()} XP</span>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-1">
          {levelInfo.xpToNext.toLocaleString()} XP to next level
        </div>
      </div>
      
      {isLevelingUp && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg animate-bounce-in">
          <div className="text-center">
            <div className="text-6xl mb-2">🎉</div>
            <div className="text-2xl font-bold text-success">{t.levelUp}</div>
            <div className="text-lg text-foreground">{t.level} {displayLevel}</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PlayerStats;