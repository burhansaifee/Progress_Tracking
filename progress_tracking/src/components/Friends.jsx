import React, { useState } from 'react';

function Friends({ friends, onAddFriend, onSelectFriend, selectedFriendId, onUpdateNickname, onDeleteFriend }) {
    const [friendEmail, setFriendEmail] = useState('');
    const [nickname, setNickname] = useState('');


    const handleSubmit = (e) => {
        e.preventDefault();
        if (friendEmail.trim()) {
            onAddFriend(friendEmail.trim(), nickname.trim());
            setFriendEmail('');
            setNickname('');
        }
    };

    const handleEditNickname = (e, friend) => {
        e.stopPropagation();
        const newNickname = prompt(`Enter a new nickname for ${friend.nickname || friend.email}:`, friend.nickname || '');
        if (newNickname !== null) {
            onUpdateNickname(friend.uid, newNickname);
        }
    };

    const handleDeleteFriend = (e, friend) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to remove ${friend.nickname || friend.email} as a friend?`)) {
            onDeleteFriend(friend.uid);
        }
    };


    return (
        <div className="card">
            <h2 className="card-title">Friends</h2>
            <form onSubmit={handleSubmit} className="task-form">
                <div className="form-group">
                    <input
                        type="email"
                        value={friendEmail}
                        onChange={(e) => setFriendEmail(e.target.value)}
                        placeholder="Friend's email"
                        className="task-form__input"
                        required
                    />
                </div>
                 <div className="form-group">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Nickname (optional)"
                        className="task-form__input"
                    />
                </div>
                <button type="submit" className="task-form__button">Add Friend</button>
            </form>


            <ul className="task-list" style={{marginTop: '1rem'}}>
                {friends.length === 0 ? (
                    <p className="task-list__empty">No friends yet. Add one above!</p>
                ) : (
                    friends.map(friend => (
                        <li
                            key={friend.uid}
                            className={`task-list__item ${selectedFriendId === friend.uid ? 'active' : ''}`}
                            onClick={() => onSelectFriend(friend)}
                        >
                            <span>{friend.nickname || friend.email}</span>
                            <div className="task-gallery__actions">
                                <button
                                    className="share-button"
                                    title="Edit nickname"
                                    onClick={(e) => handleEditNickname(e, friend)}
                                >
                                    <svg xmlns="http://www.w.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                    </svg>
                                </button>
                                 <button
                                    className="share-button delete"
                                    title="Remove friend"
                                    onClick={(e) => handleDeleteFriend(e, friend)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                    </svg>
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default Friends;