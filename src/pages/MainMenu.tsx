import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Settings, Trophy } from "lucide-react";

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
  isHebrew?: boolean;
}

const MainMenu = ({ onPlay, onSettings, isHebrew = false }: MainMenuProps) => {
  const translations = {
    english: {
      title: "Real Life MMORPG",
      subtitle: "Level Up Your Life",
      play: "Play",
      settings: "Settings",
      tagline: "Transform your daily life into an epic adventure"
    },
    hebrew: {
      title: "MMORPG בחיים האמיתיים",
      subtitle: "העלה רמה בחיים שלך",
      play: "שחק",
      settings: "הגדרות",
      tagline: "הפוך את החיים היומיומיים שלך להרפתקה אפית"
    }
  };

  const t = isHebrew ? translations.hebrew : translations.english;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-success/10 flex items-center justify-center p-4"
      dir={isHebrew ? 'rtl' : 'ltr'}
    >
      <Card className="w-full max-w-md p-8 text-center bg-gradient-to-br from-card to-muted border-primary/20 shadow-2xl">
        {/* Game Logo/Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            {t.subtitle}
          </p>
        </div>

        {/* Tagline */}
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {t.tagline}
        </p>

        {/* Menu Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={onPlay}
            className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 border-0"
          >
            <Play className={`w-5 h-5 ${isHebrew ? 'ml-2' : 'mr-2'}`} />
            {t.play}
          </Button>
          
          <Button 
            onClick={onSettings}
            variant="outline"
            className="w-full h-12 text-lg border-primary/20 hover:bg-primary/10"
          >
            <Settings className={`w-5 h-5 ${isHebrew ? 'ml-2' : 'mr-2'}`} />
            {t.settings}
          </Button>
        </div>

        {/* Version/Credits */}
        <div className="mt-8 text-xs text-muted-foreground">
          <p>Real Life MMORPG v2.0</p>
          <p className="mt-1">🎮 Level up your real life!</p>
        </div>
      </Card>
    </div>
  );
};

export default MainMenu;