import React from 'react';

function Calendar({ completions, onDayClick, currentDate }) {
    const completionsByDate = new Map();
    if (completions) {
        completions.forEach(completion => {
            const dateStr = completion.date.toDateString(); // Group by date string
            if (!completionsByDate.has(dateStr)) {
                completionsByDate.set(dateStr, []);
            }
            completionsByDate.get(dateStr).push(completion);
        });
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const calendarDays = [];
    // Add blank cells for the days before the month starts
    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(<div key={`blank-${i}`} className="calendar-day blank"></div>);
    }

    // Add the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toDateString();
        const dayCompletions = completionsByDate.get(dateString) || [];

        calendarDays.push(
            <div 
                key={day} 
                className={`calendar-day ${dayCompletions.length > 0 ? 'has-completion' : ''}`}
                onClick={() => dayCompletions.length > 0 && onDayClick(dayCompletions)}
            >
                <div className="day-number">{day}</div>
                {dayCompletions.length > 0 && (
                    <div className="completions-indicator">{dayCompletions.length}</div>
                )}
            </div>
        );
    }

    return (
        <div className="calendar-grid">
            {weekDays.map(day => (
                <div key={day} className="calendar-header">{day}</div>
            ))}
            {calendarDays}
        </div>
    );
}

export default Calendar;