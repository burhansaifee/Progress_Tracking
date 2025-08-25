import React from 'react';
import Friends from './Friends';
import ThemeSwitcher from './ThemeSwitcher';
import Notifications from './Notifications'; // We'll create this next

function ProfilePage({
    user,
    friends,
    onAddFriend,
    onUpdateNickname,
    onDeleteFriend,
    currentTheme,
    onThemeChange,
    onBack,
    onEnableReminders,
    isNotificationsEnabled
}) {

    // Note: Overall stats logic would go here.
    // For now, we'll just put placeholders.
    const totalTasks = "N/A";
    const totalCompletions = "N/A";

    return (
        <div className="profile-page">
            <button onClick={onBack} className="sign-out-button" style={{ marginBottom: '1rem' }}>
                &larr; Back to Tasks
            </button>

            <div className="main-content-split">
                <aside className="sidebar">
                    <div className="card">
                        <h2 className="card-title">Overall Stats</h2>
                        <div className="stats-grid" style={{textAlign: 'left', padding: '1rem'}}>
                            <p><strong>Total Tasks:</strong> {totalTasks}</p>
                            <p><strong>Total Completions:</strong> {totalCompletions}</p>
                        </div>
                    </div>
                    <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />
                    <Notifications onEnableReminders={onEnableReminders} isNotificationsEnabled={isNotificationsEnabled} />   
                </aside>
                <section className="task-detail-view">
                    <Friends
                        friends={friends}
                        onAddFriend={onAddFriend}
                        onSelectFriend={() => {}} // Not needed on this page
                        onUpdateNickname={onUpdateNickname}
                        onDeleteFriend={onDeleteFriend}
                    />
                </section>
            </div>
        </div>
    );
}

export default ProfilePage;