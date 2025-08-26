import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { XPCalculator } from "../utils/xpSystem";

interface MultiplierDisplayProps {
  streak: number;
  categoriesCompletedToday: string[];
  questsCompletedToday: number;
  isHebrew?: boolean;
}

const MultiplierDisplay = ({ 
  streak, 
  categoriesCompletedToday, 
  questsCompletedToday,
  isHebrew = false 
}: MultiplierDisplayProps) => {
  const streakMultiplier = XPCalculator.calculateStreakMultiplier(streak);
  const varietyMultiplier = XPCalculator.calculateVarietyMultiplier(categoriesCompletedToday);
  const completionBonus = XPCalculator.calculateCompletionBonus(questsCompletedToday);

  const translations = {
    english: {
      title: "Active Multipliers",
      streak: "Streak Bonus",
      variety: "Variety Bonus", 
      completion: "Completion Bonus",
      categories: "Categories Today",
      totalMultiplier: "Total Multiplier"
    },
    hebrew: {
      title: "מכפילים פעילים",
      streak: "בונוס רצף",
      variety: "בונוס מגוון",
      completion: "בונוס השלמה",
      categories: "קטגוריות היום",
      totalMultiplier: "מכפיל כולל"
    }
  };

  const t = isHebrew ? translations.hebrew : translations.english;
  
  const totalMultiplier = streakMultiplier * varietyMultiplier * completionBonus;
  const hasAnyBonus = totalMultiplier > 1;

  if (!hasAnyBonus) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-accent/5 to-success/5 border-accent/20" dir={isHebrew ? 'rtl' : 'ltr'}>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        ⚡ {t.title}
      </h3>
      
      <div className="space-y-2">
        {streakMultiplier > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              🔥 {t.streak}
            </span>
            <Badge variant="outline" className="bg-success/20 text-success border-success/30">
              {((streakMultiplier - 1) * 100).toFixed(0)}%
            </Badge>
          </div>
        )}
        
        {varietyMultiplier > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              🌈 {t.variety}
            </span>
            <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
              {((varietyMultiplier - 1) * 100).toFixed(0)}%
            </Badge>
          </div>
        )}
        
        {completionBonus > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              🎯 {t.completion}
            </span>
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
              {((completionBonus - 1) * 100).toFixed(0)}%
            </Badge>
          </div>
        )}
        
        <div className="pt-2 border-t border-muted">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              ✨ {t.totalMultiplier}
            </span>
            <Badge className="bg-gradient-to-r from-accent to-success text-white">
              {((totalMultiplier - 1) * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>
        
        {categoriesCompletedToday.length > 0 && (
          <div className="pt-2">
            <div className="text-xs text-muted-foreground mb-1">{t.categories}:</div>
            <div className="flex gap-1 flex-wrap">
              {categoriesCompletedToday.map(category => (
                <Badge key={category} variant="outline" className="text-xs capitalize">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MultiplierDisplay;