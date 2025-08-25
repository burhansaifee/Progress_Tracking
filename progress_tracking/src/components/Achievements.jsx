import React from 'react';

function Achievements({ achievements }) {
    return (
        <div className="card">
            <h2 className="card-title">Achievements</h2>
            {achievements.length > 0 ? (
                <div className="achievements-grid">
                    {achievements.map(ach => (
                        <div key={ach.id} className="achievement-item" title={`${ach.description}\nUnlocked on: ${new Date(ach.date).toLocaleDateString()}`}>
                            <span className="achievement-emoji">{ach.emoji}</span>
                            <p className="achievement-name">{ach.name}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="task-list__empty">No achievements unlocked yet. Keep up the great work!</p>
            )}
        </div>
    );
}

export default Achievements;