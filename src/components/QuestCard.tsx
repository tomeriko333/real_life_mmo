import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  icon: string;
  completed: boolean;
}

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string, xpGained: number) => void;
}

const QuestCard = ({ quest, onComplete }: QuestCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const difficultyColors = {
    easy: 'bg-success/20 text-success border-success/30',
    medium: 'bg-secondary/20 text-secondary border-secondary/30',
    hard: 'bg-accent/20 text-accent border-accent/30',
    legendary: 'bg-gradient-to-r from-accent to-success text-white border-accent/50'
  };

  const handleComplete = () => {
    if (quest.completed) return;
    
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
        : 'bg-gradient-to-br from-card to-muted hover:shadow-lg hover:scale-105 border-primary/20'
    } ${isCompleting ? 'animate-bounce-in' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{quest.icon}</div>
          <div>
            <h3 className={`font-semibold ${quest.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {quest.title}
            </h3>
            <p className="text-sm text-muted-foreground">{quest.description}</p>
          </div>
        </div>
        <Badge className={difficultyColors[quest.difficulty]}>
          {quest.difficulty.toUpperCase()}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-success font-bold">+{quest.xpReward} XP</span>
          {quest.completed && <span className="text-xs text-success">✓ Completed</span>}
        </div>
        
        {!quest.completed && (
          <Button 
            onClick={handleComplete}
            disabled={isCompleting}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 border-0"
          >
            {isCompleting ? 'Completing...' : 'Complete'}
          </Button>
        )}
      </div>
      
      {isCompleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-success/20 rounded-lg animate-bounce-in">
          <div className="text-center">
            <div className="text-3xl mb-1">+{quest.xpReward}</div>
            <div className="text-success font-bold">XP GAINED!</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuestCard;