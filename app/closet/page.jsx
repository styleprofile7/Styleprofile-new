'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import OutfitCard from '../../components/OutfitCard';

export default function Closet() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [userOutfits, setUserOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyCloset() {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'outfits'),
          where('userId', '==', currentUser.uid),
          where('inCloset', '==', true)
        );
        const snapshot = await getDocs(q);
        setUserOutfits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failure fetching closet:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMyCloset();
  }, [currentUser]);

  if (!currentUser) { router.push('/'); return null; }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '30px', display: 'flex', alignItems: 'center', gap: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#A38560', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: 'white', overflow: 'hidden' }}>
          {currentUser.profileImage
            ? <img src={currentUser.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : currentUser.email[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{currentUser.name || 'Style Icon'}</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ backgroundColor: '#16302B', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
              {currentUser.personality || 'The Creative'}
            </span>
            <span style={{ color: '#A38560', fontWeight: '500' }}>💰 {currentUser.points || 0} Points</span>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '8px' }}>👗 My Closet</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>Your saved outfit collection</p>

      {isLoading ? (
        <p style={{ textAlign: 'center', color: '#8B9AAF' }}>Loading your closet...</p>
      ) : userOutfits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '15px' }}>Your closet is empty</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Upload outfits and check "Add to Closet" to save them here</p>
          <button className="btn-primary" onClick={() => router.push('/upload')}>Upload Outfit</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {userOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} onOutfitUpdate={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
