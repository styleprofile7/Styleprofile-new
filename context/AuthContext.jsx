'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, sendPasswordResetEmail, onAuthStateChanged
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, getDocs, query, where,
  collection, updateDoc, serverTimestamp, increment
} from 'firebase/firestore';
import { auth, db, sendEmail } from '../utils/firebase';
import { calcNewStreak, getTodayKey, XP_ACTIONS } from '../utils/gamification';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, name, personality, referralCode) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      name, email, personality,
      initial: name.charAt(0).toUpperCase(),
      profileImage: null,
      points: 0, ratingsGiven: 0, postsCount: 0, likesGiven: 0,
      avgRating: 0, closetCount: 0,
      referralCode: user.uid.substring(0, 8).toUpperCase(),
      referrals: 0, referredBy: referralCode || null,
      ambassadorLevel: 'Starter',
      currentStreak: 1, longestStreak: 1,
      lastLoginDate: getTodayKey(),
      joinedDate: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    if (referralCode) {
      try {
        const q = query(collection(db, 'users'), where('referralCode', '==', referralCode));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, 'users', snap.docs[0].id), {
            referrals: increment(1), points: increment(100)
          });
        }
      } catch (e) { console.error('Referral error:', e); }
    }

    await sendEmail(email, name, 'Welcome to StyleProfile! 🎉',
      `Hi ${name}!\n\nWelcome to StyleProfile! Your fashion journey starts now.\n\nYour referral code: ${userData.referralCode}\n\nBest regards,\nThe StyleProfile Team`
    );
    return user;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // Refresh user data from Firestore (call after XP updates)
  const refreshUser = async () => {
    if (!currentUser) return;
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    if (snap.exists()) setCurrentUser({ uid: currentUser.uid, ...snap.data() });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Auto-update streak on login
          const today = getTodayKey();
          if (data.lastLoginDate !== today) {
            const newStreak = calcNewStreak(data.lastLoginDate || '', data.currentStreak || 0);
            const streakBonus = newStreak >= 7 ? XP_ACTIONS.STREAK_BONUS.points : 0;
            const loginPts = XP_ACTIONS.LOGIN_DAILY.points + streakBonus;
            try {
              await updateDoc(docRef, {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, data.longestStreak || 0),
                lastLoginDate: today,
                points: increment(loginPts),
              });
              const updated = await getDoc(docRef);
              setCurrentUser({ uid: user.uid, ...updated.data() });
            } catch (e) {
              setCurrentUser({ uid: user.uid, ...data });
            }
          } else {
            setCurrentUser({ uid: user.uid, ...data });
          }
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, signup, login, logout, resetPassword, refreshUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
