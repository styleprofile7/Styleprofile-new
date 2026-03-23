'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../utils/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Upload() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ caption: '', tags: '', brands: '', occasion: '', inCloset: false });

  if (!currentUser) { router.push('/login'); return null; }

  const processFile = (file) => {
    setError('');
    if (!file.type.match('image.*')) { setError('Please select an image file (JPG, PNG, WebP)'); return; }
    if (file.size > 15 * 1024 * 1024) { setError('Image is too large. Maximum size is 15MB.'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const compressImage = async (imageFile) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) { height = (height / width) * maxDimension; width = maxDimension; }
          else { width = (width / height) * maxDimension; height = maxDimension; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], imageFile.name, { type: 'image/jpeg', lastModified: Date.now() }));
          else reject(new Error('Canvas to Blob failed'));
        }, 'image/jpeg', 0.8);
      };
      img.onerror = () => reject(new Error('Image load failed'));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !currentUser) return;
    setIsUploading(true); setError('');
    try {
      const fileToUpload = await compressImage(selectedFile);
      const fileName = `${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `outfits/${currentUser.uid}/${fileName}`);
      const uploadTask = await uploadBytes(storageRef, fileToUpload);
      const imageUrl = await getDownloadURL(uploadTask.ref);
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const outfitData = {
        userId: currentUser.uid,
        userName: currentUser.name || 'Anonymous',
        userInitial: currentUser.initial || 'U',
        userProfileImage: currentUser.profileImage || null,
        personality: currentUser.personality || 'creative',
        image: imageUrl,
        imageUrl: imageUrl,
        caption: formData.caption,
        tags: tagsArray,
        brands: formData.brands,
        occasion: formData.occasion,
        inCloset: formData.inCloset,
        likes: [],
        ratings: [],
        avgRating: 0,
        totalRatings: 0,
        timestamp: serverTimestamp()
      };
      await addDoc(collection(db, 'outfits'), outfitData);
      await updateDoc(doc(db, 'users', currentUser.uid), { postsCount: increment(1), points: increment(50) });
      alert('Outfit posted successfully! +50 points 🌟');
      router.push('/');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please check your connection and try again.');
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="upload-section">
        <h2 style={{ marginBottom: '1.5rem', fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem' }}>Share Your Style</h2>
        {error && <div style={{ color: '#d9534f', background: '#fdf0ef', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
        {!previewUrl ? (
          <div
            className={`upload-area${isDragging ? ' dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current.click()}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
            <h3>Drag & Drop your outfit photo here</h3>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>or click to browse files (JPG, PNG, WebP)</p>
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '12px', background: '#f0f4f8' }} />
              <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="form-group">
              <label>Caption / Story</label>
              <textarea rows="3" placeholder="What's the inspiration behind this look?" value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" placeholder="e.g. vintage, streetwear, night out" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Brands (Optional)</label>
                <input type="text" placeholder="Gucci, Zara, Thrifted..." value={formData.brands} onChange={(e) => setFormData({ ...formData, brands: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Occasion</label>
                <select value={formData.occasion} onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}>
                  <option value="">Select an occasion...</option>
                  <option value="Casual">Casual / Everyday</option>
                  <option value="Night Out">Night Out</option>
                  <option value="Work">Work / Professional</option>
                  <option value="Formal">Formal / Event</option>
                  <option value="Streetwear">Streetwear</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="addToCloset" checked={formData.inCloset} onChange={(e) => setFormData({ ...formData, inCloset: e.target.checked })} style={{ width: 'auto' }} />
              <label htmlFor="addToCloset" style={{ margin: 0, cursor: 'pointer' }}>Add to my Digital Closet 👗</label>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Post Outfit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
