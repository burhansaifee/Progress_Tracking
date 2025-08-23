import React from 'react';
import { getAuth, signOut } from 'firebase/auth';

function Header({ user }) {
    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth);
    };

    return (
        <header className="app-header">
            <div className="header-content">
                <h1>TaskFlow</h1>
                {user && (
                    <div className="user-info">
                        <span>{user.email}</span>
                        <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
                    </div>
                )}
            </div>
            <p>Define your tasks and track your progress for each one.</p>
        </header>
    );
}

export default Header;