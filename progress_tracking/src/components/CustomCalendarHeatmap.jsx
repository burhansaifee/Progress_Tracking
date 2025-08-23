import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { formatDate } from '../utils/formatDate';

function CustomCalendarHeatmap({ startDate, endDate, values }) {
    // ... (The full code for the CustomCalendarHeatmap component from the previous response goes here)
    // For brevity, it is not repeated. Copy it from the previous single-file answer.
    const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const SQUARE_SIZE = 12;
    const SQUARE_GAP = 3;
    const WEEK_WIDTH = SQUARE_SIZE + SQUARE_GAP;
    const MONTH_LABEL_GUTTER_SIZE = 8;

    const valuesMap = new Map(values.map(v => [v.date, v.count]));

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
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg width={weeks.length * WEEK_WIDTH + MONTH_LABEL_GUTTER_SIZE} height={7 * WEEK_WIDTH + 20}>
                {/* SVG content from previous answer */}
            </svg>
            <ReactTooltip id="heatmap-tooltip" />
        </div>
    );
}

export default CustomCalendarHeatmap;