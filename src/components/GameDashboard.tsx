import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import PlayerStats from "./PlayerStats";
import QuestCard, { Quest } from "./QuestCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GameDashboard = () => {
  const [playerXP, setPlayerXP] = useState(2500);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [quests, setQuests] = useState<Quest[]>([
    // Daily Spiritual & Religious
    {
      id: '1',
      title: 'Read Torah Portion',
      description: 'Complete today\'s Torah reading with focus and intention',
      xpReward: 500,
      difficulty: 'medium',
      icon: '📖',
      completed: false
    },
    {
      id: '2',
      title: 'Morning Prayer',
      description: 'Start the day with morning prayers and gratitude',
      xpReward: 250,
      difficulty: 'easy',
      icon: '🙏',
      completed: false
    },
    {
      id: '3',
      title: 'Shabbat Without Smoking',
      description: 'Complete entire Shabbat without smoking - ultimate discipline',
      xpReward: 1000,
      difficulty: 'legendary',
      icon: '🚭',
      completed: false
    },
    {
      id: '4',
      title: 'Lashon Hara Shield',
      description: 'No gossip all day - guard your speech',
      xpReward: 400,
      difficulty: 'medium',
      icon: '🗣️',
      completed: false
    },
    // Daily Personal Growth
    {
      id: '5',
      title: 'Digital Detox Hour',
      description: 'No phone for 60 minutes - disconnect to reconnect',
      xpReward: 200,
      difficulty: 'easy',
      icon: '📱',
      completed: false
    },
    {
      id: '6',
      title: 'Family Time',
      description: '30 minutes quality time, no devices',
      xpReward: 350,
      difficulty: 'medium',
      icon: '👨‍👩‍👧',
      completed: false
    },
    {
      id: '7',
      title: 'Acts of Kindness',
      description: 'One meaningful helping act for someone today',
      xpReward: 300,
      difficulty: 'medium',
      icon: '🤝',
      completed: false
    },
    {
      id: '8',
      title: 'Gratitude Journal',
      description: 'Write 1 thing you\'re thankful for',
      xpReward: 150,
      difficulty: 'easy',
      icon: '💭',
      completed: false
    },
    // Tzedakah & Work
    {
      id: '9',
      title: 'Tzedakah 5%',
      description: 'Donate 5% of monthly income',
      xpReward: 250,
      difficulty: 'medium',
      icon: '🌱',
      completed: false
    },
    {
      id: '10',
      title: 'Tzedakah 10%',
      description: 'Donate 10% of monthly income - true generosity',
      xpReward: 1000,
      difficulty: 'legendary',
      icon: '🌱',
      completed: false
    },
    {
      id: '11',
      title: 'Attend Work',
      description: 'Show up to work and give your best effort',
      xpReward: 300,
      difficulty: 'easy',
      icon: '💼',
      completed: false
    },
    // Weekly Challenges
    {
      id: '12',
      title: 'Elder Outreach',
      description: 'Call grandparents or elderly relatives',
      xpReward: 300,
      difficulty: 'medium',
      icon: '📞',
      completed: false
    },
    {
      id: '13',
      title: 'Week Warrior',
      description: 'Exercise 3 times this week',
      xpReward: 700,
      difficulty: 'hard',
      icon: '🏃',
      completed: false
    },
    {
      id: '14',
      title: 'Hospitality Hero',
      description: 'Host Shabbat guests this week',
      xpReward: 800,
      difficulty: 'hard',
      icon: '🏠',
      completed: false
    },
    {
      id: '15',
      title: 'Prepare Shabbat Meal',
      description: 'Cook and prepare food for Friday night dinner',
      xpReward: 400,
      difficulty: 'medium',
      icon: '🍷',
      completed: false
    }
  ]);

  const completedQuests = quests.filter(q => q.completed).length;
  const totalQuests = quests.length;

  const handleQuestComplete = (questId: string, xpGained: number) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId ? { ...quest, completed: true } : quest
    ));
    
    setPlayerXP(prev => prev + xpGained);
    
    toast({
      title: "Quest Completed! 🎉",
      description: `You gained ${xpGained} XP! Keep up the great work!`,
    });
  };

  const handleLevelUp = (newLevel: number) => {
    setPlayerLevel(newLevel);
    toast({
      title: "LEVEL UP! 🚀",
      description: `Congratulations! You've reached Level ${newLevel}!`,
    });
  };

  const resetDaily = () => {
    setQuests(prev => prev.map(quest => ({ ...quest, completed: false })));
    toast({
      title: "Daily Reset Complete",
      description: "All quests have been reset for a new day!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Life Quest RPG
          </h1>
          <p className="text-muted-foreground">Level up your life, one mitzvah at a time</p>
        </div>

        {/* Player Stats */}
        <PlayerStats 
          currentXP={playerXP}
          currentLevel={playerLevel}
          onLevelUp={handleLevelUp}
        />

        {/* Daily Progress */}
        <Card className="p-6 bg-gradient-to-br from-card to-muted border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Daily Progress</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {completedQuests}/{totalQuests} Quests Complete
              </span>
              <Button 
                onClick={resetDaily}
                variant="outline"
                size="sm"
                className="border-accent/50 hover:bg-accent/10"
              >
                Reset Daily
              </Button>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedQuests / totalQuests) * 100}%` }}
            />
          </div>
        </Card>

        {/* Quest List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">Today's Quests</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={handleQuestComplete}
              />
            ))}
          </div>
        </div>

        {/* Motivational Footer */}
        <Card className="p-6 text-center bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
          <h3 className="text-lg font-semibold mb-2">Remember</h3>
          <p className="text-muted-foreground italic">
            "Every small act of goodness levels up your soul. Stay consistent, stay strong! 💪"
          </p>
        </Card>
      </div>
    </div>
  );
};

export default GameDashboard;