import { calculateStreaks } from './calculateStreaks';

export const ALL_ACHIEVEMENTS = {
    FIRST_COMPLETION: {
        id: 'FIRST_COMPLETION',
        name: 'First Step!',
        description: 'Log your very first task completion.',
        emoji: '🎉',
        check: (completions) => completions.length >= 1,
    },
    SEVEN_DAY_STREAK: {
        id: 'SEVEN_DAY_STREAK',
        name: '7-Day Streak',
        description: 'Maintain a task streak for 7 consecutive days.',
        emoji: '🔥',
        check: (completions) => {
            const { currentStreak, longestStreak } = calculateStreaks(completions);
            return currentStreak >= 7 || longestStreak >= 7;
        },
    },
    PERFECT_WEEK: {
        id: 'PERFECT_WEEK',
        name: 'Perfect Week',
        description: 'Complete a task every day for a full week (Mon-Sun).',
        emoji: '💯',
        check: (completions) => {
            const uniqueDays = new Set(completions.map(c => new Date(c.date).getDay())); // 0=Sun, 1=Mon...
            return uniqueDays.size === 7;
        }
    },
    CENTURION: {
        id: 'CENTURION',
        name: 'Centurion',
        description: 'Complete a single task 100 times.',
        emoji: '🏆',
        check: (completions) => completions.length >= 100,
    },
};

export const checkAchievements = (completions) => {
    const unlocked = [];
    for (const achievement of Object.values(ALL_ACHIEVEMENTS)) {
        if (achievement.check(completions)) {
            unlocked.push({
                ...achievement,
                date: new Date().toISOString()
            });
        }
    }
    return unlocked;
};