'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import emailjs from '@emailjs/browser';

const firebaseConfig = {
  apiKey: "AIzaSyD42eEKFteAf2A9aFUljdv56NLNL_7iWcg",
  authDomain: "styleprofile-feae3.firebaseapp.com",
  projectId: "styleprofile-feae3",
  storageBucket: "styleprofile-feae3.firebasestorage.app",
  messagingSenderId: "369107355186",
  appId: "1:369107355186:web:5cfc7cc2e34158c9be5e2b",
  measurementId: "G-8KKR37ES4F"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const EMAILJS_CONFIG = {
  publicKey: '5L7vy_UOO9YZNWgAZ',
  serviceId: 'service_cc2f78o',
  templateId: 'template_uk8k6zw'
};

if (typeof window !== 'undefined') {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

export const sendEmail = async (toEmail, toName, subject, message) => {
  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        to_email: toEmail,
        to_name: toName,
        from_name: "StyleProfile Team",
        subject,
        message,
        reply_to: "styleprofileinc@gmail.com"
      }
    );
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.text || error.message };
  }
};
