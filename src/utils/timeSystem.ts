// Time-based system for quest consistency tracking
export interface QuestActivity {
  questId: string;
  lastCompletedDate: string; // ISO date string
  consecutiveDays: number;
  totalCompletions: number;
}

export class TimeSystem {
  // Get today's date in YYYY-MM-DD format
  static getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get yesterday's date in YYYY-MM-DD format
  static getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // Calculate days between two dates
  static getDaysDifference(dateStr1: string, dateStr2: string): number {
    const date1 = new Date(dateStr1);
    const date2 = new Date(dateStr2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if date string is today
  static isToday(dateStr: string): boolean {
    return dateStr === this.getTodayString();
  }

  // Check if date string is yesterday
  static isYesterday(dateStr: string): boolean {
    return dateStr === this.getYesterdayString();
  }

  // Calculate consistency multiplier based on consecutive days (5% per day)
  static calculateConsistencyMultiplier(consecutiveDays: number): number {
    // 5% bonus per consecutive day, capped at 200% (40 days)
    const bonus = Math.min(consecutiveDays * 0.05, 2.0);
    return 1.0 + bonus;
  }

  // Update quest activity when completed
  static updateQuestActivity(
    currentActivity: QuestActivity | undefined, 
    questId: string,
    isEndlessMode: boolean = false
  ): QuestActivity {
    const today = this.getTodayString();
    
    if (!currentActivity) {
      return {
        questId,
        lastCompletedDate: today,
        consecutiveDays: 1,
        totalCompletions: 1
      };
    }

    // If completed today already
    if (this.isToday(currentActivity.lastCompletedDate)) {
      // In endless mode, simulate additional consecutive days for multiplier growth
      if (isEndlessMode) {
        return {
          ...currentActivity,
          consecutiveDays: currentActivity.consecutiveDays + 1, // Increment for each completion
          totalCompletions: currentActivity.totalCompletions + 1
        };
      } else {
        // Normal mode: just increment total
        return {
          ...currentActivity,
          totalCompletions: currentActivity.totalCompletions + 1
        };
      }
    }

    // If completed yesterday, increment consecutive days
    if (this.isYesterday(currentActivity.lastCompletedDate)) {
      return {
        ...currentActivity,
        lastCompletedDate: today,
        consecutiveDays: currentActivity.consecutiveDays + 1,
        totalCompletions: currentActivity.totalCompletions + 1
      };
    }

    // If more than 1 day gap, reset consecutive days
    const daysSince = this.getDaysDifference(currentActivity.lastCompletedDate, today);
    if (daysSince > 1) {
      return {
        ...currentActivity,
        lastCompletedDate: today,
        consecutiveDays: 1, // Reset to 1 (fresh start)
        totalCompletions: currentActivity.totalCompletions + 1
      };
    }

    // Same day completion (shouldn't happen with above logic)
    return {
      ...currentActivity,
      lastCompletedDate: today,
      consecutiveDays: 1,
      totalCompletions: currentActivity.totalCompletions + 1
    };
  }

  // Check if quest multiplier should reset (2+ days inactive)
  static shouldResetMultiplier(lastCompletedDate: string): boolean {
    const daysSince = this.getDaysDifference(lastCompletedDate, this.getTodayString());
    return daysSince >= 2;
  }

  // Get time until next day (for timer display)
  static getTimeUntilNextDay(): { hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    const hours = Math.floor(msUntilTomorrow / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilTomorrow % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((msUntilTomorrow % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }

  // Format time remaining for display
  static formatTimeRemaining(timeObj: { hours: number; minutes: number; seconds: number }): string {
    const { hours, minutes, seconds } = timeObj;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Clean up old activities (remove entries older than 30 days)
  static cleanupOldActivities(activities: Record<string, QuestActivity>): Record<string, QuestActivity> {
    const today = this.getTodayString();
    const cleaned: Record<string, QuestActivity> = {};
    
    Object.entries(activities).forEach(([questId, activity]) => {
      const daysSince = this.getDaysDifference(activity.lastCompletedDate, today);
      if (daysSince <= 30) { // Keep activities from last 30 days
        cleaned[questId] = activity;
      }
    });
    
    return cleaned;
  }
}