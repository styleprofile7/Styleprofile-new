'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import OutfitCard from '../components/OutfitCard';

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [allOutfits, setAllOutfits] = useState([]);
  const [displayedOutfits, setDisplayedOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleSearchEvent = (e) => setSearchQuery(e.detail);
    window.addEventListener('styleProfileSearch', handleSearchEvent);
    return () => window.removeEventListener('styleProfileSearch', handleSearchEvent);
  }, []);

  const fetchFeed = async () => {
    try {
      const outfitsRef = collection(db, 'outfits');
      const q = query(outfitsRef, orderBy('timestamp', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const fetchedOutfits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllOutfits(fetchedOutfits);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  useEffect(() => {
    const searchLower = searchQuery.toLowerCase();
    let filtered = allOutfits.filter(outfit => {
      const matchesSearch = !searchQuery ||
        (outfit.userName || '').toLowerCase().includes(searchLower) ||
        (outfit.personality || '').toLowerCase().includes(searchLower) ||
        (outfit.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
      let matchesTab = true;
      if (activeFilter === 'top-rated') matchesTab = (outfit.avgRating || 0) >= 4;
      return matchesSearch && matchesTab;
    });

    filtered.sort((a, b) => {
      if (activeFilter === 'fresh') return ((b.timestamp && b.timestamp.seconds) || 0) - ((a.timestamp && a.timestamp.seconds) || 0);
      if (activeFilter === 'top-rated') return (b.avgRating || 0) - (a.avgRating || 0);
      return 0;
    });

    setDisplayedOutfits(filtered);
  }, [allOutfits, activeFilter, searchQuery]);

  const filterBtnStyle = (tabName) => ({
    padding: '6px 16px', borderRadius: '6px', border: 'none',
    background: activeFilter === tabName ? '#16302B' : 'white',
    color: activeFilter === tabName ? 'white' : '#1e3046',
    cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s ease'
  });

  if (currentUser) {
    return (
      <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '20px', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', marginTop: '1rem' }}>
          <div style={{ flex: '1', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/upload')} style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #1e3046', background: 'transparent', cursor: 'pointer', color: '#1e3046', fontWeight: '500' }}>
              Upload
            </button>
            <button onClick={() => setActiveFilter('all')} style={filterBtnStyle('all')}>All</button>
            <button onClick={() => setActiveFilter('top-rated')} style={filterBtnStyle('top-rated')}>Top Rated</button>
            <button onClick={() => setActiveFilter('fresh')} style={filterBtnStyle('fresh')}>Fresh</button>
          </div>
          <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
            <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', color: '#1e3046' }}>Your Feed</h2>
          </div>
          <div style={{ flex: '1' }} />
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#8B9AAF', padding: '40px' }}>Loading latest styles...</p>
        ) : displayedOutfits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ fontSize: '1.5rem', fontFamily: "'Cormorant Garamond', serif", color: '#1e3046', marginBottom: '10px' }}>No looks found ✨</h3>
            <p style={{ color: '#666' }}>Try searching for a different tag or be the first to post!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', height: 'calc(100vh - 220px)', minHeight: '550px', maxHeight: '750px', width: '100%', marginTop: '10px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '100%' }}>
              {[...displayedOutfits].reverse().map((outfit) => (
                <div key={outfit.id} style={{ position: 'absolute', width: '100%', height: '100%' }}>
                  <OutfitCard outfit={outfit} onOutfitUpdate={fetchFeed} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Logged out hero
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1>Discover Your Fashion Identity</h1>
          <p>Join our community, share your style, and connect with fashion enthusiasts worldwide.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => router.push('/signup')}>Start Your Journey</button>
            <Link href="/quiz" className="btn-secondary">✨ Take Style Quiz</Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px', width: '100%', padding: '10px' }}>
          <div className="floating-card" style={{ alignSelf: 'flex-start' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>✨ The Creative</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Express your individuality</p>
          </div>
          <div className="floating-card" style={{ alignSelf: 'flex-end' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>👑 1 Percenter</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Luxury & elegance</p>
          </div>
          <div className="floating-card" style={{ alignSelf: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>🎯 The Influencer</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Stay on trend</p>
          </div>
        </div>
      </div>
    </section>
  );
}
