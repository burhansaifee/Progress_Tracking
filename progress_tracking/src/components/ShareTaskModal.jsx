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
                <div className="modal-header">
                    <h2 className="modal-title">Share "{task.name}" with friends</h2>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {friends.length > 0 ? (
                        <ul className="friend-share-list">
                            {friends.map(friend => (
                                <li key={friend.uid} className="friend-share-item">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedFriends.includes(friend.uid)}
                                            onChange={() => handleFriendToggle(friend.uid)}
                                        />
                                        <span>{friend.nickname || friend.email}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>You don't have any friends to share with yet.</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button onClick={handleShare} className="task-form__button" disabled={selectedFriends.length === 0}>
                        Share with {selectedFriends.length} friend(s)
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareTaskModal;