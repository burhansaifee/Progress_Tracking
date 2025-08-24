import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';

function Header({ user }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth);
    };

    // Close the menu if clicking outside of it
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);


    return (
        <header className="app-header">
            <div className="header-content">
                <h1>TaskFlow</h1>
                {user && (
                    <div className="user-info-container" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="user-avatar-button">
                            <img
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email.charAt(0)}&background=random`}
                                alt="User Avatar"
                                className="user-avatar-image"
                            />
                        </button>

                        {isMenuOpen && (
                            <div className="user-menu">
                                <div className="user-menu-header">
                                    <img
                                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email.charAt(0)}&background=random`}
                                        alt="User Avatar"
                                        className="user-avatar-image-large"
                                    />
                                    <span className="user-email">{user.email}</span>
                                </div>
                                <button onClick={handleSignOut} className="sign-out-button">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="sign-out-icon" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                                    </svg>
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <p>Define your tasks and track your progress for each one.</p>
        </header>
    );
}

export default Header;