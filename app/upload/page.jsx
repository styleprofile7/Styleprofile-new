'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../utils/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Upload() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    caption: '', tags: '', brands: '', occasion: '', inCloset: false
  });

  if (!currentUser) { router.push('/login'); return null; }

  const processFile = (file) => {
    setError('');
    if (!file.type.match('image.*')) { setError('Please select an image (JPG, PNG, WebP)'); return; }
    if (file.size > 15 * 1024 * 1024) { setError('Max size is 15MB'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  // Fast compression — targets 800KB max
  const compressImage = async (imageFile) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1280; // smaller = faster upload
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = (height / width) * maxDim; width = maxDim; }
          else { width = (width / height) * maxDim; height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], imageFile.name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', 0.75); // 75% quality — good balance of speed & quality
        URL.revokeObjectURL(img.src);
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !currentUser) return;
    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Step 1: Compress
      setUploadStage('Compressing image...');
      setUploadProgress(10);
      const fileToUpload = await compressImage(selectedFile);

      // Step 2: Upload with progress tracking
      setUploadStage('Uploading to cloud...');
      const fileName = `${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `outfits/${currentUser.uid}/${fileName}`);

      const imageUrl = await new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
        uploadTask.on('state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 70) + 20;
            setUploadProgress(pct);
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      // Step 3: Save to Firestore
      setUploadStage('Saving your post...');
      setUploadProgress(92);
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      await addDoc(collection(db, 'outfits'), {
        userId: currentUser.uid,
        userName: currentUser.name || 'Anonymous',
        userInitial: currentUser.initial || 'U',
        userProfileImage: currentUser.profileImage || null,
        personality: currentUser.personality || 'creative',
        image: imageUrl,
        imageUrl,
        caption: formData.caption,
        tags: tagsArray,
        brands: formData.brands,
        occasion: formData.occasion,
        inCloset: formData.inCloset,
        likes: [], ratings: [], avgRating: 0, totalRatings: 0,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        postsCount: increment(1), points: increment(50)
      });

      setUploadProgress(100);
      setUploadStage('Posted! 🎉');

      setTimeout(() => router.push('/'), 800);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please check your connection and try again.');
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStage('');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="upload-section">
        <h2 style={{ marginBottom: '1.5rem', fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem' }}>
          Share Your Style
        </h2>

        {error && (
          <div style={{ color: '#d9534f', background: '#fdf0ef', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div style={{ marginBottom: '24px', padding: '20px', background: '#F0EDE8', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#16302B' }}>{uploadStage}</span>
              <span style={{ fontWeight: '700', color: '#A38560' }}>{uploadProgress}%</span>
            </div>
            <div style={{ height: '8px', background: '#DDD', borderRadius: '50px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #16302B, #A38560)', borderRadius: '50px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {!previewUrl ? (
          <div
            className={`upload-area${isDragging ? ' dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current.click()}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
            <h3>Tap to upload your outfit</h3>
            <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '13px' }}>JPG, PNG, WebP · Max 15MB</p>
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', background: '#f0f4f8' }} />
              <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            </div>

            <div className="form-group">
              <label>Caption</label>
              <textarea rows="3" placeholder="What's the story behind this look?" value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" placeholder="vintage, streetwear, night out" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="upload-row">
              <div className="form-group">
                <label>Brands</label>
                <input type="text" placeholder="Gucci, Zara, Thrifted..." value={formData.brands} onChange={(e) => setFormData({ ...formData, brands: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Occasion</label>
                <select value={formData.occasion} onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}>
                  <option value="">Select occasion...</option>
                  <option value="Casual">Casual / Everyday</option>
                  <option value="Night Out">Night Out</option>
                  <option value="Work">Work / Professional</option>
                  <option value="Formal">Formal / Event</option>
                  <option value="Streetwear">Streetwear</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input type="checkbox" id="closet" checked={formData.inCloset} onChange={(e) => setFormData({ ...formData, inCloset: e.target.checked })} style={{ width: 'auto' }} />
              <label htmlFor="closet" style={{ margin: 0, cursor: 'pointer', fontSize: '14px' }}>Add to My Digital Closet 👗</label>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }} disabled={isUploading}>
              {isUploading ? `${uploadStage} ${uploadProgress}%` : 'Post Outfit ✦ +50 pts'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}