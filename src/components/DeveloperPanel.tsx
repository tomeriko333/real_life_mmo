import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Settings, Zap, Trophy, RefreshCw, Calendar, Award, Repeat } from "lucide-react";

interface DeveloperPanelProps {
  playerXP: number;
  playerLevel: number;
  streak: number;
  isVisible: boolean;
  endlessQuestMode: boolean;
  onToggle: () => void;
  onAddXP: (amount: number) => void;
  onSetLevel: (level: number) => void;
  onSetStreak: (streak: number) => void;
  onResetProgress: () => void;
  onCompleteAllQuests: () => void;
  onUnlockAllAchievements: () => void;
  onToggleEndlessMode: (enabled: boolean) => void;
  isHebrew?: boolean;
}

const DeveloperPanel = ({
  playerXP,
  playerLevel,
  streak,
  isVisible,
  endlessQuestMode,
  onToggle,
  onAddXP,
  onSetLevel,
  onSetStreak,
  onResetProgress,
  onCompleteAllQuests,
  onUnlockAllAchievements,
  onToggleEndlessMode,
  isHebrew = false
}: DeveloperPanelProps) => {
  const [xpAmount, setXpAmount] = useState(1000);
  const [targetLevel, setTargetLevel] = useState(5);
  const [targetStreak, setTargetStreak] = useState(14);

  const translations = {
    english: {
      title: "🛠️ Developer Panel",
      currentStats: "Current Stats",
      xpControls: "XP Controls",
      levelControls: "Level Controls", 
      streakControls: "Streak Controls",
      quickActions: "Quick Actions",
      addXP: "Add XP",
      setLevel: "Set Level",
      setStreak: "Set Streak",
      resetAll: "Reset All Progress",
      completeAll: "Complete All Quests",
      unlockAll: "Unlock All Achievements",
      presetAmounts: "Preset Amounts",
      customAmount: "Custom Amount",
      apply: "Apply",
      hide: "Hide Panel",
      endlessMode: "Endless Quest Mode",
      endlessModeDesc: "Quests can be clicked repeatedly without cooldown"
    },
    hebrew: {
      title: "🛠️ פאנל פיתוח",
      currentStats: "סטטיסטיקות נוכחיות",
      xpControls: "בקרות XP",
      levelControls: "בקרות רמה",
      streakControls: "בקרות רצף",
      quickActions: "פעולות מהירות",
      addXP: "הוסף XP",
      setLevel: "קבע רמה",
      setStreak: "קבע רצף", 
      resetAll: "אפס הכל",
      completeAll: "השלם כל המשימות",
      unlockAll: "פתח כל הישגים",
      presetAmounts: "כמויות קבועות מראש",
      customAmount: "כמות מותאמת", 
      apply: "החל",
      hide: "הסתר פאנל",
      endlessMode: "מצב משימות אינסופי",
      endlessModeDesc: "ניתן ללחוץ על משימות ללא הגבלה"
    }
  };

  const t = isHebrew ? translations.hebrew : translations.english;

  const xpPresets = [100, 500, 1000, 2500, 5000, 10000];
  const levelPresets = [1, 5, 10, 20, 30, 50];
  const streakPresets = [1, 7, 14, 30, 60, 100];

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-destructive hover:bg-destructive/80"
        size="sm"
      >
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-gradient-to-br from-destructive/5 to-accent/5 border-destructive/20" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {t.title}
          </h2>
          <Button onClick={onToggle} variant="outline" size="sm">
            {t.hide}
          </Button>
        </div>

        {/* Current Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {t.currentStats}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Badge variant="outline" className="p-2 justify-center">
              💎 {playerXP.toLocaleString()} XP
            </Badge>
            <Badge variant="outline" className="p-2 justify-center">
              ⭐ Level {playerLevel}
            </Badge>
            <Badge variant="outline" className="p-2 justify-center">
              🔥 {streak} Day Streak
            </Badge>
          </div>
        </div>

        <Separator className="my-6" />

        {/* XP Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t.xpControls}
          </h3>
          
          <div className="mb-3">
            <Label>{t.presetAmounts}</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {xpPresets.map(amount => (
                <Button
                  key={amount}
                  onClick={() => onAddXP(amount)}
                  variant="outline"
                  size="sm"
                >
                  +{amount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label>{t.customAmount}</Label>
              <Input
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(Number(e.target.value))}
                placeholder="Enter XP amount"
              />
            </div>
            <Button
              onClick={() => onAddXP(xpAmount)}
              className="mt-6"
            >
              {t.addXP}
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Level Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5" />
            {t.levelControls}
          </h3>
          
          <div className="mb-3">
            <Label>{t.presetAmounts}</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {levelPresets.map(level => (
                <Button
                  key={level}
                  onClick={() => onSetLevel(level)}
                  variant="outline"
                  size="sm"
                >
                  Level {level}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label>{t.customAmount}</Label>
              <Input
                type="number"
                value={targetLevel}
                onChange={(e) => setTargetLevel(Number(e.target.value))}
                placeholder="Enter target level"
              />
            </div>
            <Button
              onClick={() => onSetLevel(targetLevel)}
              className="mt-6"
            >
              {t.setLevel}
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Streak Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t.streakControls}
          </h3>
          
          <div className="mb-3">
            <Label>{t.presetAmounts}</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {streakPresets.map(streak => (
                <Button
                  key={streak}
                  onClick={() => onSetStreak(streak)}
                  variant="outline"
                  size="sm"
                >
                  {streak} Days
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label>{t.customAmount}</Label>
              <Input
                type="number"
                value={targetStreak}
                onChange={(e) => setTargetStreak(Number(e.target.value))}
                placeholder="Enter streak days"
              />
            </div>
            <Button
              onClick={() => onSetStreak(targetStreak)}
              className="mt-6"
            >
              {t.setStreak}
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Developer Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Developer Options
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{t.endlessMode}</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.endlessModeDesc}
                </p>
              </div>
              <Switch
                checked={endlessQuestMode}
                onCheckedChange={onToggleEndlessMode}
              />
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {t.quickActions}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={onCompleteAllQuests}
              variant="outline"
              className="border-success/50 hover:bg-success/10"
            >
              {t.completeAll}
            </Button>
            <Button
              onClick={onUnlockAllAchievements}
              variant="outline"
              className="border-accent/50 hover:bg-accent/10"
            >
              {t.unlockAll}
            </Button>
            <Button
              onClick={onResetProgress}
              variant="outline"
              className="border-destructive/50 hover:bg-destructive/10"
            >
              {t.resetAll}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DeveloperPanel;