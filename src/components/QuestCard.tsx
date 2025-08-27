import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import QuestTimer from "./QuestTimer";
import NumericInput from "./NumericInput";
import { type QuestActivity } from "../utils/timeSystem";
import { XPCalculator } from "../utils/xpSystem";

/**
 * ========================================
 * QUEST SYSTEM ARCHITECTURE DOCUMENTATION
 * ========================================
 * 
 * This is a comprehensive Real Life MMORPG quest system with automatic sorting,
 * numeric inputs, negative XP, and Hebrew translations.
 * 
 * QUEST TYPES:
 * 1. Standard Quests: Fixed XP reward (e.g., "Clean Room" = +250 XP)
 * 2. Numeric Quests: XP = baseXP × input value (e.g., "Buy Clothes" = 100 XP × items purchased)
 * 3. Negative Quests: Reduce XP (e.g., "Gossip" = -200 XP, "Smoking" = -50 XP per cigarette)
 * 
 * AUTOMATIC SORTING ORDER:
 * 1. Positive Quests: Legendary → Hard → Medium → Easy (top to bottom)
 * 2. Negative Quests: Always appear at bottom regardless of difficulty
 * 
 * ADDING NEW QUESTS:
 * - Just add anywhere in the quest array with proper difficulty/type labels
 * - System automatically sorts to correct visual position
 * - No manual positioning required!
 */
export interface Quest {
  // CORE PROPERTIES (required for all quests)
  id: string;                    // Unique identifier
  title: string;                 // English title
  description: string;           // English description
  titleHebrew?: string;          // Hebrew title (optional, RTL supported)
  descriptionHebrew?: string;    // Hebrew description (optional, RTL supported)
  xpReward: number;              // Base XP (positive or negative)
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';  // AUTO-SORTS by this!
  icon: string;                  // Emoji icon (e.g., '🏃', '📚', '🚬')
  completed: boolean;            // Completion status
  
  // OPTIONAL PROPERTIES
  seasonal?: boolean;            // Special holiday/seasonal quest badge
  category?: 'daily' | 'weekly' | 'spiritual' | 'work';  // Quest categorization
  
  // QUEST TYPE SYSTEM (determines behavior)
  type?: 'standard' | 'negative' | 'numeric';  // Quest behavior type
  isNegative?: boolean;          // TRUE = quest appears at bottom, shows red colors
  requiresInput?: boolean;       // TRUE = shows numeric input with +/- buttons
  inputType?: 'count' | 'minutes';  // Type of numeric input (affects labels)
  
  /**
   * QUEST TYPE EXAMPLES:
   * 
   * Standard Quest (default):
   * { id: 'clean-room', xpReward: 250, difficulty: 'easy' }
   * 
   * Negative Quest (fixed penalty):
   * { id: 'gossip', xpReward: -200, difficulty: 'easy', isNegative: true }
   * 
   * Numeric Quest (XP per unit):
   * { 
   *   id: 'buy-clothes', 
   *   xpReward: 100,              // 100 XP per item
   *   difficulty: 'medium', 
   *   requiresInput: true, 
   *   inputType: 'count' 
   * }
   * 
   * Negative Numeric Quest (penalty per unit):
   * { 
   *   id: 'smoking', 
   *   xpReward: -75,              // -75 XP per cigarette (updated from -50)
   *   difficulty: 'easy', 
   *   isNegative: true,
   *   requiresInput: true,
   *   inputType: 'count'
   * }
   * 
   * Torah Reading (special case - infinite 20 XP/minute):
   * { 
   *   id: 'torah-reading-minutes', 
   *   xpReward: 20,               // 20 XP per minute, no diminishing returns
   *   difficulty: 'medium',
   *   requiresInput: true,
   *   inputType: 'minutes'
   * }
   */
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
    <Card className={`p-2 md:p-6 transition-all duration-300 ${
      quest.completed 
        ? 'bg-muted/50 border-success/30' 
        : `bg-gradient-to-br from-card to-muted hover:shadow-lg hover:scale-105 border-primary/20 ${quest.seasonal ? 'border-accent/50 bg-gradient-to-br from-accent/5 to-primary/5' : ''}`
    }`} dir={isHebrew ? 'rtl' : 'ltr'}>
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="text-lg flex-shrink-0">{quest.icon}</div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-medium text-sm leading-tight ${quest.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {isHebrew && quest.titleHebrew ? quest.titleHebrew : quest.title}
              </h3>
            </div>
          </div>
          <Badge className={`text-xs px-1.5 py-0.5 flex-shrink-0 ${difficultyColors[quest.difficulty]}`}>
            {t[quest.difficulty]}
          </Badge>
        </div>
        {isExpanded && (
          <p className="text-xs text-muted-foreground mb-2 pl-7">
            {isHebrew && quest.descriptionHebrew ? quest.descriptionHebrew : quest.description}
          </p>
        )}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
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
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Header with icon, title and badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
            <div className="text-2xl flex-shrink-0">{quest.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-base leading-tight break-words ${quest.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {isHebrew && quest.titleHebrew ? quest.titleHebrew : quest.title}
                </h3>
                {quest.seasonal && <Badge className="text-xs bg-accent/20 text-accent flex-shrink-0">🎉 {t.holiday}</Badge>}
              </div>
            </div>
          </div>
          <Badge className={`text-xs px-2 py-1 flex-shrink-0 ${difficultyColors[quest.difficulty]}`}>
            {t[quest.difficulty]}
          </Badge>
        </div>
        
        {/* Description */}
        <div className="mb-3 pl-11">
          <p className={`text-sm text-muted-foreground leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {isHebrew && quest.descriptionHebrew ? quest.descriptionHebrew : quest.description}
          </p>
          {quest.description.length > 50 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 h-6 px-2 text-xs"
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
        <div className="mb-2 md:mb-3 p-2 md:p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm font-medium">
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