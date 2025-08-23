import React, { useState } from 'react';

// Accept a new 'disabled' prop
function TaskCreator({ onTaskCreate, disabled }) {
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
                    placeholder={disabled ? "Authenticating..." : "e.g., Go to the Gym"}
                    className="task-form__input"
                    // Disable the input while the app is not ready
                    disabled={disabled}
                />
                <button type="submit" className="task-form__button" disabled={disabled}>
                    Add Task
                </button>
            </form>
        </div>
    );
}

export default TaskCreator;