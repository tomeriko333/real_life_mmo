import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import QuestTimer from "./QuestTimer";
import { type QuestActivity } from "../utils/timeSystem";
import { XPCalculator } from "../utils/xpSystem";

export interface Quest {
  id: string;
  title: string;
  description: string;
  titleHebrew?: string;
  descriptionHebrew?: string;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  icon: string;
  completed: boolean;
  seasonal?: boolean;
  category?: 'daily' | 'weekly' | 'spiritual' | 'work';
}

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string, xpGained: number) => void;
  isHebrew?: boolean;
  endlessMode?: boolean;
  activity?: QuestActivity;
  currentTime?: Date;
  streak?: number;
  categoriesCompletedToday?: string[];
  questsCompletedToday?: number;
}

const QuestCard = ({ quest, onComplete, isHebrew = false, endlessMode = false, activity, currentTime, streak = 0, categoriesCompletedToday = [], questsCompletedToday = 0 }: QuestCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const translations = {
    english: {
      holiday: "Holiday",
      less: "Less",
      more: "More",
      completed: "Completed",
      complete: "Complete",
      completing: "Completing...",
      xpGained: "XP GAINED!",
      easy: "EASY",
      medium: "MEDIUM", 
      hard: "HARD",
      legendary: "LEGENDARY"
    },
    hebrew: {
      holiday: "חג",
      less: "פחות",
      more: "יותר",
      completed: "הושלמה",
      complete: "השלם",
      completing: "משלים...",
      xpGained: "נקודות התקבלו!",
      easy: "קל",
      medium: "בינוני",
      hard: "קשה", 
      legendary: "אגדי"
    }
  };
  
  const t = isHebrew ? translations.hebrew : translations.english;
  
  // Calculate final XP with all multipliers
  const consecutiveDays = activity?.consecutiveDays || 0;
  const isFirstQuestOfDay = questsCompletedToday === 0;
  const xpResult = XPCalculator.calculateFinalXP(
    quest.xpReward,
    streak,
    categoriesCompletedToday,
    quest.difficulty,
    questsCompletedToday + 1,
    isFirstQuestOfDay,
    consecutiveDays
  );
  
  const difficultyColors = {
    easy: 'bg-green-500/30 text-green-700 border-green-500/50',
    medium: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    hard: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
    legendary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500/50'
  };

  const handleComplete = () => {
    if (quest.completed && !endlessMode) return;
    
    setIsCompleting(true);
    setTimeout(() => {
      onComplete(quest.id, quest.xpReward);
      setIsCompleting(false);
    }, 600);
  };

  return (
    <Card className={`p-4 transition-all duration-300 ${
      quest.completed 
        ? 'bg-muted/50 border-success/30' 
        : `bg-gradient-to-br from-card to-muted hover:shadow-lg hover:scale-105 border-primary/20 ${quest.seasonal ? 'border-accent/50 bg-gradient-to-br from-accent/5 to-primary/5' : ''}`
    }`} dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{quest.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${quest.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {isHebrew && quest.titleHebrew ? quest.titleHebrew : quest.title}
              </h3>
              {quest.seasonal && <Badge className="text-xs bg-accent/20 text-accent">🎉 {t.holiday}</Badge>}
            </div>
            <p className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
              {isHebrew && quest.descriptionHebrew ? quest.descriptionHebrew : quest.description}
            </p>
            {quest.description.length > 50 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 h-6 px-2 text-xs"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    {t.less}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    {t.more}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        <Badge className={difficultyColors[quest.difficulty]}>
          {t[quest.difficulty]}
        </Badge>
      </div>
      
      {/* Quest Timer and Consistency Info */}
      {currentTime && (
        <div className="mb-3">
          <QuestTimer
            questId={quest.id}
            activity={activity}
            currentTime={currentTime}
            isHebrew={isHebrew}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-success font-bold">+{xpResult.finalXP} XP</span>
          {quest.completed && <span className="text-xs text-success">✓ {t.completed}</span>}
        </div>
        
        {(!quest.completed || endlessMode) && (
          <Button 
            onClick={handleComplete}
            disabled={isCompleting}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 border-0"
          >
            {isCompleting ? t.completing : t.complete}
          </Button>
        )}
      </div>
      
      {isCompleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-success/20 rounded-lg">
          <div className="text-center animate-bounce-in">
            <div className="text-3xl mb-1">+{xpResult.finalXP}</div>
            <div className="text-success font-bold">{t.xpGained}</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuestCard;