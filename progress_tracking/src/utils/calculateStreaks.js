export const calculateStreaks = (completions) => {
    if (!completions || completions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Sort completions by date, just in case they are not in order
    const sortedCompletions = [...completions].sort((a, b) => a.date - b.date);

    // Get unique dates, as a user might complete a task multiple times a day
    const uniqueDates = [...new Set(sortedCompletions.map(c => c.date.toDateString()))]
        .map(dateStr => new Date(dateStr));

    if (uniqueDates.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;

    // Check if the streak is current
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const lastCompletionDate = uniqueDates[uniqueDates.length - 1];

    if (
        lastCompletionDate.toDateString() === today.toDateString() ||
        lastCompletionDate.toDateString() === yesterday.toDateString()
    ) {
        currentStreak = 1; // Start with 1 if today or yesterday has a completion
    }

    let tempStreak = 1;

    for (let i = uniqueDates.length - 1; i > 0; i--) {
        const currentCompletion = uniqueDates[i];
        const previousCompletion = uniqueDates[i - 1];
        
        const diffTime = currentCompletion - previousCompletion;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            tempStreak++;
        } else {
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
            // If the break is not between today/yesterday and the day before
            if (i === uniqueDates.length - 1 && currentStreak === 1) {
                // We've already accounted for today/yesterday, so we don't reset tempStreak
            } else {
                tempStreak = 1;
            }
        }
    }

    if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
    }
    
    // If there is only one completion, the current streak will be the tempStreak
    if (uniqueDates.length > 0 && currentStreak > 0) {
        currentStreak = tempStreak;
    } else if (uniqueDates.length > 0 && currentStreak === 0) {
        // If the last completion was not today or yesterday, the current streak is 0
        currentStreak = 0;
    }


    return { currentStreak, longestStreak };
};