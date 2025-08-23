import React from 'react';
import { formatDate } from '../utils/formatDate';

function TaskGallery({ tasks }) {
    return (
        <div className="card task-gallery">
            <h2 className="card-title">Recent Task Photos</h2>
            {tasks.length > 0 ? (
                <div className="task-gallery__grid">
                    {[...tasks].reverse().slice(0, 12).map(task => (
                        <div key={task.id} className="task-gallery__item">
                            <img 
                                src={task.imageUrl} 
                                alt={task.name} 
                                className="task-gallery__image"
                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/2d333b/7c8591?text=Image' }}
                            />
                            <div className="task-gallery__overlay">
                                <p className="task-name">{task.name}</p>
                                <p className="task-date">{formatDate(task.date)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="task-gallery__empty-text">You haven't logged any tasks yet. Add one to get started!</p>
            )}
        </div>
    );
}

export default TaskGallery;