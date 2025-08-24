import React from 'react';
import { calculateStreaks } from '../utils/calculateStreaks';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function Stats({ completions, taskName }) {
    const { currentStreak, longestStreak } = calculateStreaks(completions);

    // Prepare data for the bar chart (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();

    const completionsByDay = completions.reduce((acc, completion) => {
        const dateStr = completion.date.toISOString().split('T')[0];
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
    }, {});

    const chartData = last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completions: completionsByDay[date] || 0,
    }));

    return (
        <div className="card">
            <h2 className="card-title">{taskName} - Statistics</h2>
            <div className="stats-grid">
                <div className="stat-item">
                    <h3>Current Streak</h3>
                    <p>{currentStreak} days 🔥</p>
                </div>
                <div className="stat-item">
                    <h3>Longest Streak</h3>
                    <p>{longestStreak} days 🚀</p>
                </div>
                <div className="stat-item">
                    <h3>Total Completions</h3>
                    <p>{completions.length} times ✅</p>
                </div>
            </div>
            <div className="chart-container">
                <h3 className="chart-title">Completions in the Last 30 Days</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis allowDecimals={false} stroke="#9ca3af" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                            labelStyle={{ color: '#d1d5db' }}
                        />
                        <Bar dataKey="completions" fill="#22d3ee" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Stats;