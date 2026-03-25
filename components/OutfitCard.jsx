'use client';

import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';
import { getPersonalityName } from '../utils/quizData';

export default function OutfitCard({ outfit, onOutfitUpdate }) {
  const { currentUser } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [wearChoice, setWearChoice] = useState(null);

  const isLiked = currentUser ? (outfit.likes || []).includes(currentUser.uid) : false;
  const likeCount = (outfit.likes || []).length;
  const userRating = currentUser ? (outfit.ratings || []).find(r => r.userId === currentUser.uid) : null;

  const handleLike = async () => {
    if (!currentUser) { alert('Please log in to like outfits!'); return; }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const outfitRef = doc(db, 'outfits', outfit.id);
      const userRef = doc(db, 'users', currentUser.uid);
      if (isLiked) {
        await updateDoc(outfitRef, { likes: arrayRemove(currentUser.uid) });
      } else {
        await Promise.all([
          updateDoc(outfitRef, { likes: arrayUnion(currentUser.uid) }),
          updateDoc(userRef, { points: increment(5) })
        ]);
      }
      if (onOutfitUpdate) onOutfitUpdate();
    } catch (error) {
      console.error('Error liking outfit:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleRate = async (ratingValue) => {
    if (!currentUser) return alert('Please log in to rate!');
    if (userRating) return alert('You already rated this outfit!');
    try {
      const outfitRef = doc(db, 'outfits', outfit.id);
      const userRef = doc(db, 'users', currentUser.uid);
      const newRatings = [...(outfit.ratings || []), { userId: currentUser.uid, rating: ratingValue }];
      const avgRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;
      await Promise.all([
        updateDoc(outfitRef, { ratings: newRatings, totalRatings: newRatings.length, avgRating }),
        updateDoc(userRef, { points: increment(10) })
      ]);
      alert(`Rated ${ratingValue} stars! +10 Style Points 🌟`);
      if (onOutfitUpdate) onOutfitUpdate();
    } catch (error) {
      console.error('Error rating outfit:', error);
    }
  };

  const handleVote = async (choice) => {
    if (!currentUser) return alert('Please log in to vote!');
    setWearChoice(choice);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { points: increment(2) });
    } catch (error) {
      console.error('Error processing vote:', error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}?outfit=${outfit.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
    }
  };

  const cardColor = '#16302B';
  const textColor = '#E8B87D';
  const pillBtnStyle = (active) => ({
    padding: '6px 16px', borderRadius: '20px',
    background: active ? 'rgba(255,255,255,0.3)' : 'transparent',
    border: `3px solid #A38560`, cursor: 'pointer',
    color: textColor, fontSize: '0.85rem', fontWeight: active ? '700' : '500',
    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px'
  });

  return (
    <div className="outfit-card" style={{
      display: 'flex', flexDirection: 'column',
      backgroundColor: cardColor, borderRadius: '24px', color: textColor,
      overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.25)'
    }}>

      {/* IMAGE with face blur */}
      <div style={{ position: 'relative', height: '420px', flexShrink: 0, overflow: 'hidden', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
        <img
          src={outfit.image || outfit.imageUrl}
          alt={outfit.occasion || 'Outfit'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Face blur - blurs top 30% where face typically appears */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '32%',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          background: 'rgba(22,48,43,0.1)', pointerEvents: 'none', zIndex: 1,
        }} />
        {/* Privacy badge */}
        <div style={{
          position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(22,48,43,0.85)', color: '#C9A84C',
          fontSize: '9px', fontWeight: '700', letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: '3px 12px', borderRadius: '20px',
          whiteSpace: 'nowrap', zIndex: 2, pointerEvents: 'none',
        }}>🔒 Face Protected</div>
        {/* SP badge */}
        <div style={{ position: 'absolute', bottom: '12px', left: '14px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', color: 'white', zIndex: 2 }}>SP</div>
        {/* Action icons */}
        <div style={{ position: 'absolute', top: '10px', right: '12px', backgroundColor: 'white', padding: '5px 10px', borderRadius: '20px', display: 'flex', gap: '8px', alignItems: 'center', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <span title="Fire">🔥</span>
          <span title="Trophy">🏆</span>
          <span
            onClick={handleLike}
            style={{ cursor: 'pointer', fontSize: '1.1rem', transition: 'transform 0.2s', transform: isLiked ? 'scale(1.2)' : 'scale(1)' }}
          >{isLiked ? '❤️' : '🤍'}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* User row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#A38560', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden' }}>
              {outfit.userProfileImage
                ? <img src={outfit.userProfileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (outfit.userName ? outfit.userName[0].toUpperCase() : 'U')}
            </div>
            <span style={{ fontWeight: '700', fontSize: '1.05rem', color: textColor }}>{outfit.userName || 'Anonymous'}</span>
          </div>
          <div style={{ backgroundColor: '#2b3a4a', color: 'white', padding: '4px 14px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '600' }}>
            {getPersonalityName(outfit.personality)}
          </div>
        </div>

        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: '500', fontFamily: "'Cormorant Garamond', serif", color: textColor }}>
          {outfit.occasion || 'Everyday Style'}
        </h3>

        {outfit.tags && outfit.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {outfit.tags.slice(0, 3).map((tag, i) => (
              <span key={i} style={{ border: `1px solid rgba(163,133,96,0.4)`, borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', color: textColor }}>{tag}</span>
            ))}
          </div>
        )}

        {outfit.caption && (
          <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', opacity: 0.85, lineHeight: '1.5', flexGrow: 1 }}>{outfit.caption}</p>
        )}

        <div style={{ marginTop: 'auto' }}>
          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                style={{
                  cursor: userRating ? 'default' : 'pointer',
                  fontSize: '1.4rem',
                  transition: 'transform 0.2s',
                  transform: hoveredStar === star ? 'scale(1.2)' : 'scale(1)',
                  color: ((userRating && userRating.rating >= star) || hoveredStar >= star) ? textColor : '#470B0B'
                }}
              >★</span>
            ))}
            {outfit.avgRating > 0 && (
              <span style={{ fontSize: '0.85rem', marginLeft: '8px', opacity: 0.7 }}>{outfit.avgRating.toFixed(1)}★</span>
            )}
          </div>

          {/* Like & Share */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <button onClick={handleLike} style={pillBtnStyle(isLiked)}>
              {isLiked ? '❤️' : '🤍'} <span>{likeCount}</span>
            </button>
            <button onClick={handleShare} style={pillBtnStyle(false)}>🔗 Share</button>
          </div>

          {/* Would you wear this? */}
          <div style={{ textAlign: 'center', borderTop: `1px solid rgba(44,62,80,0.1)`, paddingTop: '20px' }}>
            <p style={{ margin: '0 0 16px 0', fontWeight: '600', fontSize: '0.95rem', opacity: 0.8 }}>Would you wear this?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {['Yes', 'Adapt It', 'No'].map((choice) => (
                <button
                  key={choice}
                  style={pillBtnStyle(wearChoice === choice)}
                  onClick={() => handleVote(choice)}
                >{choice}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}