import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, User, Video, X } from 'lucide-react';
import { useUser, useData } from '../../context/AppContext';
import '../../styles/voice.css';

export const VoiceMessages: React.FC = () => {
  const { user } = useUser();
  const { voiceMessages, addVoiceMessage, markVoiceMessagePlayed, videoMessages, addVideoMessage, markVideoMessagePlayed } = useData();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          addVoiceMessage({
            senderId: user?.id || '',
            senderName: user?.name || 'Unknown',
            senderRole: user?.role || 'patient',
            audioData: reader.result as string,
            duration: recordingTime,
          });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoStream(stream);
      
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      videoRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          addVideoMessage({
            senderId: user?.id || '',
            senderName: user?.name || 'Unknown',
            senderRole: user?.role || 'patient',
            videoData: reader.result as string,
            duration: recordingTime,
          });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      };

      mediaRecorder.start();
      setIsRecordingVideo(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting video recording:', err);
      alert('Could not access camera/microphone. Please grant permission.');
    }
  };

  const stopVideoRecording = () => {
    if (videoRecorderRef.current && isRecordingVideo) {
      videoRecorderRef.current.stop();
      setIsRecordingVideo(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playMessage = (message: typeof voiceMessages[0]) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(message.audioData);
    audioRef.current = audio;
    setPlayingId(message.id);
    
    if (!message.played) {
      markVoiceMessagePlayed(message.id);
    }

    audio.onended = () => {
      setPlayingId(null);
    };

    audio.play();
  };

  const playVideoMessage = (message: typeof videoMessages[0]) => {
    setShowVideoPreview(message.videoData);
    
    if (!message.played) {
      markVideoMessagePlayed(message.id);
    }
  };

  const closeVideoPreview = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoPreview(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const patientVoiceMessages = voiceMessages.filter(m => m.senderRole === 'caregiver');
  const caregiverVoiceMessages = voiceMessages.filter(m => m.senderRole === 'patient');
  const patientVideoMessages = videoMessages.filter(m => m.senderRole === 'caregiver');
  const caregiverVideoMessages = videoMessages.filter(m => m.senderRole === 'patient');

  return (
    <div className="voice-page">
      <div className="page-header">
        <h1>Voice & Video Messages</h1>
        <p>Record and share voice and video messages with your loved ones</p>
      </div>

      {user?.role === 'caregiver' && (
        <div className="recorder-section">
          <h2>Record a Message for the Patient</h2>
          
          {(isRecording || isRecordingVideo) && (
            <div className="recording-preview">
              {isRecordingVideo && videoStream && (
                <div className="video-preview-container">
                  <video ref={previewVideoRef} autoPlay muted playsInline className="live-preview" />
                  <div className="recording-badge">
                    <span className="rec-dot"></span>
                    Recording Video
                  </div>
                </div>
              )}
              {isRecording && !isRecordingVideo && (
                <div className="audio-preview-container">
                  <div className="audio-wave">
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                  </div>
                  <div className="recording-badge">
                    <span className="rec-dot"></span>
                    Recording Voice
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="recorder-options">
            <div className="recorder-controls">
              {!isRecording ? (
                <button className="record-btn" onClick={startRecording}>
                  <Mic size={24} />
                  <span>Voice Message</span>
                </button>
              ) : (
                <button className="stop-btn" onClick={stopRecording}>
                  <Square size={24} />
                  <span>Stop ({formatTime(recordingTime)})</span>
                </button>
              )}
              
              {!isRecordingVideo ? (
                <button className="record-btn video" onClick={startVideoRecording}>
                  <Video size={24} />
                  <span>Video Message</span>
                </button>
              ) : (
                <button className="stop-btn video" onClick={stopVideoRecording}>
                  <Square size={24} />
                  <span>Stop Video ({formatTime(recordingTime)})</span>
                </button>
              )}
            </div>
            
            {(isRecording || isRecordingVideo) && (
              <div className="recording-indicator">
                <span className="pulse"></span>
                Recording... {formatTime(recordingTime)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="messages-section">
        <h2>{user?.role === 'patient' ? 'Messages from Family' : "Patient's Messages"}</h2>
        
        {(user?.role === 'patient' ? [...patientVoiceMessages, ...patientVideoMessages] : [...caregiverVoiceMessages, ...caregiverVideoMessages]).length === 0 ? (
          <div className="empty-state">
            <Volume2 size={48} />
            <p>No messages yet</p>
            <span>{user?.role === 'patient' ? 'Family members can record messages for you' : 'Record a message for the patient'}</span>
          </div>
        ) : (
          <div className="messages-list">
            {(user?.role === 'patient' ? patientVideoMessages : caregiverVideoMessages).map(message => (
              <div key={message.id} className={`message-card video ${!message.played && user?.role === 'patient' ? 'unplayed' : ''}`}>
                <div className="message-avatar">
                  <Video size={20} />
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">{message.senderName}</span>
                    <span className="message-time">{formatDate(message.timestamp)}</span>
                  </div>
                  <div className="message-actions">
                    <button 
                      className="play-btn"
                      onClick={() => playVideoMessage(message)}
                    >
                      <Play size={18} />
                      <span>Video {formatTime(message.duration)}</span>
                    </button>
                    {!message.played && user?.role === 'patient' && (
                      <span className="new-badge">New</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {(user?.role === 'patient' ? patientVoiceMessages : caregiverVoiceMessages).map(message => (
              <div key={message.id} className={`message-card ${!message.played && user?.role === 'patient' ? 'unplayed' : ''}`}>
                <div className="message-avatar">
                  <User size={20} />
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">{message.senderName}</span>
                    <span className="message-time">{formatDate(message.timestamp)}</span>
                  </div>
                  <div className="message-actions">
                    <button 
                      className="play-btn"
                      onClick={() => playMessage(message)}
                    >
                      {playingId === message.id ? <Pause size={18} /> : <Play size={18} />}
                      <span>{formatTime(message.duration)}</span>
                    </button>
                    {!message.played && user?.role === 'patient' && (
                      <span className="new-badge">New</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showVideoPreview && (
        <div className="video-preview-overlay" onClick={closeVideoPreview}>
          <div className="video-preview-content" onClick={e => e.stopPropagation()}>
            <button className="close-video-btn" onClick={closeVideoPreview}>
              <X size={24} />
            </button>
            <video ref={videoRef} src={showVideoPreview} controls autoPlay />
          </div>
        </div>
      )}
    </div>
  );
};
