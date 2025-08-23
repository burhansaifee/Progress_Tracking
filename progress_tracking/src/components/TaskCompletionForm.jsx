import React, { useState } from 'react';

function TaskCompletionForm({ onAddCompletion, isLoading, error, taskName }) {
    const [description, setDescription] = useState('');
    const [taskImage, setTaskImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskImage) {
            alert('Please upload an image.');
            return;
        }
        onAddCompletion(description, taskImage);
        setDescription('');
        setTaskImage(null);
        e.target.reset();
    };

    return (
        <div className="card task-form">
            <h2 className="card-title"> {taskName}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="taskDescription">Description (Optional)</label>
                    <input
                        id="taskDescription"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Read chapter 5"
                        className="task-form__input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="taskImage">Upload Photo</label>
                    <input
                        id="taskImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setTaskImage(e.target.files[0])}
                        className="task-form__input"
                    />
                </div>
                <div className="form-group">
                    <button type="submit" disabled={isLoading} className="task-form__button">
                        {isLoading ? (
                            <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Log Completion'}
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}

export default TaskCompletionForm;