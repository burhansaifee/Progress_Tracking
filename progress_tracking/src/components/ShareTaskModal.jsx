import React, { useState } from 'react';

function ShareTaskModal({ friends, task, onShare, onClose }) {
    const [selectedFriends, setSelectedFriends] = useState([]);

    const handleFriendToggle = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleShare = () => {
        onShare(task, selectedFriends);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <h2>Share "{task.name}" with:</h2>
                <div className="modal-scroll-area">
                    {friends.map(friend => (
                        <div key={friend.uid} className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedFriends.includes(friend.uid)}
                                    onChange={() => handleFriendToggle(friend.uid)}
                                />
                                {friend.nickname || friend.email}
                            </label>
                        </div>
                    ))}
                </div>
                <button onClick={handleShare} className="task-form__button" style={{marginTop: '1rem'}}>Share</button>
            </div>
        </div>
    );
}

export default ShareTaskModal;