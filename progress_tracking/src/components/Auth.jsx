import React, { useState } from 'react';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';


function Auth({ setError }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Function to create a user document in Firestore
    const createUserProfileDocument = async (user) => {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                email: user.email,
                createdAt: new Date()
            });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const auth = getAuth();

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await createUserProfileDocument(userCredential.user);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        setIsLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, provider);
            await createUserProfileDocument(result.user);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                  <h2>Welcome to TaskFlow</h2>
                  <p>Your personal progress tracker</p>
                </div>
                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-group">
                           <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="task-form__input with-icon"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-group">
                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="task-form__input with-icon"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <button type="submit" disabled={isLoading} className="task-form__button">
                            {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </div>
                </form>

                <div className="separator">OR</div>

                <div className="auth-actions">
                    <button onClick={handleGoogleSignIn} disabled={isLoading} className="google-signin-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.487-11.181-8.264l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.986,36.681,44,31.016,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                        </svg>
                        <span>Sign in with Google</span>
                    </button>

                    <button onClick={() => setIsLogin(!isLogin)} className="auth-toggle-button">
                        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Auth;