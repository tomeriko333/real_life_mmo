import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Moon, Sun, Globe, Settings as SettingsIcon } from "lucide-react";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  isHebrew: boolean;
  onLanguageChange: (value: boolean) => void;
}

const Settings = ({
  isOpen,
  onClose,
  darkMode,
  onDarkModeChange,
  isHebrew,
  onLanguageChange
}: SettingsProps) => {
  const translations = {
    english: {
      title: "Settings",
      description: "Customize your experience",
      language: "Language",
      hebrew: "Hebrew",
      english: "English",
      theme: "Theme",
      light: "Light Mode",
      dark: "Dark Mode"
    },
    hebrew: {
      title: "הגדרות",
      description: "התאם את החוויה שלך",
      language: "שפה",
      hebrew: "עברית",
      english: "אנגלית",
      theme: "ערכת נושא",
      light: "מצב בהיר",
      dark: "מצב כהה"
    }
  };

  const t = isHebrew ? translations.hebrew : translations.english;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir={isHebrew ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>
            {t.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Language Setting */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base font-medium">{t.language}</Label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {isHebrew ? t.english : t.hebrew}
                </span>
                <Switch
                  checked={isHebrew}
                  onCheckedChange={onLanguageChange}
                />
                <span className="text-sm font-medium">
                  {isHebrew ? t.hebrew : t.english}
                </span>
              </div>
            </div>
          </Card>

          {/* Theme Setting */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label className="text-base font-medium">{t.theme}</Label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={darkMode}
                  onCheckedChange={onDarkModeChange}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;