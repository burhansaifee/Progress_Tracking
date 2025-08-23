import React, { useState } from 'react';

function TaskCreator({ onTaskCreate }) {
    const [taskName, setTaskName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskName.trim()) {
            alert('Please enter a task name.');
            return;
        }
        onTaskCreate(taskName);
        setTaskName('');
    };

    return (
        <div className="card">
            <h2 className="card-title">Create a New Task</h2>
            <form onSubmit={handleSubmit} className="task-creator-form">
                <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="e.g., Go to the Gym"
                    className="task-form__input"
                />
                <button type="submit" className="task-form__button">
                    Add Task
                </button>
            </form>
        </div>
    );
}

export default TaskCreator;