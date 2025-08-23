import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { formatDate } from '../utils/formatDate';

// The component now expects the raw 'completions' array
function CustomCalendarHeatmap({ startDate, endDate, completions }) {
    const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const SQUARE_SIZE = 15;
    const SQUARE_GAP = 4;
    const WEEK_WIDTH = SQUARE_SIZE + SQUARE_GAP;
    const MONTH_LABEL_GUTTER_SIZE = 4;

    // Group completions by date right inside the component
    const completionsByDate = new Map();
    if (completions) {
        completions.forEach(completion => {
            const dateStr = formatDate(completion.date);
            if (!completionsByDate.has(dateStr)) {
                completionsByDate.set(dateStr, []);
            }
            completionsByDate.get(dateStr).push(completion);
        });
    }

    const getWeeksForRange = (start, end) => {
        const result = [];
        let current = new Date(start);
        current.setDate(current.getDate() - current.getDay());
        
        while (current <= end) {
            const week = [];
            for (let i = 0; i < 7; i++) {
                week.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            result.push(week);
        }
        return result;
    };
    
    const weeks = getWeeksForRange(startDate, endDate);
    
    const getClassForValue = (count) => {
        if (!count || count === 0) return 'color-empty';
        const intensity = Math.min(count, 4);
        return `color-github-${intensity}`;
    };

    const monthLabelPositions = weeks.reduce((acc, week, i) => {
        const firstDay = week[0];
        const month = firstDay.getMonth();
        if (i > 0) {
            const prevMonth = weeks[i-1][0].getMonth();
            if (month !== prevMonth) {
                acc.push({ month: MONTH_LABELS[month], x: i * WEEK_WIDTH });
            }
        } else {
            acc.push({ month: MONTH_LABELS[month], x: i * WEEK_WIDTH });
        }
        return acc;
    }, []);

    return (
        <div className="heatmap-container">
            <svg width={(weeks.length * WEEK_WIDTH) + MONTH_LABEL_GUTTER_SIZE + 20} height={(7 * WEEK_WIDTH) + 20}>
                <g transform={`translate(20, 20)`}>
                    {weeks.map((week, weekIndex) => (
                        <g key={weekIndex} transform={`translate(${weekIndex * WEEK_WIDTH}, 0)`}>
                            {week.map((day, dayIndex) => {
                                const dateStr = formatDate(day);
                                const dayCompletions = completionsByDate.get(dateStr) || [];
                                const count = dayCompletions.length;
                                const firstImage = dayCompletions[0]?.imageUrl;
                                
                                const isDateInRange = day >= startDate && day <= endDate;
                                if (!isDateInRange) return null;

                                const formattedDate = day.toLocaleDateString();
                                const tooltipContent = `<strong>${count} completion${count === 1 ? '' : 's'} on ${formattedDate}</strong>`;

                                return (
                                    <g key={dateStr} className="heatmap-day-cell">
                                        <rect
                                            x={0}
                                            y={dayIndex * WEEK_WIDTH}
                                            width={SQUARE_SIZE}
                                            height={SQUARE_SIZE}
                                            rx="3"
                                            ry="3"
                                            className={getClassForValue(count)}
                                            data-tooltip-id="heatmap-tooltip"
                                            data-tooltip-html={tooltipContent}
                                        />
                                        {firstImage && (
                                            <image
                                                href={firstImage}
                                                x="0"
                                                y={dayIndex * WEEK_WIDTH}
                                                width={SQUARE_SIZE}
                                                height={SQUARE_SIZE}
                                                clipPath="inset(0% round 3px)"
                                                className="heatmap-day-image"
                                                data-tooltip-id="heatmap-tooltip"
                                                data-tooltip-html={tooltipContent}
                                            />
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    ))}
                </g>
                <g transform={`translate(0, 20)`}>
                    {WEEK_DAYS.map((day, i) => (
                         (i % 2 !== 0) && <text key={day} x={5} y={(i * WEEK_WIDTH) + (SQUARE_SIZE)} style={{ fontSize: '9px', fill: '#7c8591' }}>{day}</text>
                    ))}
                </g>
                 <g transform={`translate(20, 10)`}>
                    {monthLabelPositions.map(({ month, x }) => (
                        <text key={month+x} x={x} y={0} style={{ fontSize: '10px', fill: '#7c8591' }}>
                            {month}
                        </text>
                    ))}
                </g>
            </svg>
            <ReactTooltip id="heatmap-tooltip" allowHTML={true} />
        </div>
    );
}

export default CustomCalendarHeatmap;