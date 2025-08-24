import React from 'react';
import { calculateStreaks } from '../utils/calculateStreaks';

function CurrentStreak({ completions }) {
    if (!completions) return null;

    const { currentStreak } = calculateStreaks(completions);

    return (
        <div className="card">
            <div className="stat-item">
                <h3 className="card-title" style={{ borderBottom: 'none', marginBottom: '0.5rem' }}>Current Streak</h3>
                <p>{currentStreak} days 🔥</p>
            </div>
        </div>
    );
}

export default CurrentStreak;