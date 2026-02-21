import React, { useState, useRef } from 'react';
import { Music, Play, Pause, Plus, Trash2, Mic, FileText, Volume2, Upload, X } from 'lucide-react';
import { useData } from '../../context/AppContext';
import '../../styles/music-therapy.css';

export const MusicTherapy: React.FC = () => {
  const { musicTracks, addMusicTrack, removeMusicTrack, musicMemories, addMusicMemory, removeMusicMemory } = useData();
  
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<{ id: string; name: string; audioData: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState<string | null>(null);
  const [memoryType, setMemoryType] = useState<'text' | 'voice'>('text');
  const [memoryText, setMemoryText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const audio = new Audio(reader.result as string);
        audio.onloadedmetadata = () => {
          addMusicTrack({
            name: file.name.replace(/\.[^/.]+$/, ''),
            audioData: reader.result as string,
            duration: audio.duration,
          });
        };
      };
      reader.readAsDataURL(file);
    }
    setShowAddMusic(false);
  };

  const playTrack = (track: typeof musicTracks[0]) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(track.audioData);
    audioRef.current = audio;
    setPlayingTrackId(track.id);
    setCurrentTrack({ id: track.id, name: track.name, audioData: track.audioData });
    
    audio.onended = () => {
      setPlayingTrackId(null);
    };
    
    audio.play();
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    }
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingTrackId(null);
      setCurrentTrack(null);
    }
  };

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
          addMusicMemory({
            trackId: showAddMemory!,
            trackName: musicTracks.find(t => t.id === showAddMemory)?.name || '',
            type: 'voice',
            content: '',
            audioData: reader.result as string,
            audioDuration: recordingTime,
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
      setShowAddMemory(null);
    }
  };

  const handleAddTextMemory = () => {
    if (!memoryText.trim() || !showAddMemory) return;
    
    const track = musicTracks.find(t => t.id === showAddMemory);
    addMusicMemory({
      trackId: showAddMemory,
      trackName: track?.name || '',
      type: 'text',
      content: memoryText,
    });
    setMemoryText('');
    setShowAddMemory(null);
  };

  const playMemoryAudio = (memory: typeof musicMemories[0]) => {
    if (memory.audioData) {
      const audio = new Audio(memory.audioData);
      audio.play();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrackMemories = (trackId: string) => {
    return musicMemories.filter(m => m.trackId === trackId);
  };

  return (
    <div className="music-therapy-page">
      <div className="page-header">
        <h1>Music Therapy</h1>
        <p>Listen to soothing music and record your memories</p>
      </div>

      {currentTrack && (
        <div className="now-playing-bar">
          <div className="now-playing-info">
            <Music size={20} />
            <span>{currentTrack.name}</span>
          </div>
          <div className="now-playing-controls">
            {playingTrackId ? (
              <button onClick={pauseTrack} className="control-btn">
                <Pause size={24} />
              </button>
            ) : (
              <button onClick={() => playTrack(musicTracks.find(t => t.id === currentTrack.id)!)} className="control-btn">
                <Play size={24} />
              </button>
            )}
            <button onClick={stopTrack} className="control-btn stop">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-primary" onClick={() => setShowAddMusic(true)}>
          <Plus size={18} /> Add Music
        </button>
      </div>

      {showAddMusic && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add Music</h3>
          <label className="upload-music-btn">
            <Upload size={24} />
            <span>Choose Music File</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>
          <button 
            onClick={() => setShowAddMusic(false)}
            style={{ marginTop: '12px', background: 'none', color: '#64748B' }}
          >
            Cancel
          </button>
        </div>
      )}

      {musicTracks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Music size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No music added yet</h3>
          <p style={{ color: '#64748B' }}>Add your favorite songs to create a soothing playlist</p>
        </div>
      ) : (
        <div className="music-list">
          {musicTracks.map(track => (
            <div key={track.id} className="music-card">
              <div className="music-card-header">
                <div className="music-info">
                  <Music size={20} />
                  <div>
                    <h4>{track.name}</h4>
                    <span>{formatDuration(track.duration)}</span>
                  </div>
                </div>
                <div className="music-actions">
                  {playingTrackId === track.id ? (
                    <button onClick={pauseTrack} className="play-btn playing">
                      <Pause size={18} />
                    </button>
                  ) : (
                    <button onClick={() => playTrack(track)} className="play-btn">
                      <Play size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => setShowAddMemory(track.id)}
                    className="action-icon-btn"
                    title="Add memory"
                  >
                    <Mic size={18} />
                  </button>
                  <button 
                    onClick={() => removeMusicTrack(track.id)}
                    className="action-icon-btn delete"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {getTrackMemories(track.id).length > 0 && (
                <div className="memories-section">
                  <h5>Memories & Feelings</h5>
                  {getTrackMemories(track.id).map(memory => (
                    <div key={memory.id} className="memory-item">
                      <div className="memory-icon">
                        {memory.type === 'voice' ? <Volume2 size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="memory-content">
                        {memory.type === 'text' ? (
                          <p>{memory.content}</p>
                        ) : (
                          <button 
                            onClick={() => playMemoryAudio(memory)}
                            className="play-memory-btn"
                          >
                            <Play size={14} /> Play voice memory ({formatDuration(memory.audioDuration || 0)})
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => removeMusicMemory(memory.id)}
                        className="delete-memory-btn"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showAddMemory === track.id && (
                <div className="add-memory-form">
                  <div className="memory-type-tabs">
                    <button 
                      className={memoryType === 'text' ? 'active' : ''}
                      onClick={() => setMemoryType('text')}
                    >
                      <FileText size={16} /> Write
                    </button>
                    <button 
                      className={memoryType === 'voice' ? 'active' : ''}
                      onClick={() => setMemoryType('voice')}
                    >
                      <Mic size={16} /> Voice
                    </button>
                  </div>

                  {memoryType === 'text' ? (
                    <div className="text-memory-form">
                      <textarea
                        placeholder="Write about your feelings or memories related to this song..."
                        value={memoryText}
                        onChange={(e) => setMemoryText(e.target.value)}
                        rows={3}
                      />
                      <div className="form-actions">
                        <button 
                          onClick={handleAddTextMemory}
                          className="btn btn-primary"
                          disabled={!memoryText.trim()}
                        >
                          Save Memory
                        </button>
                        <button 
                          onClick={() => { setShowAddMemory(null); setMemoryText(''); }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="voice-memory-form">
                      {!isRecording ? (
                        <button onClick={startRecording} className="record-btn">
                          <Mic size={18} /> Start Recording
                        </button>
                      ) : (
                        <div className="recording">
                          <span className="recording-dot"></span>
                          Recording... {formatDuration(recordingTime)}
                          <button onClick={stopRecording} className="stop-recording-btn">
                            Stop
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
