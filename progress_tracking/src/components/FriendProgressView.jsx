import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Calendar from './Calendar';
import TaskGallery from './TaskGallery';
import Modal from './Modal';
import TaskList from './TaskList';

function FriendProgressView({ friend, onBack }) {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [completions, setCompletions] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalCompletions, setModalCompletions] = useState(null);

    // Fetch friend's tasks
    useEffect(() => {
        if (!friend) return;
        const tasksDefPath = `/artifacts/default-app-id/users/${friend.uid}/taskDefinitions`;
        const q = query(collection(db, tasksDefPath));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const friendTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            friendTasks.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setTasks(friendTasks);
            if (friendTasks.length > 0) {
                setSelectedTask(friendTasks[0]);
            } else {
                setSelectedTask(null);
            }
        });
        return () => unsubscribe();
    }, [friend]);

    // Fetch completions for selected task
    useEffect(() => {
        if (!selectedTask) {
            setCompletions([]);
            return;
        }
        const completionsPath = `/artifacts/default-app-id/users/${friend.uid}/tasks`;
        const q = query(collection(db, completionsPath), where('taskDefinitionId', '==', selectedTask.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCompletions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            }));
            setCompletions(fetchedCompletions);
        });
        return () => unsubscribe();
    }, [friend, selectedTask]);


    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));


    return (
        <div className="friend-progress-view">
             <button onClick={onBack} className="sign-out-button" style={{marginBottom: '1rem'}}> Back to My Progress</button>
            <h2 className="card-title" style={{textAlign: 'center', fontSize: '1.5em', marginBottom: '1.5em'}}>Viewing {friend.nickname || friend.email}'s Progress</h2>


            <div className="main-content-split">
                 <aside className="sidebar">
                    <TaskList
                        tasks={tasks}
                        onSelectTask={setSelectedTask}
                        selectedTaskId={selectedTask?.id}
                        onShareTask={() => {}} // No sharing from friend's view
                    />
                </aside>
                <section className="task-detail-view">
                {selectedTask ? (
                    <>
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
                                completions={completions}
                                onDayClick={setModalCompletions}
                            />
                        </div>
                        <TaskGallery
                            tasks={completions}
                            isPublic={true} // to hide delete/download buttons
                        />
                    </>
                ) : (
                    <div className="card empty-state">
                       <h2>{friend.nickname || friend.email} has no tasks yet.</h2>
                    </div>
                )}
                </section>
            </div>
             <Modal completions={modalCompletions} onClose={() => setModalCompletions(null)} />
        </div>
    );
}

export default FriendProgressView;