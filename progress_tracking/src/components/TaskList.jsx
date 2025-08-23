import React from 'react';

function TaskList({ tasks, onSelectTask, selectedTaskId }) {
    return (
        <div className="card">
            <h2 className="card-title">Your Tasks</h2>
            <ul className="task-list">
                {tasks.length === 0 && <p className="task-list__empty">No tasks created yet. Add one above!</p>}
                {tasks.map(task => (
                    <li
                        key={task.id}
                        className={`task-list__item ${selectedTaskId === task.id ? 'active' : ''}`}
                        onClick={() => onSelectTask(task)}
                    >
                        {task.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TaskList;