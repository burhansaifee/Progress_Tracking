import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase/config';
import { uploadImage } from './services/imageUploader';
import { formatDate } from './utils/formatDate';

import CustomCalendarHeatmap from './components/CustomCalendarHeatmap';
import TaskGallery from './components/TaskGallery';
import TaskCreator from './components/TaskCreator';
import TaskList from './components/TaskList';
import TaskCompletionForm from './components/TaskCompletionForm';

import './App.css';

function App() {
    // State for user, loading, and errors
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [appId] = useState('default-app-id');

    // State for managing multiple tasks
    const [taskDefinitions, setTaskDefinitions] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [completions, setCompletions] = useState([]);

    // --- Authentication ---
    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                signInAnonymously(auth).catch((err) => setError("Authentication failed."));
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // --- Fetch Task Definitions ---
    useEffect(() => {
        if (!user) return;

        const tasksDefPath = `/artifacts/${appId}/users/${user.uid}/taskDefinitions`;
        // **FIX:** Removed the orderBy clause from the query
        const q = query(collection(db, tasksDefPath));

        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // **FIX:** Sort the tasks here in the code instead of in the query
            tasks.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setTaskDefinitions(tasks);
        }, (err) => {
            console.error("Error fetching task definitions:", err);
            setError("Could not fetch the list of tasks.");
        });

        return () => unsubscribeTasks();
    }, [user, appId]);
    
    // --- Fetch Completions for the SELECTED task ---
    useEffect(() => {
        if (!user || !selectedTask) {
            setCompletions([]);
            return;
        };

        const completionsPath = `/artifacts/${appId}/users/${user.uid}/tasks`;
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
    }, [user, selectedTask, appId]);

    // --- Handler Functions ---
    const handleCreateTask = async (taskName) => {
        if (!user) return;
        const tasksDefPath = `/artifacts/${appId}/users/${user.uid}/taskDefinitions`;
        await addDoc(collection(db, tasksDefPath), {
            name: taskName,
            createdAt: new Date(),
        });
    };

    const handleAddCompletion = async (description, image) => {
        if (!user || !selectedTask) return;
        setIsLoading(true);
        setError('');
        try {
            const imageUrl = await uploadImage(image);
            const completionsPath = `/artifacts/${appId}/users/${user.uid}/tasks`;
            await addDoc(collection(db, completionsPath), {
                taskDefinitionId: selectedTask.id,
                description: description,
                imageUrl: imageUrl,
                date: new Date(),
            });
        } catch (err) {
            setError(`Failed to log completion: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Prepare data for the heatmap
    const getHeatmapData = () => {
        const counts = completions.reduce((acc, task) => {
            const dateStr = formatDate(task.date);
            acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(date => ({ date, count: counts[date] }));
    };

    const today = new Date();
    const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>TaskFlow</h1>
                <p>Define your tasks and track your progress for each one.</p>
            </header>

            <main className="main-content-split">
                <aside className="sidebar">
                    <TaskCreator onTaskCreate={handleCreateTask} />
                    <TaskList 
                        tasks={taskDefinitions} 
                        onSelectTask={setSelectedTask} 
                        selectedTaskId={selectedTask?.id}
                    />
                </aside>
                
                <section className="task-detail-view">
                    {selectedTask ? (
                        <>
                            <TaskCompletionForm 
                                onAddCompletion={handleAddCompletion}
                                isLoading={isLoading}
                                error={error}
                                taskName={selectedTask.name}
                            />
                            <div className="card">
                                <h2 className="card-title">Progress Heatmap</h2>
                                <CustomCalendarHeatmap
                                    startDate={oneYearAgo}
                                    endDate={today}
                                    values={getHeatmapData()}
                                />
                            </div>
                            <TaskGallery tasks={completions} />
                        </>
                    ) : (
                        <div className="card empty-state">
                           <h2>Select a task from the list to see your progress!</h2>
                           <p>If you don't have any tasks yet, create one in the panel on the left.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;