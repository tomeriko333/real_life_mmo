import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  isHebrew?: boolean;
}

const AchievementBadge = ({ achievement, isHebrew = false }: AchievementBadgeProps) => {
  const rarityColors = {
    common: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
    rare: 'bg-blue-500/20 text-blue-600 border-blue-500/30', 
    epic: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
    legendary: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-500/50'
  };

  return (
    <div className={`p-3 rounded-lg border transition-all duration-300 ${
      achievement.unlocked 
        ? 'bg-card border-primary/20 hover:shadow-lg hover:scale-105' 
        : 'bg-muted/50 border-muted-foreground/20 opacity-60'
    }`} dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold text-sm ${
              achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {achievement.name}
            </h4>
            <Badge className={rarityColors[achievement.rarity]}>
              {achievement.rarity}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;