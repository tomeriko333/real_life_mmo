import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import QuestTimer from "./QuestTimer";
import NumericInput from "./NumericInput";
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
  type?: 'standard' | 'negative' | 'numeric';
  isNegative?: boolean;
  requiresInput?: boolean;
  inputType?: 'count' | 'minutes';
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
  const [numericValue, setNumericValue] = useState(1);
  
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
  
  // Calculate base XP for this quest
  const calculateBaseXP = () => {
    if (quest.type === 'numeric') {
      if (quest.id === 'torah-reading-minutes') {
        // Torah reading special rule: Same XP rate infinitely
        return quest.xpReward * numericValue;
      } else {
        // Regular numeric quest (like buy clothes)
        return quest.xpReward * numericValue;
      }
    }
    return quest.xpReward; // Standard quest or negative quest
  };

  const baseXP = calculateBaseXP();
  const xpResult = XPCalculator.calculateFinalXP(
    baseXP,
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
      onComplete(quest.id, baseXP);
      setIsCompleting(false);
      // Reset numeric value after completion for negative quests
      if (quest.isNegative && quest.requiresInput) {
        setNumericValue(1);
      }
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

      {/* Numeric Input for quests that require it */}
      {quest.requiresInput && (
        <div className="mb-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {quest.inputType === 'count' ? 
                (isHebrew ? 'כמות:' : 'Count:') : 
                (isHebrew ? 'דקות:' : 'Minutes:')}
            </span>
            <span className="text-xs text-muted-foreground">
              {quest.inputType === 'count' ? 
                (isHebrew ? `${Math.abs(quest.xpReward)} נקודות לפריט` : `${Math.abs(quest.xpReward)} XP per item`) :
                (isHebrew ? `${quest.xpReward} נקודות לדקה` : `${quest.xpReward} XP per minute`)}
            </span>
          </div>
          <NumericInput
            value={numericValue}
            onChange={setNumericValue}
            isHebrew={isHebrew}
            min={quest.isNegative ? 1 : 0}
            max={999}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${baseXP >= 0 ? 'text-success' : 'text-destructive'}`}>
            {baseXP >= 0 ? '+' : ''}{Math.round(baseXP)} XP
          </span>
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
        <div className={`absolute inset-0 flex items-center justify-center rounded-lg ${
          baseXP >= 0 ? 'bg-success/20' : 'bg-destructive/20'
        }`}>
          <div className="text-center animate-bounce-in">
            <div className={`text-3xl mb-1 ${baseXP >= 0 ? 'text-success' : 'text-destructive'}`}>
              {baseXP >= 0 ? '+' : ''}{Math.round(baseXP)}
            </div>
            <div className={`font-bold ${baseXP >= 0 ? 'text-success' : 'text-destructive'}`}>
              {baseXP >= 0 ? t.xpGained : 'XP LOST!'}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuestCard;