import React from 'react';
import { formatDate } from '../utils/formatDate';

// Add the isPublic prop to conditionally hide buttons
function TaskGallery({ tasks, onDeleteCompletion, isPublic = false }) {

    // Helper function to handle the image download
    const handleDownload = async (imageUrl, description) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const filename = description ? `${description.replace(/\s+/g, '-')}.jpg` : `task-completion-${new Date().getTime()}.jpg`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading image:', error);
            window.open(imageUrl, '_blank');
        }
    };

    return (
        <div className="card task-gallery">
            <h2 className="card-title">Recent Completions</h2>
            {tasks.length > 0 ? (
                <div className="task-gallery__grid">
                    {[...tasks].reverse().slice(0, 18).map(completion => (
                        <div key={completion.id} className="task-gallery__item">
                            <img 
                                src={completion.imageUrl} 
                                alt={completion.description || 'Task completion'} 
                                className="task-gallery__image"
                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/2d333b/7c8591?text=Image' }}
                            />
                            <div className="task-gallery__overlay">
                                <div className="task-gallery__info">
                                    <p className="task-name">{completion.description || 'No description'}</p>
                                    <p className="task-date">{formatDate(completion.date)}</p>
                                </div>
                                {/* Only show buttons if not in public view */}
                                {!isPublic && (
                                    <div className="task-gallery__actions">
                                        <button 
                                            onClick={() => handleDownload(completion.imageUrl, completion.description)} 
                                            className="task-gallery__button download"
                                            title="Download Image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => onDeleteCompletion(completion.id)} 
                                            className="task-gallery__button delete"
                                            title="Delete Completion"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="task-gallery__empty-text">Log a completion to see your photos here!</p>
            )}
        </div>
    );
}

export default TaskGallery;