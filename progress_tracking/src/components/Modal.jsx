import React from 'react';
import { formatDate } from '../utils/formatDate';

function Modal({ completions, onClose }) {
    if (!completions || completions.length === 0) {
        return null;
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                 <div className="modal-header">
                    <h2 className="modal-title">Completions for {formatDate(completions[0].date)}</h2>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {completions.map(completion => (
                        <div key={completion.id} className="modal-completion-item">
                            <img src={completion.imageUrl} alt={completion.description || 'Completion'} />
                            <p>{completion.description || 'No description'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Modal;