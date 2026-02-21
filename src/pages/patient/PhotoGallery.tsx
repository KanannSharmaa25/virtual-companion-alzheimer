import React, { useState, useRef } from 'react';
import { Upload, X, Image, User } from 'lucide-react';
import { useUser, useData } from '../../context/AppContext';
import '../../styles/photos.css';

export const PhotoGallery: React.FC = () => {
  const { user } = useUser();
  const { photos, addPhoto } = useData();
  
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addPhoto({
          senderId: user?.id || '',
          senderName: user?.name || 'Unknown',
          senderRole: user?.role || 'patient',
          imageData: reader.result as string,
          caption: caption || '',
        });
        setCaption('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const patientPhotos = photos.filter(p => p.senderRole === 'caregiver');
  const caregiverPhotos = photos.filter(p => p.senderRole === 'patient');

  const displayedPhotos = user?.role === 'patient' ? patientPhotos : caregiverPhotos;

  return (
    <div className="photos-page">
      <div className="page-header">
        <h1>Photo Gallery</h1>
        <p>Share precious moments with your loved ones</p>
      </div>

      <div className="upload-section">
        <h2>Share a Photo</h2>
        <div className="upload-controls">
          <button className="upload-btn" onClick={handleUploadClick}>
            <Upload size={24} />
            <span>Choose Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="caption-input"
          />
        </div>
      </div>

      <div className="gallery-section">
        <h2>{user?.role === 'patient' ? 'Photos from Family' : 'Photos from Patient'}</h2>
        
        {displayedPhotos.length === 0 ? (
          <div className="empty-state">
            <Image size={48} />
            <p>No photos yet</p>
            <span>{user?.role === 'patient' ? 'Family members can share photos with you' : 'Share photos with the patient'}</span>
          </div>
        ) : (
          <div className="gallery-grid">
            {displayedPhotos.map(photo => (
              <div 
                key={photo.id} 
                className="photo-card"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img src={photo.imageData} alt={photo.caption || 'Photo'} />
                {photo.caption && (
                  <div className="photo-caption">{photo.caption}</div>
                )}
                <div className="photo-overlay">
                  <span className="photo-sender">{photo.senderName}</span>
                  <span className="photo-date">{formatDate(photo.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <button className="close-modal" onClick={() => setSelectedPhoto(null)}>
            <X size={24} />
          </button>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto.imageData} alt={selectedPhoto.caption || 'Photo'} />
            <div className="modal-info">
              <div className="modal-sender">
                <User size={18} />
                <span>{selectedPhoto.senderName}</span>
              </div>
              {selectedPhoto.caption && (
                <p className="modal-caption">{selectedPhoto.caption}</p>
              )}
              <span className="modal-date">{formatDate(selectedPhoto.timestamp)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
