import React from 'react';

const themes = [
    { name: 'dark', label: 'Dark' },
    { name: 'light', label: 'Light' },
    { name: 'forest', label: 'Forest' },
];

function ThemeSwitcher({ currentTheme, onThemeChange }) {
    return (
        <div className="card">
            <h2 className="card-title">Theme</h2>
            <div className="theme-switcher">
                {themes.map((theme) => (
                    <button
                        key={theme.name}
                        className={`theme-button ${currentTheme === theme.name ? 'active' : ''}`}
                        onClick={() => onThemeChange(theme.name)}
                    >
                        {theme.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ThemeSwitcher;