import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LevelingSystem } from "../utils/levelingSystem";
import { Zap, Star, ChevronDown, ChevronUp } from "lucide-react";

interface PersistentXPBarProps {
  playerName: string;
  playerGender: string;
  currentXP: number;
  currentLevel: number;
  isHebrew?: boolean;
}

const PersistentXPBar = ({ 
  playerName, 
  playerGender, 
  currentXP, 
  currentLevel, 
  isHebrew = false 
}: PersistentXPBarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const levelInfo = LevelingSystem.getLevelInfo(currentXP);
  const progressPercentage = levelInfo.progressToNext;

  // Gender-based emoji
  const getPlayerEmoji = () => {
    switch (playerGender) {
      case 'male': return '🧑';
      case 'female': return '👩';
      case 'non-binary': return '🧑‍🎤';
      default: return '👤';
    }
  };

  // Level-based title
  const getLevelTitle = (level: number) => {
    const titles = {
      english: [
        { min: 1, title: "Seeker" },
        { min: 5, title: "Adventurer" },
        { min: 10, title: "Explorer" },
        { min: 20, title: "Champion" },
        { min: 30, title: "Hero" },
        { min: 50, title: "Legend" },
        { min: 75, title: "Master" },
        { min: 100, title: "Grandmaster" }
      ],
      hebrew: [
        { min: 1, title: "מחפש" },
        { min: 5, title: "הרפתקן" },
        { min: 10, title: "חוקר" },
        { min: 20, title: "אלוף" },
        { min: 30, title: "גיבור" },
        { min: 50, title: "אגדה" },
        { min: 75, title: "מאסטר" },
        { min: 100, title: "גראנד מאסטר" }
      ]
    };

    const titleList = isHebrew ? titles.hebrew : titles.english;
    
    for (let i = titleList.length - 1; i >= 0; i--) {
      if (level >= titleList[i].min) {
        return titleList[i].title;
      }
    }
    return titleList[0].title;
  };

  const translations = {
    english: {
      level: "Level",
      xpToNext: "XP to next level",
      totalXP: "Total XP"
    },
    hebrew: {
      level: "רמה",
      xpToNext: "XP לרמה הבאה",
      totalXP: "סה\"כ XP"
    }
  };

  const t = isHebrew ? translations.hebrew : translations.english;

  return (
    <Card 
      className={`fixed top-4 z-50 transition-all duration-300 bg-gradient-to-r from-card/95 to-muted/95 backdrop-blur-md border-primary/20 shadow-lg ${
        isCollapsed 
          ? 'left-4 p-2 w-auto' 
          : 'left-4 p-3 min-w-[280px]'
      }`}
      dir={isHebrew ? 'rtl' : 'ltr'}
    >
      {isCollapsed ? (
        // Collapsed View - Just essentials
        <div className="flex items-center gap-2">
          <span className="text-lg">{getPlayerEmoji()}</span>
          <Badge variant="outline" className="text-xs px-2 py-0 h-5">
            <Star className="w-3 h-3 mr-1" />
            L{currentLevel}
          </Badge>
          <span className="text-xs font-medium">
            {currentXP.toLocaleString()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="h-6 w-6 p-0 hover:bg-primary/10"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        // Expanded View - Full details
        <>
          {/* Header with collapse button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{getPlayerEmoji()}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">{playerName}</h3>
                  <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                    <Star className="w-3 h-3 mr-1" />
                    {t.level} {currentLevel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getLevelTitle(currentLevel)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-6 w-6 p-0 hover:bg-primary/10"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" />
                {currentXP.toLocaleString()} XP
              </span>
              <span className="text-muted-foreground">
                {levelInfo.xpForNext ? `${levelInfo.xpUntilNext.toLocaleString()} ${t.xpToNext}` : 'Max Level!'}
              </span>
            </div>
            
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-muted"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{levelInfo.xpForCurrent?.toLocaleString() || 0}</span>
              <span>{levelInfo.xpForNext?.toLocaleString() || 'Max'}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-between mt-2 text-xs">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {t.totalXP}: {currentXP.toLocaleString()}
            </Badge>
            {levelInfo.xpForNext && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                {Math.round(progressPercentage)}% ➜ {currentLevel + 1}
              </Badge>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default PersistentXPBar;