import React from 'react';

function Notifications() {
    return (
        <div className="card">
            <h2 className="card-title">Notifications</h2>
            <div style={{padding: '1rem'}}>
                <p>Enable daily email reminders to complete your tasks.</p>
                <button
                    className="task-form__button"
                    onClick={() => alert('This feature requires backend setup!')}
                >
                    Enable Reminders
                </button>
            </div>
        </div>
    );
}

export default Notifications;