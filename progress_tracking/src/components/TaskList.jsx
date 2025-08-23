import React from 'react';

// Add onShareWithFriend prop
function TaskList({ tasks, onSelectTask, selectedTaskId, onShareTask, onDeleteTask, onShareWithFriend }) {
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
                        <span>{task.name}</span>
                        <div className="task-gallery__actions">
                             <button
                                className="share-button"
                                title="Share with friend"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShareWithFriend(task);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
                                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                                </svg>
                            </button>
                            {selectedTaskId === task.id && (
                                <button
                                    className="share-button"
                                    title="Share this task via link"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevents re-selecting the task
                                        onShareTask(task);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                                    </svg>
                                </button>
                            )}
                             <button
                                className="share-button delete"
                                title="Delete task"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Are you sure you want to delete the task "${task.name}" and all its completions?`)) {
                                        onDeleteTask(task.id);
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TaskList;