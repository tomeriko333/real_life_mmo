import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Sparkles } from "lucide-react";

interface CharacterCreationProps {
  onComplete: (playerData: { name: string; gender: string }) => void;
  isHebrew?: boolean;
}

const CharacterCreation = ({ onComplete, isHebrew = false }: CharacterCreationProps) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const translations = {
    english: {
      title: "Create Your Character",
      subtitle: "Begin your real-life adventure",
      nameLabel: "Your Name",
      namePlaceholder: "Enter your name...",
      genderLabel: "Gender",
      male: "Male",
      female: "Female",
      nonBinary: "Non-Binary",
      prefer: "Prefer not to say",
      startJourney: "Start My Journey",
      creating: "Creating Character...",
      nameRequired: "Please enter your name",
      genderRequired: "Please select your gender",
      welcome: "Welcome to your new adventure!",
      nameTip: "This will appear on your XP bar",
      genderTip: "This helps personalize your experience"
    },
    hebrew: {
      title: "צור את הדמות שלך",
      subtitle: "התחל את ההרפתקה האמיתית שלך",
      nameLabel: "השם שלך",
      namePlaceholder: "הכנס את השם שלך...",
      genderLabel: "מגדר",
      male: "זכר",
      female: "נקבה", 
      nonBinary: "נון-בינארי",
      prefer: "מעדיף לא לומר",
      startJourney: "התחל את המסע שלי",
      creating: "יוצר דמות...",
      nameRequired: "אנא הכנס את שמך",
      genderRequired: "אנא בחר את המגדר שלך",
      welcome: "ברוך הבא להרפתקה החדשה שלך!",
      nameTip: "זה יופיע בשורת ה-XP שלך",
      genderTip: "זה עוזר להתאים את החוויה שלך"
    }
  };

  const t = isHebrew ? translations.hebrew : translations.english;

  const handleSubmit = () => {
    if (!name.trim()) {
      alert(t.nameRequired);
      return;
    }
    if (!gender) {
      alert(t.genderRequired);
      return;
    }

    setIsCreating(true);
    
    // Simulate character creation process
    setTimeout(() => {
      onComplete({ name: name.trim(), gender });
    }, 1500);
  };

  const genderOptions = [
    { value: "male", label: t.male, emoji: "🧑" },
    { value: "female", label: t.female, emoji: "👩" },
    { value: "non-binary", label: t.nonBinary, emoji: "🧑‍🎤" },
    { value: "prefer-not-to-say", label: t.prefer, emoji: "❓" }
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-success/10 flex items-center justify-center p-4"
      dir={isHebrew ? 'rtl' : 'ltr'}
    >
      <Card className="w-full max-w-lg p-8 bg-gradient-to-br from-card to-muted border-primary/20 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-accent to-success rounded-full flex items-center justify-center mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t.subtitle}
          </p>
        </div>

        {/* Character Creation Form */}
        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              {t.nameLabel}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="h-12"
              maxLength={20}
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              {t.nameTip}
            </p>
          </div>

          {/* Gender Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              {t.genderLabel}
            </Label>
            <RadioGroup 
              value={gender} 
              onValueChange={setGender}
              disabled={isCreating}
              className="grid grid-cols-2 gap-3"
            >
              {genderOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-y-0 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <span className="text-lg">{option.emoji}</span>
                    <span>{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {t.genderTip}
            </p>
          </div>

          {/* Start Button */}
          <Button 
            onClick={handleSubmit}
            disabled={isCreating || !name.trim() || !gender}
            className="w-full h-12 text-lg bg-gradient-to-r from-accent to-success hover:shadow-lg hover:shadow-accent/25 border-0 mt-8"
          >
            {isCreating ? (
              <>
                <Sparkles className={`w-5 h-5 ${isHebrew ? 'ml-2' : 'mr-2'} animate-spin`} />
                {t.creating}
              </>
            ) : (
              t.startJourney
            )}
          </Button>
        </div>

        {/* Character Preview */}
        {name && gender && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">{t.welcome}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">
                {genderOptions.find(g => g.value === gender)?.emoji}
              </span>
              <span className="font-semibold text-lg">{name}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CharacterCreation;