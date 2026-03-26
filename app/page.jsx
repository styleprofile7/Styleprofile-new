'use client';

import { useState, useEffect, useRef } from 'react';
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

  // Swipe state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const cardRef = useRef(null);

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
      setCurrentIndex(0);
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
    setCurrentIndex(0);
  }, [allOutfits, activeFilter, searchQuery]);

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Only swipe if horizontal movement is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX < 0 && currentIndex < displayedOutfits.length - 1) {
        // Swipe left = next
        setSwipeDirection('left');
        setTimeout(() => { setCurrentIndex(i => i + 1); setSwipeDirection(null); }, 300);
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swipe right = previous
        setSwipeDirection('right');
        setTimeout(() => { setCurrentIndex(i => i - 1); setSwipeDirection(null); }, 300);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Mouse drag for desktop
  const mouseStartX = useRef(null);
  const handleMouseDown = (e) => { mouseStartX.current = e.clientX; };
  const handleMouseUp = (e) => {
    if (mouseStartX.current === null) return;
    const delta = e.clientX - mouseStartX.current;
    if (Math.abs(delta) > 60) {
      if (delta < 0 && currentIndex < displayedOutfits.length - 1) {
        setSwipeDirection('left');
        setTimeout(() => { setCurrentIndex(i => i + 1); setSwipeDirection(null); }, 300);
      } else if (delta > 0 && currentIndex > 0) {
        setSwipeDirection('right');
        setTimeout(() => { setCurrentIndex(i => i - 1); setSwipeDirection(null); }, 300);
      }
    }
    mouseStartX.current = null;
  };

  const filterBtnStyle = (tabName) => ({
    padding: '6px 16px', borderRadius: '6px', border: 'none',
    background: activeFilter === tabName ? '#16302B' : 'white',
    color: activeFilter === tabName ? 'white' : '#1e3046',
    cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s ease',
    fontSize: '13px',
  });

  const currentOutfit = displayedOutfits[currentIndex];

  if (currentUser) {
    return (
      <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '20px', overflowX: 'hidden' }}>

        {/* Filters row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', marginTop: '1rem', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/upload')} style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #1e3046', background: 'transparent', cursor: 'pointer', color: '#1e3046', fontWeight: '500', fontSize: '13px' }}>
              📸 Upload
            </button>
            <button onClick={() => setActiveFilter('all')} style={filterBtnStyle('all')}>All</button>
            <button onClick={() => setActiveFilter('top-rated')} style={filterBtnStyle('top-rated')}>Top Rated</button>
            <button onClick={() => setActiveFilter('fresh')} style={filterBtnStyle('fresh')}>Fresh</button>
          </div>
          <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: '#1e3046' }}>Your Feed</h2>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8B9AAF' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✨</div>
            <p>Loading latest styles...</p>
          </div>
        ) : displayedOutfits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ fontSize: '1.5rem', fontFamily: "'Cormorant Garamond', serif", color: '#1e3046', marginBottom: '10px' }}>No looks found ✨</h3>
            <p style={{ color: '#666' }}>Try a different filter or be the first to post!</p>
          </div>
        ) : (
          <>
            {/* Card counter */}
            <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '13px', color: '#888' }}>
              {currentIndex + 1} of {displayedOutfits.length}
            </div>

            {/* Swipe area */}
            <div
              ref={cardRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              style={{ display: 'flex', justifyContent: 'center', width: '100%', userSelect: 'none' }}
            >
              <div style={{
                width: '100%',
                maxWidth: '420px',
                transform: swipeDirection === 'left' ? 'translateX(-60px) rotate(-3deg)' : swipeDirection === 'right' ? 'translateX(60px) rotate(3deg)' : 'translateX(0) rotate(0)',
                opacity: swipeDirection ? 0 : 1,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
              }}>
                {currentOutfit && (
                  <OutfitCard key={currentOutfit.id} outfit={currentOutfit} onOutfitUpdate={fetchFeed} />
                )}
              </div>
            </div>

            {/* Swipe nav buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
              <button
                onClick={() => currentIndex > 0 && setCurrentIndex(i => i - 1)}
                disabled={currentIndex === 0}
                style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #16302B', background: 'white', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '18px', opacity: currentIndex === 0 ? 0.3 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >←</button>

              {/* Dots */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {displayedOutfits.slice(Math.max(0, currentIndex - 2), Math.min(displayedOutfits.length, currentIndex + 3)).map((_, i) => {
                  const realIdx = Math.max(0, currentIndex - 2) + i;
                  return (
                    <div key={realIdx} onClick={() => setCurrentIndex(realIdx)} style={{ width: realIdx === currentIndex ? '20px' : '8px', height: '8px', borderRadius: '4px', background: realIdx === currentIndex ? '#16302B' : '#C8C0B8', cursor: 'pointer', transition: 'all 0.2s' }} />
                  );
                })}
              </div>

              <button
                onClick={() => currentIndex < displayedOutfits.length - 1 && setCurrentIndex(i => i + 1)}
                disabled={currentIndex === displayedOutfits.length - 1}
                style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #16302B', background: '#16302B', cursor: currentIndex === displayedOutfits.length - 1 ? 'not-allowed' : 'pointer', fontSize: '18px', opacity: currentIndex === displayedOutfits.length - 1 ? 0.3 : 1, transition: 'all 0.2s', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >→</button>
            </div>

            {/* Swipe hint */}
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', marginTop: '10px', letterSpacing: '0.05em' }}>
              ← Swipe or tap arrows to browse →
            </p>
          </>
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
          <div className="hero-buttons" style={{ flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => router.push('/signup')} style={{ flex: '1', minWidth: '160px' }}>Start Your Journey</button>
            <Link href="/quiz" className="btn-secondary" style={{ flex: '1', minWidth: '160px', textAlign: 'center' }}>✨ Take Style Quiz</Link>
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