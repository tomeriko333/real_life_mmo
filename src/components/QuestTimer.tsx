import { Badge } from "@/components/ui/badge";
import { TimeSystem, type QuestActivity } from "../utils/timeSystem";

interface QuestTimerProps {
  questId: string;
  activity?: QuestActivity;
  currentTime: Date;
  isHebrew?: boolean;
}

const QuestTimer = ({ questId, activity, currentTime, isHebrew = false }: QuestTimerProps) => {
  const timeRemaining = TimeSystem.getTimeUntilNextDay();
  const formattedTime = TimeSystem.formatTimeRemaining(timeRemaining);
  
  const translations = {
    english: {
      streak: "Streak",
      days: "days",
      multiplier: "multiplier",
      resetIn: "Resets in",
      newQuest: "New quest!"
    },
    hebrew: {
      streak: "רצף",
      days: "ימים",
      multiplier: "מכפיל",
      resetIn: "מתאפס בעוד",
      newQuest: "משימה חדשה!"
    }
  };
  
  const t = isHebrew ? translations.hebrew : translations.english;
  
  // Calculate multiplier
  const consecutiveDays = activity?.consecutiveDays || 0;
  const multiplier = TimeSystem.calculateConsistencyMultiplier(consecutiveDays);
  
  // Check if multiplier should reset soon
  const shouldReset = activity && TimeSystem.shouldResetMultiplier(activity.lastCompletedDate);
  
  return (
    <div className="flex flex-wrap gap-1 text-xs" dir={isHebrew ? 'rtl' : 'ltr'}>
      {/* Consecutive Days Badge */}
      {consecutiveDays > 0 && (
        <Badge 
          variant="outline" 
          className="bg-success/10 text-success border-success/30 text-xs"
        >
          🔥 {consecutiveDays} {t.days}
        </Badge>
      )}
      
      {/* Multiplier Badge */}
      {multiplier > 1 && (
        <Badge 
          variant="outline"
          className="bg-accent/10 text-accent border-accent/30 text-xs"
        >
          ⚡ {((multiplier - 1) * 100).toFixed(0)}% {t.multiplier}
        </Badge>
      )}
      
      {/* Reset Warning */}
      {shouldReset && (
        <Badge 
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/30 text-xs"
        >
          ⚠️ {t.resetIn} {formattedTime}
        </Badge>
      )}
      
      {/* New Quest Indicator */}
      {!activity && (
        <Badge 
          variant="outline"
          className="bg-primary/10 text-primary border-primary/30 text-xs"
        >
          ✨ {t.newQuest}
        </Badge>
      )}
      
      {/* Daily Reset Timer */}
      <Badge 
        variant="outline"
        className="bg-muted/50 text-muted-foreground border-muted/30 text-xs"
      >
        🕒 {formattedTime}
      </Badge>
    </div>
  );
};

export default QuestTimer;