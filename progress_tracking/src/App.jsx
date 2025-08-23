import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, where, doc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';
import { uploadImage } from './services/imageUploader';

import Auth from './components/Auth';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Modal from './components/Modal';
import TaskGallery from './components/TaskGallery';
import TaskCreator from './components/TaskCreator';
import TaskList from './components/TaskList';
import TaskCompletionForm from './components/TaskCompletionForm';
import PublicTaskView from './components/PublicTaskView';

import './App.css';

function App() {
    // --- State Management ---
    const [isPublicView, setIsPublicView] = useState(false);
    const [publicData, setPublicData] = useState(null);
    const [isPublicLoading, setIsPublicLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [appId] = useState('default-app-id');
    const [taskDefinitions, setTaskDefinitions] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [completions, setCompletions] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalCompletions, setModalCompletions] = useState(null);

    // --- Effect 1: Check for Share Link ---
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const shareId = urlParams.get('shareId');

        if (shareId) {
            setIsPublicView(true);
            const fetchPublicData = async () => {
                try {
                    const publicTaskDocRef = doc(db, `/artifacts/${appId}/public/data/publicTasks`, shareId);
                    const completionsCollRef = collection(db, `/artifacts/${appId}/public/data/publicTasks/${shareId}/completions`);

                    const docSnap = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/publicTasks`)));
                    const taskDoc = docSnap.docs.find(d => d.id === shareId);

                    if (taskDoc && taskDoc.exists()) {
                        const taskData = taskDoc.data();
                        const completionsSnapshot = await getDocs(completionsCollRef);
                        const completionsData = completionsSnapshot.docs.map(d => ({ ...d.data(), date: d.data().date.toDate() }));
                        
                        setPublicData({ ...taskData, completions: completionsData });
                    } else {
                        setPublicData(null);
                    }
                } catch (err) {
                    console.error("Error fetching public data:", err);
                    setPublicData(null);
                } finally {
                    setIsPublicLoading(false);
                }
            };
            
            fetchPublicData();
        } else {
            setIsPublicView(false);
            setIsPublicLoading(false);
        }
    }, [appId]);

    // --- Effect 2: Authentication ---
    useEffect(() => {
        if (isPublicView) return;
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, [isPublicView]);

    // --- Effect 3: Fetch Task Definitions ---
    useEffect(() => {
        if (!isAuthReady || !user) {
            setTaskDefinitions([]);
            setSelectedTask(null);
            return;
        }
        const tasksDefPath = `/artifacts/${appId}/users/${user.uid}/taskDefinitions`;
        const q = query(collection(db, tasksDefPath));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            tasks.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setTaskDefinitions(tasks);
        });
        return () => unsubscribe();
    }, [isAuthReady, user, appId]);
    
    // --- Effect 4: Fetch Completions ---
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
        await addDoc(collection(db, tasksDefPath), { name: taskName, createdAt: new Date() });
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
        } catch (err) { setError(`Failed to log completion: ${err.message}`); } 
        finally { setIsLoading(false); }
    };

    const handleDeleteCompletion = async (completionId) => {
        if (!user) return;
        const completionDocRef = doc(db, `/artifacts/${appId}/users/${user.uid}/tasks`, completionId);
        await deleteDoc(completionDocRef);
    };

    const handleShareTask = async (task) => {
        if (!user) return;
        const batch = writeBatch(db);
        const publicTaskColRef = collection(db, `/artifacts/${appId}/public/data/publicTasks`);
        const newPublicDocRef = doc(publicTaskColRef);
        batch.set(newPublicDocRef, {
            ownerId: user.uid, ownerEmail: user.email,
            taskDefinitionId: task.id, taskName: task.name,
            createdAt: new Date()
        });
        const completionsToCopy = completions.filter(c => c.taskDefinitionId === task.id);
        completionsToCopy.forEach(comp => {
            const newCompletionRef = doc(collection(newPublicDocRef, 'completions'));
            batch.set(newPublicDocRef, comp);
        });
        await batch.commit();
        const shareUrl = `${window.location.origin}${window.location.pathname}?shareId=${newPublicDocRef.id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert(`Share link copied to clipboard!\n\n${shareUrl}`);
        } catch (err) {
            prompt("Please copy this link:", shareUrl);
        }
    };

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // --- **FIXED** Render Logic ---
    if (isPublicView) {
        if (isPublicLoading) {
            return <div className="loading-screen">Loading Shared Progress...</div>;
        }
        return <PublicTaskView publicData={publicData} />;
    }

    if (!isAuthReady) {
        return <div className="loading-screen">Loading TaskFlow...</div>;
    }

    return (
        <div className="app-container">
            {!user ? ( <Auth setError={setError} /> ) : (
                <>
                    <Header user={user} />
                    <main className="main-content-split">
                        <aside className="sidebar">
                            <TaskCreator onTaskCreate={handleCreateTask} />
                            <TaskList 
                                tasks={taskDefinitions} 
                                onSelectTask={setSelectedTask} 
                                selectedTaskId={selectedTask?.id}
                                onShareTask={handleShareTask}
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
                                        onDeleteCompletion={handleDeleteCompletion} 
                                    />
                                </>
                            ) : (
                                <div className="card empty-state">
                                   <h2>Select a task from the list to see your progress!</h2>
                                   <p>If you don't have any tasks yet, create one in the panel on the left.</p>
                                </div>
                            )}
                        </section>
                    </main>
                </>
            )}
            
            {user && <Modal completions={modalCompletions} onClose={() => setModalCompletions(null)} />}
            {error && <p className="error-message global-error">{error}</p>}
        </div>
    );
}

export default App;