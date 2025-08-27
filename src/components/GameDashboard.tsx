import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import PlayerStats from "./PlayerStats";
import QuestCard, { Quest } from "./QuestCard";
import AchievementBadge from "./AchievementBadge";
import DeveloperPanel from "./DeveloperPanel";
import MultiplierDisplay from "./MultiplierDisplay";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Globe, Award } from "lucide-react";
import PersistentXPBar from "./PersistentXPBar";
import { XPCalculator, type QuestCompletion } from "../utils/xpSystem";
import { LevelingSystem } from "../utils/levelingSystem";
import { TimeSystem, type QuestActivity } from "../utils/timeSystem";

interface GameDashboardProps {
  playerData: { name: string; gender: string } | null;
  isHebrew?: boolean;
  onBackToMenu?: () => void;
  onLanguageChange?: (isHebrew: boolean) => void;
  onDarkModeChange?: (darkMode: boolean) => void;
}

const GameDashboard = ({ playerData, isHebrew: propIsHebrew = false, onBackToMenu, onLanguageChange, onDarkModeChange }: GameDashboardProps) => {
  const [playerXP, setPlayerXP] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [questCompletions, setQuestCompletions] = useState<QuestCompletion[]>([]);
  const [categoriesCompletedToday, setCategoriesCompletedToday] = useState<string[]>([]);
  const [questsCompletedToday, setQuestsCompletedToday] = useState(0);
  const [varietyScore, setVarietyScore] = useState(0);
  const [showDeveloperPanel, setShowDeveloperPanel] = useState(false);
  const [endlessQuestMode, setEndlessQuestMode] = useState(false);
  const [questActivities, setQuestActivities] = useState<Record<string, QuestActivity>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage and system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  // Use propIsHebrew directly instead of local state
  const isHebrew = propIsHebrew;
  const [showAchievements, setShowAchievements] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<{ show: boolean; level: number }>({ show: false, level: 1 });
  const [achievements, setAchievements] = useState([
    {
      id: 'first-quest',
      name: 'First Steps',
      description: 'Complete your first quest',
      icon: '🎯',
      rarity: 'common' as const,
      unlocked: false
    },
    {
      id: 'streak-warrior',
      name: 'Streak Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      rarity: 'rare' as const,
      unlocked: streak >= 7
    },
    {
      id: 'level-master',
      name: 'Level Master',
      description: 'Reach level 5',
      icon: '⭐',
      rarity: 'epic' as const,
      unlocked: playerLevel >= 5
    },
    {
      id: 'xp-hunter',
      name: 'XP Hunter',
      description: 'Accumulate 10,000 XP',
      icon: '💎',
      rarity: 'legendary' as const,
      unlocked: playerXP >= 10000
    },
    {
      id: 'shabbat-keeper',
      name: 'Shabbat Guardian',
      description: 'Complete a Shabbat without smoking',
      icon: '🕯️',
      rarity: 'legendary' as const,
      unlocked: false
    }
  ]);
  // Seasonal Events for Jewish Holidays
  const [seasonalQuests] = useState([
    {
      id: 'rosh-hashanah',
      title: 'Rosh Hashanah Reflection',
      titleHebrew: 'התבוננות ראש השנה',
      description: 'Complete full day of prayer and reflection',
      descriptionHebrew: 'השלם יום מלא של תפילה והתבוננות',
      xpReward: 2000,
      difficulty: 'legendary' as const,
      icon: '🍯',
      completed: false,
      seasonal: true
    },
    {
      id: 'yom-kippur',
      title: 'Yom Kippur Fast',
      titleHebrew: 'צום יום הכיפורים',
      description: 'Complete 24-hour fast with prayer',
      descriptionHebrew: 'השלם צום של 24 שעות עם תפילה',
      xpReward: 3000,
      difficulty: 'legendary' as const,
      icon: '🕯️',
      completed: false,
      seasonal: true
    }
  ]);

  /**
   * ==================================================================================
   * 🎮 REAL LIFE MMORPG QUEST SYSTEM - COMPREHENSIVE DOCUMENTATION FOR FUTURE ME
   * ==================================================================================
   * 
   * If you're reading this with no memory of this conversation, here's EVERYTHING you
   * need to know about our sophisticated quest system:
   * 
   * ⚡ KEY BREAKTHROUGH: AUTOMATIC QUEST SORTING SYSTEM
   * ===================================================
   * We solved the problem of manual quest positioning! Now you can add quests 
   * ANYWHERE in this array with proper labels, and they automatically appear 
   * in the correct visual order. No more manual positioning required!
   * 
   * 📊 AUTOMATIC SORTING ORDER (see sortedQuests logic below):
   * ==========================================================
   * 1. POSITIVE QUESTS: Legendary (top) → Hard → Medium → Easy (bottom)
   * 2. NEGATIVE QUESTS: Always at very bottom, BUT also sorted Legendary → Easy within negatives
   * 
   * 🎯 HOW TO ADD NEW QUESTS (SUPER SIMPLE):
   * =======================================
   * 1. Add quest object ANYWHERE in this array
   * 2. Set difficulty: 'legendary' | 'hard' | 'medium' | 'easy'  
   * 3. Set isNegative: true (if it's a penalty quest)
   * 4. System automatically sorts to correct visual position!
   * 
   * 🌈 DIFFICULTY COLOR SYSTEM (applied automatically):
   * ===================================================
   * - Easy: Green (🟢 bg-green-500/30 text-green-700)
   * - Medium: Yellow (🟡 bg-yellow-500/20 text-yellow-600)  
   * - Hard: Orange (🟠 bg-orange-500/20 text-orange-600)
   * - Legendary: Purple-Pink Gradient (🟣 from-purple-600 to-pink-600)
   * 
   * 🔢 QUEST TYPES & BEHAVIORS:
   * ===========================
   * 
   * 1️⃣ STANDARD QUEST (default):
   * {
   *   id: 'clean-room',
   *   title: 'Clean Your Room',
   *   titleHebrew: 'נקה את החדר שלך',  // Hebrew is AS IMPORTANT as English!
   *   xpReward: 250,                     // Fixed XP amount
   *   difficulty: 'easy',               // 🚨 THIS DETERMINES VISUAL ORDER! 🚨
   *   icon: '🧹',
   *   completed: false,
   *   category: 'daily'                 // Optional categorization
   * }
   * 
   * 2️⃣ NUMERIC INPUT QUEST (XP per unit):
   * {
   *   id: 'buy-clothes',
   *   title: 'Buy Clothes (Count)',
   *   xpReward: 100,                     // 100 XP PER ITEM purchased
   *   difficulty: 'medium',             // 🚨 AUTO-SORTS to medium section! 🚨
   *   requiresInput: true,              // Shows +/- buttons with numeric input
   *   inputType: 'count',               // 'count' or 'minutes' (affects UI labels)
   *   type: 'numeric'
   * }
   * 
   * 3️⃣ NEGATIVE QUEST (penalties):
   * {
   *   id: 'gossip',
   *   title: 'Gossip',
   *   titleHebrew: 'לשון הרע',
   *   xpReward: -200,                    // NEGATIVE XP (red colors, "XP LOST!")
   *   difficulty: 'easy',               // Still sorts by difficulty within negatives
   *   isNegative: true,                 // 🚨 ALWAYS appears at bottom! 🚨
   *   type: 'negative'
   * }
   * 
   * 4️⃣ NEGATIVE NUMERIC QUEST (penalty per unit):
   * {
   *   id: 'smoking',
   *   title: 'Smoking',
   *   xpReward: -75,                     // -75 XP PER CIGARETTE
   *   difficulty: 'easy',
   *   isNegative: true,                 // Red colors, appears at bottom
   *   requiresInput: true,              // Shows numeric input
   *   inputType: 'count',
   *   type: 'numeric'
   * }
   * 
   * 🕐 SPECIAL CASE - TORAH READING:
   * ================================
   * Torah reading gives 20 XP per minute with NO diminishing returns (infinite rate).
   * This is handled in QuestCard.tsx calculateBaseXP() function.
   * 
   * 🌍 HEBREW TRANSLATION REQUIREMENTS:
   * ==================================
   * Hebrew translations are AS IMPORTANT as English. Always provide:
   * - titleHebrew: 'Hebrew title here'
   * - descriptionHebrew: 'Hebrew description here'
   * RTL (right-to-left) text is fully supported throughout the system.
   * 
   * 📱 NUMERIC INPUT SYSTEM FEATURES:
   * =================================
   * - Plus/Minus buttons with disabled states
   * - Long-press acceleration (5→20 steps/second)
   * - Manual text entry with validation  
   * - Floor (0) and ceiling (999) limits
   * - Hebrew RTL support
   * - Touch/mobile support
   * 
   * 🔄 AUTOMATIC FEATURES THAT WORK FOR YOU:
   * ========================================
   * ✅ Quest sorting by difficulty (handled in sortedQuests below)
   * ✅ Color coding by difficulty (handled in QuestCard.tsx)
   * ✅ XP calculation with multipliers (handled in xpSystem.ts)
   * ✅ Hebrew RTL text rendering (handled throughout UI)
   * ✅ Achievement unlocking (handled in achievement system)
   * ✅ Progress persistence (handled in localStorage)
   * 
   * 🚨 IMPORTANT FOR FUTURE CHANGES:
   * ================================
   * When you make major architectural changes (like we did with automatic sorting),
   * ALWAYS document them here with:
   * - What changed and why
   * - How it affects quest addition process  
   * - Any new properties or behaviors
   * - Examples for future reference
   * 
   * This documentation ensures you can confidently modify the system even with
   * zero memory of previous work!
   * 
   * ==================================================================================
   */
  const [quests, setQuests] = useState<Quest[]>([
    // LEGENDARY QUESTS - Highest Impact (AUTO-SORTS TO TOP)
    {
      id: 'fix-broken',
      title: 'Fix Something Broken',
      titleHebrew: 'תקן משהו שבור',
      description: 'Use your hands to repair and restore',
      descriptionHebrew: 'השתמש בידיים שלך כדי לתקן ולשקם',
      xpReward: 2000,
      difficulty: 'legendary',
      icon: '🔧',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'try-new-hobby',
      title: 'Try New Hobby',
      titleHebrew: 'נסה תחביב חדש',
      description: 'Explore a new passion or interest',
      descriptionHebrew: 'חקור תשוקה או עניין חדש',
      xpReward: 1500,
      difficulty: 'legendary',
      icon: '🎯',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'tzedakah-10',
      title: 'Tzedakah 10%',
      titleHebrew: 'צדקה 10%',
      description: 'Donate 10% of monthly income - true generosity and trust',
      descriptionHebrew: 'תרום 10% מההכנסה החודשית - נדיבות אמיתית ובטחון',
      xpReward: 1000,
      difficulty: 'legendary',
      icon: '🌱',
      completed: false,
      category: 'daily'
    },
    {
      id: 'shabbat-no-smoking',
      title: 'Shabbat Without Smoking',
      titleHebrew: 'שבת ללא עישון',
      description: 'Complete entire Shabbat without smoking - ultimate discipline',
      descriptionHebrew: 'השלם שבת שלם ללא עישון - משמעת מוחלטת',
      xpReward: 1000,
      difficulty: 'legendary',
      icon: '🚭',
      completed: false,
      category: 'spiritual'
    },

    // HARD QUESTS - Significant Challenges
    {
      id: 'sell-unused',
      title: 'Sell Something Unused',
      titleHebrew: 'מכור משהו שלא בשימוש',
      description: 'Declutter and earn some money',
      descriptionHebrew: 'נקה בלגן והרוויח קצת כסף',
      xpReward: 1000,
      difficulty: 'hard',
      icon: '💰',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'host-shabbat',
      title: 'Host Shabbat',
      titleHebrew: 'אירוח שבת',
      description: 'Have guests for Shabbat dinner - practice hospitality',
      descriptionHebrew: 'קיים אורחים לסעודת שבת - תרגל הכנסת אורחים',
      xpReward: 800,
      difficulty: 'hard',
      icon: '🏠',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'exercise-3x',
      title: 'Exercise 3x',
      titleHebrew: 'פעילות גופנית פי 3',
      description: 'Three workouts this week - strengthen your body',
      descriptionHebrew: 'שלוש אימונים השבוע - חזק את הגוף',
      xpReward: 700,
      difficulty: 'hard',
      icon: '🏃',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'learn-new-skills',
      title: 'Learn New Skills',
      titleHebrew: 'למד כישורים חדשים',
      description: 'Invest in your personal development',
      descriptionHebrew: 'השקע בפיתוח האישי שלך',
      xpReward: 600,
      difficulty: 'hard',
      icon: '📚',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'clean-house',
      title: 'Clean Your House',
      titleHebrew: 'נקה את הבית שלך',
      description: 'Deep clean your entire living space',
      descriptionHebrew: 'נקה בעמקות את כל חלל המגורים שלך',
      xpReward: 500,
      difficulty: 'hard',
      icon: '🏠',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'eat-healthy-day',
      title: 'Eat Healthy Full Day',
      titleHebrew: 'אכל בריא יום שלם',
      description: 'Nourish your body with wholesome foods',
      descriptionHebrew: 'הזן את הגוף שלך עם מזון בריא',
      xpReward: 500,
      difficulty: 'hard',
      icon: '🥗',
      completed: false,
      category: 'daily'
    },
    {
      id: 'meet-new-people',
      title: 'Meet New People',
      titleHebrew: 'פגוש אנשים חדשים',
      description: 'Expand your social circle and make connections',
      descriptionHebrew: 'הרחב את המעגל החברתי שלך וצור קשרים',
      xpReward: 450,
      difficulty: 'hard',
      icon: '🤝',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'teach-someone',
      title: 'Teach Someone Something New',
      titleHebrew: 'למד מישהו משהו חדש',
      description: 'Share your knowledge and help others grow',
      descriptionHebrew: 'שתף את הידע שלך ועזור לאחרים לצמוח',
      xpReward: 450,
      difficulty: 'hard',
      icon: '👨‍🏫',
      completed: false,
      category: 'weekly'
    },

    // MEDIUM QUESTS - Moderate Challenges
    {
      id: 'tzedakah-5',
      title: 'Tzedakah 5%',
      titleHebrew: 'צדקה 5%',
      description: 'Donate 5% of monthly income - practice generosity',
      descriptionHebrew: 'תרום 5% מההכנסה החודשית - תרגל נדיבות',
      xpReward: 500,
      difficulty: 'medium',
      icon: '🌱',
      completed: false,
      category: 'daily'
    },
    {
      id: 'torah-reading',
      title: 'Read Torah Portion',
      titleHebrew: 'קריאת פרשת השבוע',
      description: 'Complete today\'s Torah reading with focus and intention',
      descriptionHebrew: 'השלם את קריאת התורה של היום בריכוז וכוונה',
      xpReward: 500,
      difficulty: 'medium',
      icon: '📖',
      completed: false,
      category: 'spiritual'
    },
    {
      id: 'learn-new-meal',
      title: 'Learn to Make New Meal',
      titleHebrew: 'למד להכין ארוחה חדשה',
      description: 'Expand your culinary skills',
      descriptionHebrew: 'הרחב את כישורי הבישול שלך',
      xpReward: 400,
      difficulty: 'medium',
      icon: '🍳',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'flowers-mom',
      title: 'Bring Flowers to Mom',
      titleHebrew: 'הבא פרחים לאמא',
      description: 'Show appreciation with a beautiful gesture',
      descriptionHebrew: 'הראה הערכה עם מחווה יפה',
      xpReward: 400,
      difficulty: 'medium',
      icon: '🌹',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'help-neighbor',
      title: 'Help a Neighbor',
      titleHebrew: 'עזור לשכן',
      description: 'Be a good member of your community',
      descriptionHebrew: 'היה חבר טוב בקהילה שלך',
      xpReward: 400,
      difficulty: 'medium',
      icon: '🏘️',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'family-time',
      title: 'Family Time',
      titleHebrew: 'זמן משפחה',
      description: '30 min quality time, no devices - strengthen relationships',
      descriptionHebrew: '30 דקות זמן איכות, ללא מכשירים - חזק את הקשרים',
      xpReward: 350,
      difficulty: 'medium',
      icon: '👨‍👩‍👧',
      completed: false,
      category: 'daily'
    },
    {
      id: 'flowers-girlfriend',
      title: 'Bring Flowers to Girlfriend',
      titleHebrew: 'הבא פרחים לחברה',
      description: 'Surprise someone special in your life',
      descriptionHebrew: 'הפתע מישהי מיוחדת בחיים שלך',
      xpReward: 350,
      difficulty: 'medium',
      icon: '🌻',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'live-show',
      title: 'Go to Live Show',
      titleHebrew: 'לך להופעה חיה',
      description: 'Experience live music or performance',
      descriptionHebrew: 'חווה מוזיקה חיה או הופעה',
      xpReward: 350,
      difficulty: 'medium',
      icon: '🎭',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'wake-before-sunrise',
      title: 'Wake Up Before Sunrise',
      titleHebrew: 'קום לפני הזריחה',
      description: 'Start your day with the sun',
      descriptionHebrew: 'התחל את היום עם השמש',
      xpReward: 350,
      difficulty: 'medium',
      icon: '🌅',
      completed: false,
      category: 'daily'
    },
    {
      id: 'acts-kindness',
      title: 'Acts of Kindness',
      titleHebrew: 'מעשי חסד',
      description: 'One meaningful helping act for someone today',
      descriptionHebrew: 'מעשה עזרה משמעותי אחד למישהו היום',
      xpReward: 300,
      difficulty: 'medium',
      icon: '🤝',
      completed: false,
      category: 'daily'
    },
    {
      id: 'elder-outreach',
      title: 'Elder Outreach',
      titleHebrew: 'יצירת קשר עם קשישים',
      description: 'Call grandparents or elderly relatives - honor your elders',
      descriptionHebrew: 'התקשר לסבים או קרובי משפחה קשישים - כבד את הזקנים',
      xpReward: 300,
      difficulty: 'medium',
      icon: '📞',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'running',
      title: 'Go Running',
      titleHebrew: 'רוץ',
      description: 'Get your heart pumping with a good run',
      descriptionHebrew: 'הזז את הלב עם ריצה טובה',
      xpReward: 300,
      difficulty: 'medium',
      icon: '🏃‍♂️',
      completed: false,
      category: 'daily'
    },
    {
      id: 'attend-work',
      title: 'Attend Work',
      titleHebrew: 'הגיע לעבודה',
      description: 'Show up to work and give your best effort',
      descriptionHebrew: 'הגיע לעבודה ותן את המיטב שלך',
      xpReward: 300,
      difficulty: 'medium',
      icon: '💼',
      completed: false,
      category: 'work'
    },
    {
      id: 'art-exhibition',
      title: 'Go to Art Exhibition',
      titleHebrew: 'לך לתערוכת אמנות',
      description: 'Feed your soul with culture and creativity',
      descriptionHebrew: 'הזן את הנשמה שלך עם תרבות ויצירתיות',
      xpReward: 300,
      difficulty: 'medium',
      icon: '🎨',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'buy-new-clothes',
      title: 'Buy New Clothes',
      titleHebrew: 'קנה בגדים חדשים',
      description: 'Refresh your wardrobe and style',
      descriptionHebrew: 'רענן את הארון והסטיל שלך',
      xpReward: 350,
      difficulty: 'medium',
      icon: '👕',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'buy-clothes',
      title: 'Buy Clothes (Count)',
      titleHebrew: 'קנה בגדים (כמות)',
      description: 'Enter number of clothing items purchased - refresh your style',
      descriptionHebrew: 'הכנס מספר פריטי הלבשה שנרכשו - רענן את הסטיל',
      xpReward: 100,
      difficulty: 'medium',
      icon: '🛍️',
      completed: false,
      category: 'weekly',
      type: 'numeric',
      requiresInput: true,
      inputType: 'count'
    },
    {
      id: 'torah-reading-minutes',
      title: 'Torah Study (Minutes)',
      titleHebrew: 'לימוד תורה (דקות)',
      description: 'Enter minutes of Torah study - spiritual growth through learning',
      descriptionHebrew: 'הכנס דקות לימוד תורה - צמיחה רוחנית באמצעות לימוד',
      xpReward: 20,
      difficulty: 'medium',
      icon: '⏰',
      completed: false,
      category: 'spiritual',
      type: 'numeric',
      requiresInput: true,
      inputType: 'minutes'
    },

    // EASY QUESTS - Accessible Daily Habits
    {
      id: 'morning-prayer',
      title: 'Morning Prayer',
      titleHebrew: 'תפילת שחרית',
      description: 'Start the day with morning prayers and gratitude',
      descriptionHebrew: 'התחל את היום בתפילת בוקר והכרת הטוב',
      xpReward: 250,
      difficulty: 'easy',
      icon: '🙏',
      completed: false,
      category: 'spiritual'
    },
    {
      id: 'clean-room',
      title: 'Clean Your Room',
      titleHebrew: 'נקה את החדר שלך',
      description: 'Organize and clean your personal space',
      descriptionHebrew: 'ארגן ונקה את החלל האישי שלך',
      xpReward: 250,
      difficulty: 'easy',
      icon: '🧹',
      completed: false,
      category: 'daily'
    },
    {
      id: 'fun-sports',
      title: 'Play Fun Sports',
      titleHebrew: 'שחק ספורט כיף',
      description: 'Enjoy physical activity with friends',
      descriptionHebrew: 'תהנה מפעילות גופנית עם חברים',
      xpReward: 250,
      difficulty: 'easy',
      icon: '⚽',
      completed: false,
      category: 'daily'
    },
    {
      id: 'learn-5-words',
      title: 'Learn 5 New Words',
      titleHebrew: 'למד 5 מילים חדשות',
      description: 'Expand your vocabulary and knowledge',
      descriptionHebrew: 'הרחב את אוצר המילים והידע שלך',
      xpReward: 250,
      difficulty: 'easy',
      icon: '📖',
      completed: false,
      category: 'daily'
    },
    {
      id: 'walk-in-nature',
      title: 'Take Walk in Nature',
      titleHebrew: 'צא לטיול בטבע',
      description: 'Connect with the natural world',
      descriptionHebrew: 'התחבר עם העולם הטבעי',
      xpReward: 250,
      difficulty: 'easy',
      icon: '🌳',
      completed: false,
      category: 'daily'
    },
    {
      id: 'digital-detox',
      title: 'Digital Detox',
      titleHebrew: 'ניתוק דיגיטלי',
      description: '60 min no phone - disconnect to reconnect with yourself and others',
      descriptionHebrew: '60 דקות ללא טלפון - התנתק כדי להתחבר מחדש לעצמך ולאחרים',
      xpReward: 200,
      difficulty: 'easy',
      icon: '📱',
      completed: false,
      category: 'daily'
    },
    {
      id: 'call-family',
      title: 'Call Your Family',
      titleHebrew: 'התקשר למשפחה',
      description: 'Connect with your loved ones',
      descriptionHebrew: 'התחבר עם היקרים לך',
      xpReward: 200,
      difficulty: 'easy',
      icon: '📞',
      completed: false,
      category: 'daily'
    },
    {
      id: 'clean-fridge',
      title: 'Clean Your Fridge',
      titleHebrew: 'נקה את המקרר',
      description: 'Organize and clean your refrigerator',
      descriptionHebrew: 'ארגן ונקה את המקרר שלך',
      xpReward: 200,
      difficulty: 'easy',
      icon: '❄️',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'clean-computer',
      title: 'Clean Your Computer',
      titleHebrew: 'נקה את המחשב',
      description: 'Organize files and optimize your system',
      descriptionHebrew: 'ארגן קבצים ומטב את המערכת שלך',
      xpReward: 200,
      difficulty: 'easy',
      icon: '💻',
      completed: false,
      category: 'weekly'
    },
    {
      id: 'drink-8-glasses',
      title: 'Drink 8 Glasses of Water',
      titleHebrew: 'שתה 8 כוסות מים',
      description: 'Stay hydrated throughout the day',
      descriptionHebrew: 'הישאר מהודר לאורך היום',
      xpReward: 200,
      difficulty: 'easy',
      icon: '💧',
      completed: false,
      category: 'daily'
    },
    {
      id: 'gratitude',
      title: 'Gratitude',
      titleHebrew: 'הכרת הטוב',
      description: 'Write 1 thing you\'re thankful for - cultivate appreciation',
      descriptionHebrew: 'כתוב דבר אחד שאתה אסיר תודה עליו - טפח הערכה',
      xpReward: 150,
      difficulty: 'easy',
      icon: '💭',
      completed: false,
      category: 'daily'
    },
    {
      id: 'clean-phone',
      title: 'Clean Your Phone',
      titleHebrew: 'נקה את הטלפון',
      description: 'Declutter apps and organize your digital space',
      descriptionHebrew: 'נקה אפליקציות וארגן את החלל הדיגיטלי',
      xpReward: 150,
      difficulty: 'easy',
      icon: '📱',
      completed: false,
      category: 'weekly'
    },

    // NEGATIVE XP MISSIONS
    {
      id: 'gossip',
      title: 'Gossip',
      titleHebrew: 'לשון הרע',
      description: 'Negative speech about others - damages your spiritual progress',
      descriptionHebrew: 'דיבור שלילי על אחרים - פוגע בהתקדמות הרוחנית',
      xpReward: -200,
      difficulty: 'easy',
      icon: '🗣️',
      completed: false,
      category: 'daily',
      type: 'negative',
      isNegative: true
    },
    {
      id: 'smoking',
      title: 'Smoking',
      titleHebrew: 'עישון',
      description: 'Enter number of cigarettes smoked - harms your body and mind',
      descriptionHebrew: 'הכנס מספר סיגריות שעישנת - פוגע בגוף ובנפש',
      xpReward: -75,
      difficulty: 'easy',
      icon: '🚬',
      completed: false,
      category: 'daily',
      type: 'numeric',
      isNegative: true,
      requiresInput: true,
      inputType: 'count'
    },
    {
      id: 'dirty-room',
      title: 'Dirty Room',
      titleHebrew: 'חדר מלוכלך',
      description: 'Personal space left messy - affects your mental clarity',
      descriptionHebrew: 'החלל האישי נותר מבולגן - משפיע על הבהירות המנטלית',
      xpReward: -100,
      difficulty: 'easy',
      icon: '🛏️',
      completed: false,
      category: 'daily',
      type: 'negative',
      isNegative: true
    },
    {
      id: 'dirty-house',
      title: 'Dirty House',
      titleHebrew: 'בית מלוכלך',
      description: 'Living space left unclean - creates negative environment',
      descriptionHebrew: 'חלל המגורים נותר לא נקי - יוצר סביבה שלילית',
      xpReward: -300,
      difficulty: 'medium',
      icon: '🏠',
      completed: false,
      category: 'daily',
      type: 'negative',
      isNegative: true
    }
  ]);

  /**
   * ========================================================================
   * 🧠 AUTOMATIC QUEST SORTING SYSTEM - THE MAGIC HAPPENS HERE!
   * ========================================================================
   * 
   * This is the breakthrough system that allows you to add quests ANYWHERE
   * in the array above and have them automatically appear in perfect order.
   * 
   * 🎯 VISUAL RESULT (what user sees):
   * ==================================
   * [Legendary Positive] ← Highest priority, top of list
   * [Hard Positive]
   * [Medium Positive]  
   * [Easy Positive]
   * [Legendary Negative] ← Still high difficulty but at bottom section
   * [Hard Negative]
   * [Medium Negative]
   * [Easy Negative] ← Lowest priority, bottom of list
   * 
   * 🔧 HOW IT WORKS:
   * ================
   * 1. First separates positive vs negative quests (isNegative: true)
   * 2. Then sorts by difficulty within each group
   * 3. Combines them with positives first, negatives last
   * 
   * 🚨 IF YOU MODIFY THIS LOGIC:
   * ============================
   * Remember to update the documentation above! Future you needs to know:
   * - What the new sorting order is
   * - How to add quests with the new system
   * - Any new properties that affect sorting
   */
  const sortedQuests = [...quests].sort((a, b) => {
    // Define difficulty priority: legendary=4 (highest) down to easy=1 (lowest)
    const difficultyOrder = { 'legendary': 4, 'hard': 3, 'medium': 2, 'easy': 1 };
    
    // Separate positive quests (shown first) from negative quests (shown last)
    const getTypeOrder = (quest: Quest) => {
      if (quest.isNegative) return 0; // Negative quests = lower priority (shown last)
      return 1; // Positive quests = higher priority (shown first)
    };
    
    // STEP 1: Sort by quest type (positive vs negative)
    const typeA = getTypeOrder(a);
    const typeB = getTypeOrder(b);
    if (typeA !== typeB) {
      return typeB - typeA; // Higher type number first (1 > 0, so positive before negative)
    }
    
    // STEP 2: Within same type, sort by difficulty (legendary first, easy last)
    const diffA = difficultyOrder[a.difficulty];
    const diffB = difficultyOrder[b.difficulty];
    
    return diffB - diffA; // Higher difficulty number first (4 > 3 > 2 > 1)
  });

  const completedQuests = sortedQuests.filter(q => q.completed).length;
  const totalQuests = sortedQuests.length;

  const handleQuestComplete = (questId: string, baseXP: number) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    // In endless mode, don't mark as completed permanently
    if (!endlessQuestMode) {
      setQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, completed: true } : q
      ));
    }
    
    // Create quest completion record
    const completion: QuestCompletion = {
      questId,
      category: quest.category || 'daily',
      difficulty: quest.difficulty,
      baseXP,
      completedAt: new Date()
    };
    
    // Update categories completed today
    const newCategories = [...categoriesCompletedToday];
    if (quest.category && !newCategories.includes(quest.category)) {
      newCategories.push(quest.category);
    }
    setCategoriesCompletedToday(newCategories);
    
    // Update quest activity for time-based consistency tracking
    const currentActivity = questActivities[questId];
    const updatedActivity = TimeSystem.updateQuestActivity(currentActivity, questId, endlessQuestMode);
    setQuestActivities(prev => ({
      ...prev,
      [questId]: updatedActivity
    }));
    
    // Calculate final XP with all multipliers including time-based consistency
    const isFirstQuestOfDay = questsCompletedToday === 0;
    const xpResult = XPCalculator.calculateFinalXP(
      baseXP,
      streak,
      newCategories,
      quest.difficulty,
      questsCompletedToday + 1,
      isFirstQuestOfDay,
      updatedActivity.consecutiveDays
    );
    
    // Update state
    setPlayerXP(prev => prev + xpResult.finalXP);
    setQuestCompletions(prev => [...prev, completion]);
    setQuestsCompletedToday(prev => prev + 1);
    
    // Update variety score
    const newVarietyScore = XPCalculator.calculateVarietyScore([...questCompletions, completion]);
    setVarietyScore(newVarietyScore);
    
    // Check for first quest achievement
    const completedQuests = quests.filter(q => q.completed).length;
    if (completedQuests === 0) {
      setAchievements(prev => prev.map(ach => 
        ach.id === 'first-quest' ? { ...ach, unlocked: true } : ach
      ));
    }
    
  };

  const handleLevelUp = (newLevel: number) => {
    setPlayerLevel(newLevel);
    setLevelUpModal({ show: true, level: newLevel });
  };

  const resetDaily = () => {
    setQuests(prev => prev.map(quest => ({ ...quest, completed: false })));
    setCategoriesCompletedToday([]);
    setQuestsCompletedToday(0);
    toast({
      title: t.dailyResetComplete,
      description: t.allQuestsReset,
    });
  };

  // Developer panel functions
  const handleAddXP = (amount: number) => {
    setPlayerXP(prev => prev + amount);
    toast({
      title: "🛠️ Developer Action",
      description: `Added ${amount.toLocaleString()} XP`,
    });
  };

  const handleSetLevel = (level: number) => {
    const xpNeeded = LevelingSystem.getXPForLevel(level);
    setPlayerXP(xpNeeded);
    setPlayerLevel(level);
    toast({
      title: "🛠️ Developer Action",
      description: `Set to level ${level} (${xpNeeded.toLocaleString()} XP)`,
    });
  };

  const handleSetStreak = (newStreak: number) => {
    setStreak(newStreak);
    toast({
      title: "🛠️ Developer Action",
      description: `Set streak to ${newStreak} days`,
    });
  };

  const handleResetProgress = () => {
    setPlayerXP(0);
    setPlayerLevel(1);
    setStreak(0);
    setQuests(prev => prev.map(quest => ({ ...quest, completed: false })));
    setAchievements(prev => prev.map(ach => ({ ...ach, unlocked: false })));
    setCategoriesCompletedToday([]);
    setQuestsCompletedToday(0);
    setQuestCompletions([]);
    setQuestActivities({});
    setVarietyScore(0);
    toast({
      title: "🛠️ Developer Action",
      description: "All progress reset",
    });
  };

  const handleCompleteAllQuests = () => {
    setQuests(prev => prev.map(quest => ({ ...quest, completed: true })));
    setQuestsCompletedToday(quests.length);
    setCategoriesCompletedToday(['daily', 'weekly', 'spiritual', 'work']);
    toast({
      title: "🛠️ Developer Action",
      description: "All quests completed",
    });
  };

  const handleUnlockAllAchievements = () => {
    setAchievements(prev => prev.map(ach => ({ ...ach, unlocked: true })));
    toast({
      title: "🛠️ Developer Action", 
      description: "All achievements unlocked",
    });
  };

  const handleToggleEndlessMode = (enabled: boolean) => {
    setEndlessQuestMode(enabled);
    toast({
      title: "🛠️ Developer Action",
      description: `Endless quest mode ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  

  // Update current time every second for timer display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup old quest activities and reset expired multipliers (run every minute)
  useEffect(() => {
    const cleanup = () => {
      const cleanedActivities = TimeSystem.cleanupOldActivities(questActivities);
      const resetActivities: Record<string, QuestActivity> = {};
      
      Object.entries(cleanedActivities).forEach(([questId, activity]) => {
        if (TimeSystem.shouldResetMultiplier(activity.lastCompletedDate)) {
          // Reset consecutive days but keep the record
          resetActivities[questId] = {
            ...activity,
            consecutiveDays: 0
          };
        } else {
          resetActivities[questId] = activity;
        }
      });
      
      if (JSON.stringify(resetActivities) !== JSON.stringify(questActivities)) {
        setQuestActivities(resetActivities);
      }
    };
    
    // Run cleanup every minute instead of every second
    const interval = setInterval(cleanup, 60000);
    cleanup(); // Run once on mount
    return () => clearInterval(interval);
  }, []); // Only run on mount

  // Keyboard shortcut for developer panel (Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setShowDeveloperPanel(!showDeveloperPanel);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeveloperPanel]);
  
  // Update achievements when conditions change
  useEffect(() => {
    setAchievements(prev => prev.map(ach => {
      switch (ach.id) {
        case 'streak-warrior':
          return { ...ach, unlocked: streak >= 7 };
        case 'level-master': 
          return { ...ach, unlocked: playerLevel >= 5 };
        case 'xp-hunter':
          return { ...ach, unlocked: playerXP >= 10000 };
        default:
          return ach;
      }
    }));
  }, [streak, playerLevel, playerXP]);

  const translations = {
    english: {
      title: "Life Quest RPG",
      subtitle: "Level up your life, one mitzvah at a time",
      dailyProgress: "Daily Progress",
      questsComplete: "Quests Complete",
      resetDaily: "Reset Daily", 
      todaysQuests: "Today's Quests",
      remember: "Remember",
      quote: "Every small act of goodness levels up your soul. Stay consistent, stay strong! 💪",
      currentStreak: "Current Streak",
      days: "Days",
      seasonalEvents: "Special Holiday Events",
      questCompleted: "Quest Completed! 🎉",
      xpGained: "You gained",
      keepWorking: "XP! Keep up the great work!",
      levelUp: "LEVEL UP! 🚀",
      congratulations: "Congratulations! You've reached Level",
      dailyResetComplete: "Daily Reset Complete",
      allQuestsReset: "All quests have been reset for a new day!",
      achievements: "Achievements",
      hideAchievements: "Hide Achievements", 
      showAchievements: "Show Achievements",
      categories: {
        all: "All Quests",
        daily: "Daily",
        weekly: "Weekly", 
        spiritual: "Spiritual",
        work: "Work"
      }
    },
    hebrew: {
      title: "משחק החיים RPG",
      subtitle: "עלה רמה בחיים שלך, מצווה אחת בכל פעם",
      dailyProgress: "התקדמות יומית",
      questsComplete: "משימות הושלמו",
      resetDaily: "איפוס יומי",
      todaysQuests: "משימות היום",
      remember: "זכור",
      quote: "כל מעשה טוב קטן מעלה את הנשמה שלך. הישאר עקבי, הישאר חזק! 💪",
      currentStreak: "רצף נוכחי",
      days: "ימים",
      seasonalEvents: "אירועי חג מיוחדים",
      questCompleted: "משימה הושלמה! 🎉",
      xpGained: "קיבלת",
      keepWorking: "נקודות! המשך עם העבודה המעולה!",
      levelUp: "עלייה ברמה! 🚀",
      congratulations: "מזל טוב! הגעת לרמה",
      dailyResetComplete: "איפוס יומי הושלם",
      allQuestsReset: "כל המשימות אופסו ליום חדש!",
      achievements: "הישגים",
      hideAchievements: "הסתר הישגים",
      showAchievements: "הראה הישגים",
      categories: {
        all: "כל המשימות",
        daily: "יומי",
        weekly: "שבועי",
        spiritual: "רוחני", 
        work: "עבודה"
      }
    }
  };

  const t = isHebrew ? translations.hebrew : translations.english;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 space-y-6">
      {/* Persistent XP Bar - Always visible at top-left */}
      {playerData && (
        <PersistentXPBar
          playerName={playerData.name}
          playerGender={playerData.gender}
          currentXP={playerXP}
          currentLevel={playerLevel}
          isHebrew={isHebrew}
        />
      )}
      
      <div className="pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header with Controls */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <Switch
                  checked={isHebrew}
                  onCheckedChange={onLanguageChange}
                />
                <span className="text-sm">{isHebrew ? "עב" : "EN"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={darkMode}
                  onCheckedChange={onDarkModeChange}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">{t.currentStreak}</div>
                <div className="text-2xl font-bold text-success">🔥 {streak} {t.days}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Variety Score</div>
                <div className="text-lg font-bold text-accent">🌈 {varietyScore.toFixed(1)}%</div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2" dir={isHebrew ? 'rtl' : 'ltr'}>
            {t.title}
          </h1>
          <p className="text-muted-foreground" dir={isHebrew ? 'rtl' : 'ltr'}>{t.subtitle}</p>
        </div>

        {/* Player Stats */}
        <PlayerStats 
          currentXP={playerXP}
          currentLevel={playerLevel}
          onLevelUp={handleLevelUp}
          isHebrew={isHebrew}
        />

        {/* Daily Progress */}
        <Card className="p-6 bg-gradient-to-br from-card to-muted border-primary/20">
          <div className="flex items-center justify-between mb-4" dir={isHebrew ? 'rtl' : 'ltr'}>
            <h2 className="text-xl font-bold">{t.dailyProgress}</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {completedQuests}/{totalQuests} {t.questsComplete}
              </span>
              <Button
                onClick={() => setShowAchievements(!showAchievements)}
                variant="outline" 
                size="sm"
                className="border-primary/50 hover:bg-primary/10"
              >
                <Award className="h-4 w-4 mr-1" />
                {showAchievements ? t.hideAchievements : t.showAchievements}
              </Button>
              <Button 
                onClick={resetDaily}
                variant="outline"
                size="sm"
                className="border-accent/50 hover:bg-accent/10"
              >
                {t.resetDaily}
              </Button>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (completedQuests / totalQuests) * 100)}%` }}
            />
          </div>
        </Card>

        {/* Multiplier Display */}
        <MultiplierDisplay 
          streak={streak}
          categoriesCompletedToday={categoriesCompletedToday}
          questsCompletedToday={questsCompletedToday}
          isHebrew={isHebrew}
        />

        {/* Achievements Section */}
        {showAchievements && (
          <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" dir={isHebrew ? 'rtl' : 'ltr'}>
              <Award className="h-5 w-5" />
              {t.achievements}
            </h2>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  isHebrew={isHebrew}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Quest List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6" dir={isHebrew ? 'rtl' : 'ltr'}>{t.todaysQuests}</h2>
          
          {/* Seasonal Events */}
          {seasonalQuests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-accent" dir={isHebrew ? 'rtl' : 'ltr'}>🎉 {t.seasonalEvents}</h3>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {seasonalQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleQuestComplete}
                    isHebrew={isHebrew}
                    endlessMode={endlessQuestMode}
                    activity={questActivities[quest.id]}
                    currentTime={currentTime}
                    streak={streak}
                    categoriesCompletedToday={categoriesCompletedToday}
                    questsCompletedToday={questsCompletedToday}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {sortedQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={handleQuestComplete}
                isHebrew={isHebrew}
                endlessMode={endlessQuestMode}
                activity={questActivities[quest.id]}
                currentTime={currentTime}
                streak={streak}
                categoriesCompletedToday={categoriesCompletedToday}
                questsCompletedToday={questsCompletedToday}
              />
            ))}
          </div>
        </div>

        {/* Motivational Footer */}
        <Card className="p-6 text-center bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
          <h3 className="text-lg font-semibold mb-2" dir={isHebrew ? 'rtl' : 'ltr'}>{t.remember}</h3>
          <p className="text-muted-foreground italic" dir={isHebrew ? 'rtl' : 'ltr'}>
            {t.quote}
          </p>
        </Card>
      </div>

      {/* Custom Level Up Modal */}
      {levelUpModal.show && (
        <div 
          className="fixed z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setLevelUpModal({ show: false, level: 1 })}
          style={{ 
            position: 'fixed',
            top: '-10px',
            left: '-10px',
            right: '-10px',
            bottom: '-10px',
            width: 'calc(100vw + 20px)',
            height: 'calc(100vh + 20px)',
            minHeight: 'calc(100vh + 20px)',
            minWidth: 'calc(100vw + 20px)',
            maxHeight: 'calc(100vh + 20px)',
            maxWidth: 'calc(100vw + 20px)',
            margin: '0',
            padding: '0',
            border: 'none',
            outline: 'none',
            transform: 'translateZ(0)',
            willChange: 'transform',
            contain: 'layout style paint size',
            isolation: 'isolate'
          }}
        >
          <div className="relative">
            {/* Main Level Up Message */}
            <div className="bg-black/90 border border-success/50 rounded-lg px-6 py-4 text-center animate-bounce-in">
              <div className="text-3xl font-bold text-success mb-2">🚀 {t.levelUp}</div>
              <div className="text-xl text-foreground">
                {t.congratulations} {levelUpModal.level}!
              </div>
            </div>
            
            {/* Tap to Continue - Positioned at bottom of screen */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-muted-foreground text-sm animate-pulse">
              Tap to continue
            </div>
          </div>
        </div>
      )}

      {/* Developer Panel */}
      <DeveloperPanel
        playerXP={playerXP}
        playerLevel={playerLevel}
        streak={streak}
        isVisible={showDeveloperPanel}
        endlessQuestMode={endlessQuestMode}
        onToggle={() => setShowDeveloperPanel(!showDeveloperPanel)}
        onAddXP={handleAddXP}
        onSetLevel={handleSetLevel}
        onSetStreak={handleSetStreak}
        onResetProgress={handleResetProgress}
        onCompleteAllQuests={handleCompleteAllQuests}
        onUnlockAllAchievements={handleUnlockAllAchievements}
        onToggleEndlessMode={handleToggleEndlessMode}
        isHebrew={isHebrew}
      />
      </div>
    </div>
  );
};

export default GameDashboard;