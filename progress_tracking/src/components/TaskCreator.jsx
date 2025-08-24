import React, { useState } from 'react';

function TaskCreator({ onTaskCreate, disabled }) {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskName.trim()) {
            alert('Please enter a task name.');
            return;
        }
        // Pass both name and description to the handler
        onTaskCreate(taskName, taskDescription);
        setTaskName('');
        setTaskDescription('');
    };

    return (
        <div className="card">
            <h2 className="card-title">Create a New Task</h2>
            <form onSubmit={handleSubmit} className="task-form">
                <div className="form-group">
                    <label htmlFor="taskName">Task Name</label>
                    <input
                        id="taskName"
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder={disabled ? "Authenticating..." : "e.g., Go to the Gym"}
                        className="task-form__input"
                        disabled={disabled}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="taskDescription">Description (Optional)</label>
                    <textarea
                        id="taskDescription"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Add more details about your task..."
                        className="task-form__input"
                        rows="3"
                        disabled={disabled}
                    ></textarea>
                </div>
                <button type="submit" className="task-form__button" disabled={disabled}>
                    Add Task
                </button>
            </form>
        </div>
    );
}

export default TaskCreator;