// Advanced leveling system similar to popular video games
export class LevelingSystem {
  // Calculate total XP needed to reach a specific level
  static getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    
    let totalXP = 0;
    
    // Early levels (2-10): Gentle growth - much more reasonable
    if (level <= 10) {
      // Base: 500, multiplier: 1.2 per level (reduced from 1000 and 1.3)
      for (let i = 2; i <= Math.min(level, 10); i++) {
        totalXP += Math.floor(500 * Math.pow(1.2, i - 2));
      }
    } else {
      // Add XP for levels 2-10 first
      totalXP = this.getXPForLevel(10);
      
      // Medium levels (11-30): Moderate growth (reduced range and requirements)
      if (level <= 30) {
        for (let i = 11; i <= Math.min(level, 30); i++) {
          totalXP += Math.floor(1500 * Math.pow(1.25, i - 11)); // Reduced from 5000 and 1.4
        }
      } else {
        // Add XP for levels 11-30
        totalXP = this.getXPForLevel(30);
        
        // Higher levels (31-60): Steeper growth
        if (level <= 60) {
          for (let i = 31; i <= Math.min(level, 60); i++) {
            totalXP += Math.floor(5000 * Math.pow(1.3, i - 31)); // Reduced from 50000 and 1.5
          }
        } else {
          // Add XP for levels 31-60
          totalXP = this.getXPForLevel(60);
          
          // High levels (61-100): Higher growth
          if (level <= 100) {
            for (let i = 61; i <= Math.min(level, 100); i++) {
              totalXP += Math.floor(15000 * Math.pow(1.35, i - 61));
            }
          } else {
            // Add XP for levels 61-100
            totalXP = this.getXPForLevel(100);
            
            // Extreme levels (101+): Still exponential but more reasonable
            for (let i = 101; i <= level; i++) {
              totalXP += Math.floor(50000 * Math.pow(1.4, i - 101)); // Much reduced from 1M and 1.6
            }
          }
        }
      }
    }
    
    return totalXP;
  }

  // Calculate XP needed between two levels
  static getXPBetweenLevels(fromLevel: number, toLevel: number): number {
    return this.getXPForLevel(toLevel) - this.getXPForLevel(fromLevel);
  }

  // Calculate current level based on total XP
  static getLevelFromXP(totalXP: number): number {
    if (totalXP <= 0) return 1;
    
    let level = 1;
    
    // Binary search for efficiency with high levels
    let low = 1;
    let high = 1000; // Start with reasonable upper bound
    
    // First, find a reasonable upper bound
    while (this.getXPForLevel(high) < totalXP) {
      high *= 2;
    }
    
    // Binary search for exact level
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const xpNeeded = this.getXPForLevel(mid);
      const nextLevelXP = this.getXPForLevel(mid + 1);
      
      if (totalXP >= xpNeeded && totalXP < nextLevelXP) {
        return mid;
      } else if (totalXP >= nextLevelXP) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    
    return level;
  }

  // Get level progression info
  static getLevelInfo(totalXP: number): {
    currentLevel: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progressToNext: number;
    xpToNext: number;
  } {
    const currentLevel = this.getLevelFromXP(totalXP);
    const currentLevelXP = this.getXPForLevel(currentLevel);
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    const xpIntoLevel = totalXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    const progressToNext = Math.min(100, (xpIntoLevel / xpNeededForLevel) * 100);
    const xpToNext = nextLevelXP - totalXP;

    return {
      currentLevel,
      currentLevelXP,
      nextLevelXP,
      progressToNext,
      xpToNext
    };
  }

  // Get example level requirements for display
  static getExampleLevels(): Array<{level: number, totalXP: number, xpThisLevel: number}> {
    const examples = [1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 500, 1000];
    
    return examples.map(level => ({
      level,
      totalXP: this.getXPForLevel(level),
      xpThisLevel: level === 1 ? 0 : this.getXPBetweenLevels(level - 1, level)
    }));
  }
}

// Pre-calculate some common levels for performance
export const LEVEL_CACHE = new Map<number, number>();

// Cache first 1000 levels on import
for (let i = 1; i <= 1000; i++) {
  LEVEL_CACHE.set(i, LevelingSystem.getXPForLevel(i));
}