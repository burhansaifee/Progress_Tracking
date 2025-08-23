import React, { useState } from 'react';
import Calendar from './Calendar';
import Modal from './Modal';
import TaskGallery from './TaskGallery';

function PublicTaskView({ publicData }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalCompletions, setModalCompletions] = useState(null);

    // **FIX:** Add a check to handle cases where the task is not found or deleted.
    if (!publicData) {
        return (
            <div className="app-container">
                <div className="card empty-state">
                    <h2>Task Not Found</h2>
                    <p>This shared task could not be found. It may have been deleted by the owner.</p>
                </div>
            </div>
        );
    }

    const { taskName, ownerEmail, completions } = publicData;

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>{taskName}</h1>
                <p>A shared progress journal by {ownerEmail}</p>
            </header>
            <main className="public-view-main">
                <div className="card">
                    <div className="calendar-main-header">
                        <button onClick={handlePrevMonth}>&larr;</button>
                        <h2 className="card-title">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleNextMonth}>&rarr;</button>
                    </div>
                    <Calendar
                        currentDate={currentDate}
                        completions={completions || []} // Ensure completions is always an array
                        onDayClick={setModalCompletions}
                    />
                </div>
                <TaskGallery tasks={completions || []} isPublic={true} />
            </main>
            <Modal completions={modalCompletions} onClose={() => setModalCompletions(null)} />
        </div>
    );
}

export default PublicTaskView;