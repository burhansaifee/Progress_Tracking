import React, { useState, useEffect } from 'react';
import { db, messaging } from './firebase/config'; 
import { getToken } from 'firebase/messaging'; 
import {
    collection, addDoc, onSnapshot, query, where, doc, deleteDoc, writeBatch, getDocs, setDoc, getDoc, updateDoc, arrayUnion
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { uploadImage } from './services/imageUploader';
import { checkAchievements, ALL_ACHIEVEMENTS } from './utils/achievements';
import Auth from './components/Auth';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Modal from './components/Modal';
import TaskGallery from './components/TaskGallery';
import TaskCreator from './components/TaskCreator';
import TaskList from './components/TaskList';
import TaskCompletionForm from './components/TaskCompletionForm';
import PublicTaskView from './components/PublicTaskView';
import Friends from './components/Friends';
import FriendProgressView from './components/FriendProgressView';
import ShareTaskModal from './components/ShareTaskModal';
import StatsPage from './components/StatsPage';
import CurrentStreak from './components/CurrentStreak';
import ProfilePage from './components/ProfilePage';
import './App.css';

function App() {
    // --- State Management ---
    const [currentPage, setCurrentPage] = useState('home'); // 'home', 'stats', 'profile'
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isPublicView, setIsPublicView] = useState(false);
    const [publicData, setPublicData] = useState(null);
    const [isPublicLoading, setIsPublicLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const appId = 'default-app-id';
    const [taskDefinitions, setTaskDefinitions] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [completions, setCompletions] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalCompletions, setModalCompletions] = useState(null);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [sharingTask, setSharingTask] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [newAchievement, setNewAchievement] = useState(null);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);


    // --- Effect for Theme ---
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // --- Effect: Check for Share Link ---
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

    // --- Effect 4: Fetch Completions & Check Achievements ---
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

            // Check for new achievements
            const newlyUnlocked = checkAchievements(fetchedCompletions);
            const currentAchievementIds = new Set(achievements.map(a => a.id));

            newlyUnlocked.forEach(unlocked => {
                if (!currentAchievementIds.has(unlocked.id)) {
                    setAchievements(prev => [...prev, unlocked]);
                    setNewAchievement(unlocked); // Trigger notification
                    // Optional: Save achievements to Firestore
                    const achievementRef = doc(db, `/artifacts/${appId}/users/${user.uid}/achievements`, unlocked.id);
                    setDoc(achievementRef, unlocked);
                }
            });
        });
        return () => unsubscribe();
    }, [user, selectedTask, appId, achievements]);

    // --- Effect 5: Fetch Friends ---
    useEffect(() => {
        if (!user) {
            setFriends([]);
            return;
        }
        const friendsPath = `/artifacts/${appId}/users/${user.uid}/friends`;
        const unsubscribe = onSnapshot(collection(db, friendsPath), (snapshot) => {
            const friendsList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            setFriends(friendsList);
        });
        return () => unsubscribe();
    }, [user, appId]);
    
    // --- Effect 6: Fetch Achievements ---
    useEffect(() => {
        if (!user) {
            setAchievements([]);
            return;
        }
        const achievementsPath = `/artifacts/${appId}/users/${user.uid}/achievements`;
        const unsubscribe = onSnapshot(collection(db, achievementsPath), (snapshot) => {
            const fetchedAchievements = snapshot.docs.map(doc => doc.data());
            setAchievements(fetchedAchievements);
        });
        return () => unsubscribe();
    }, [user, appId]);
    
     // --- Effect 7: Check Notification Status ---
    useEffect(() => {
        if (!user) return;
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists() && doc.data().fcmToken) {
                setIsNotificationsEnabled(true);
            } else {
                setIsNotificationsEnabled(false);
            }
        });
        return () => unsubscribe();
    }, [user]);


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

     const handleAddFriend = async (friendEmail, nickname) => {
        if (!user || user.email === friendEmail) {
            setError("Cannot add yourself as a friend.");
            return;
        }

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("email", "==", friendEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setError("User with that email does not exist.");
            return;
        }

        const friendDoc = querySnapshot.docs[0];
        const friendUid = friendDoc.id;

        const friendData = { email: friendEmail };
        if (nickname) {
            friendData.nickname = nickname;
        }
        const friendRef = doc(db, `/artifacts/${appId}/users/${user.uid}/friends`, friendUid);
        await setDoc(friendRef, friendData);

        const currentUserAsFriendRef = doc(db, `/artifacts/${appId}/users/${friendUid}/friends`, user.uid);
        await setDoc(currentUserAsFriendRef, { email: user.email });

        alert("Friend added!");
    };

    const handleUpdateFriendNickname = async (friendUid, newNickname) => {
        if (!user) return;
        const friendRef = doc(db, `/artifacts/${appId}/users/${user.uid}/friends`, friendUid);
        await updateDoc(friendRef, {
            nickname: newNickname
        });
    };

    const handleDeleteFriend = async (friendUid) => {
        if (!user) return;
        const friendRef = doc(db, `/artifacts/${appId}/users/${user.uid}/friends`, friendUid);
        await deleteDoc(friendRef);

        const currentUserAsFriendRef = doc(db, `/artifacts/${appId}/users/${friendUid}/friends`, user.uid);
        await deleteDoc(currentUserAsFriendRef);

        alert("Friend removed.");
    };

    const handleDeleteTask = async (taskId) => {
        if (!user) return;

        const taskDefRef = doc(db, `/artifacts/${appId}/users/${user.uid}/taskDefinitions`, taskId);
        await deleteDoc(taskDefRef);

        const completionsPath = `/artifacts/${appId}/users/${user.uid}/tasks`;
        const q = query(collection(db, completionsPath), where('taskDefinitionId', '==', taskId));
        const completionsSnapshot = await getDocs(q);
        const batch = writeBatch(db);
        completionsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(null);
        }

        alert("Task deleted successfully.");
    };

    const handleShareTaskWithFriends = async (task, friendUids) => {
        if (!user) return;
        const sharedTaskRef = doc(db, `/artifacts/${appId}/users/${user.uid}/sharedTasks`, task.id);
        const sharedTaskDoc = await getDoc(sharedTaskRef);

        if (sharedTaskDoc.exists()) {
            await updateDoc(sharedTaskRef, {
                sharedWith: arrayUnion(...friendUids)
            });
        } else {
            await setDoc(sharedTaskRef, {
                sharedWith: friendUids
            });
        }
        alert(`Task shared with ${friendUids.length} friend(s).`);
    };
    
    const handleEnableReminders = async () => {
        if (!user) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const currentToken = await getToken(messaging, { vapidKey: 'BMmwZI8SaVo9M6rkxOOZDtko8rb9PuEAZI678WE-aMW_xMpZKLJFmODj-4J4LsDE3VIdO3Vw6QYH3-WWFZfoCwo' });
                if (currentToken) {
                    const userDocRef = doc(db, "users", user.uid);
                    await updateDoc(userDocRef, { fcmToken: currentToken });
                    alert("Notifications have been enabled!");
                } else {
                    alert('No registration token available. Request permission to generate one.');
                }
            } else {
                alert("You've blocked notifications. Please enable them in your browser settings.");
            }
        } catch (error) {
            console.error('An error occurred while enabling notifications: ', error);
            setError("Failed to enable notifications. Please try again.");
        }
    };

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleNavigate = (page) => setCurrentPage(page);

    // --- Render Logic ---
    if (isPublicView) {
        if (isPublicLoading) {
            return <div className="loading-screen">Loading Shared Progress...</div>;
        }
        return <PublicTaskView publicData={publicData} />;
    }

    if (!isAuthReady) {
        return <div className="loading-screen">Loading TaskFlow...</div>;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'profile':
                return (
                    <ProfilePage
                        user={user}
                        friends={friends}
                        onAddFriend={handleAddFriend}
                        onUpdateNickname={handleUpdateFriendNickname}
                        onDeleteFriend={handleDeleteFriend}
                        currentTheme={theme}
                        onThemeChange={setTheme}
                        onBack={() => handleNavigate('home')}
                        achievements={achievements}
                        onEnableReminders={handleEnableReminders}
                        isNotificationsEnabled={isNotificationsEnabled}
                    />
                );
            case 'stats':
                if (selectedTask) {
                    return (
                        <StatsPage
                            completions={completions}
                            task={selectedTask}
                            onBack={() => handleNavigate('home')}
                        />
                    );
                }
                // Fallback if no task is selected
                setCurrentPage('home');
                return null;
            case 'home':
            default:
                if (selectedFriend) {
                    return <FriendProgressView friend={selectedFriend} onBack={() => setSelectedFriend(null)} currentUserId={user.uid} />;
                }
                return (
                    <main className="main-content-split">
                        <aside className="sidebar">
                            <TaskCreator onTaskCreate={handleCreateTask} />
                            <TaskList
                                tasks={taskDefinitions}
                                onSelectTask={setSelectedTask}
                                selectedTaskId={selectedTask?.id}
                                onShareTask={handleShareTask}
                                onDeleteTask={handleDeleteTask}
                                onShareWithFriend={(task) => setSharingTask(task)}
                                onViewStats={() => handleNavigate('stats')}
                            />
                            <Friends
                                friends={friends}
                                onAddFriend={handleAddFriend}
                                onSelectFriend={setSelectedFriend}
                                selectedFriendId={selectedFriend?.uid}
                                onUpdateNickname={handleUpdateFriendNickname}
                                onDeleteFriend={handleDeleteFriend}
                            />
                            {selectedTask && <CurrentStreak completions={completions} />}
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
                );
        }
    };

    return (
        <div className="app-container">
            {!user ? ( <Auth setError={setError} /> ) : (
                <>
                    <Header user={user} onProfileClick={() => handleNavigate('profile')} />
                    {renderPage()}
                </>
            )}
            
            {newAchievement && (
                <div className="achievement-toast" onAnimationEnd={() => setNewAchievement(null)}>
                    <div className="achievement-toast-emoji">{newAchievement.emoji}</div>
                    <div className="achievement-toast-text">
                        <strong>Achievement Unlocked!</strong>
                        <p>{newAchievement.name}</p>
                    </div>
                </div>
            )}

            {user && <Modal completions={modalCompletions} onClose={() => setModalCompletions(null)} />}
            {sharingTask && (
                <ShareTaskModal
                    friends={friends}
                    task={sharingTask}
                    onShare={handleShareTaskWithFriends}
                    onClose={() => setSharingTask(null)}
                />
            )}
            {error && <p className="error-message global-error" onClick={() => setError('')}>{error}</p>}
        </div>
    );
}

export default App;