export interface XPMultipliers {
  streakMultiplier: number;
  varietyMultiplier: number;
  difficultyBonus: number;
  categoryBonus: number;
}

export interface QuestCompletion {
  questId: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  baseXP: number;
  completedAt: Date;
}

export interface PlayerStats {
  currentStreak: number;
  totalQuestsCompleted: number;
  categoriesCompletedToday: string[];
  recentCompletions: QuestCompletion[];
  varietyScore: number;
}

export class XPCalculator {
  static calculateStreakMultiplier(streak: number): number {
    if (streak < 3) return 1.0;
    if (streak < 7) return 1.1;
    if (streak < 14) return 1.25;
    if (streak < 30) return 1.5;
    if (streak < 60) return 1.75;
    return 2.0; // Max 2x for 60+ day streaks
  }

  static calculateVarietyMultiplier(categoriesCompletedToday: string[]): number {
    const uniqueCategories = new Set(categoriesCompletedToday).size;
    switch (uniqueCategories) {
      case 0: return 1.0;
      case 1: return 1.0; // No bonus for single category
      case 2: return 1.1; // 10% bonus for 2 categories
      case 3: return 1.25; // 25% bonus for 3 categories  
      case 4: return 1.5; // 50% bonus for all categories
      default: return 1.5;
    }
  }

  static calculateDifficultyBonus(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 1.0;
      case 'medium': return 1.2;
      case 'hard': return 1.5;
      case 'legendary': return 2.0;
      default: return 1.0;
    }
  }

  static calculateCompletionBonus(questsCompletedToday: number): number {
    // Bonus for completing multiple quests in a day
    if (questsCompletedToday >= 10) return 1.5;
    if (questsCompletedToday >= 7) return 1.3;
    if (questsCompletedToday >= 5) return 1.2;
    if (questsCompletedToday >= 3) return 1.1;
    return 1.0;
  }

  static calculateConsistencyMultiplier(consecutiveDays: number): number {
    // 5% bonus per consecutive day, capped at 200% (40 days)
    const bonus = Math.min(consecutiveDays * 0.05, 2.0);
    return 1.0 + bonus;
  }

  static calculateFinalXP(
    baseXP: number,
    streak: number,
    categoriesCompletedToday: string[],
    difficulty: string,
    questsCompletedToday: number,
    isFirstQuestOfDay: boolean = false,
    consecutiveDays: number = 1
  ): { finalXP: number; multipliers: XPMultipliers; bonuses: string[] } {
    const streakMultiplier = this.calculateStreakMultiplier(streak);
    const varietyMultiplier = this.calculateVarietyMultiplier(categoriesCompletedToday);
    const difficultyBonus = this.calculateDifficultyBonus(difficulty);
    const completionBonus = this.calculateCompletionBonus(questsCompletedToday);
    
    // Consistency multiplier based on consecutive days
    const consistencyMultiplier = this.calculateConsistencyMultiplier(consecutiveDays);
    
    let finalXP = baseXP * streakMultiplier * varietyMultiplier * difficultyBonus * completionBonus * consistencyMultiplier;
    
    // First quest of day bonus
    if (isFirstQuestOfDay) {
      finalXP *= 1.25; // 25% bonus for first quest
    }
    
    const bonuses = [];
    if (streakMultiplier > 1) bonuses.push(`🔥 Streak ${Math.round((streakMultiplier - 1) * 100)}%`);
    if (varietyMultiplier > 1) bonuses.push(`🌈 Variety ${Math.round((varietyMultiplier - 1) * 100)}%`);
    if (difficultyBonus > 1) bonuses.push(`⚡ Difficulty ${Math.round((difficultyBonus - 1) * 100)}%`);
    if (completionBonus > 1) bonuses.push(`🎯 Completion ${Math.round((completionBonus - 1) * 100)}%`);
    if (consistencyMultiplier > 1) bonuses.push(`🔄 Consistency ${Math.round((consistencyMultiplier - 1) * 100)}%`);
    if (isFirstQuestOfDay) bonuses.push(`🌅 First Quest 25%`);

    return {
      finalXP: Math.round(finalXP),
      multipliers: {
        streakMultiplier,
        varietyMultiplier, 
        difficultyBonus,
        categoryBonus: completionBonus
      },
      bonuses
    };
  }

  static calculateVarietyScore(recentCompletions: QuestCompletion[], days: number = 7): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentCategories = recentCompletions
      .filter(completion => completion.completedAt >= cutoff)
      .map(completion => completion.category);
    
    const uniqueCategories = new Set(recentCategories).size;
    const totalCategories = 4; // daily, weekly, spiritual, work
    
    return (uniqueCategories / totalCategories) * 100;
  }
}

// Granular XP tracking for specific activities
export class GranularXP {
  static EXERCISE_XP = {
    pushUp: 10,
    sitUp: 8, 
    burpee: 15,
    plank: 5, // per 10 seconds
    squat: 8,
    jumpingJack: 5,
    setBonus: 50, // completing a full set
    workoutBonus: 200 // completing full workout
  };

  static READING_XP = {
    wordBase: 0.5, // XP per word
    pageBonus: 25, // completing a page
    chapterBonus: 100, // completing a chapter
    bookBonus: 500 // completing a book
  };

  static PRAYER_XP = {
    shortPrayer: 50,
    mediumPrayer: 150,
    longPrayer: 300,
    consecutiveDays: 25 // bonus per consecutive day
  };
}