import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, Sparkles, BookOpen, Calendar, ChevronDown, ChevronUp, Heart, Smile, Meh, Frown, Star } from 'lucide-react';
import { useUser, useData } from '../../context/AppContext';
import '../../styles/voice.css';

const JOURNAL_PROMPTS = {
  today: [
    "What was the best part of your day today?",
    "What made you smile today?",
    "What did you have for breakfast/lunch/dinner?",
    "Did you do anything fun today?",
    "What was the weather like today?",
    "Did you talk to anyone special today?",
    "What did you learn today?",
    "What are you grateful for today?",
  ],
  family: [
    "Tell me about your family. Who do you love most?",
    "Do you have any children or grandchildren? What are their names?",
    "What do you remember about your parents?",
    "Do you have any siblings? What are they like?",
    "What's your favorite memory with your family?",
    "Did you see any family members recently? How did it go?",
    "What family tradition do you cherish the most?",
    "Do you have a favorite story about your spouse/partner?",
  ],
  friends: [
    "Who is your best friend? How did you meet?",
    "Do you have any childhood friends you still remember?",
    "What do you like to do with your friends?",
    "Did you have any friends when you were young?",
    "What's your favorite memory with friends?",
    "Do you stay in touch with any old friends?",
    "What qualities do you look for in a friend?",
    "Did anyone do something kind for you recently?",
  ],
  spouse: [
    "How did you meet your spouse?",
    "What was your wedding day like?",
    "What do you love most about your spouse?",
    "What's your favorite thing to do together?",
    "Do you have any funny stories about your spouse?",
    "What is your spouse's best quality?",
    "How do you like to spend time with your spouse?",
    "What is your favorite memory with your spouse?",
  ],
  favorites: [
    "What is your favorite food?",
    "What is your favorite movie or TV show?",
    "What is your favorite song or type of music?",
    "What is your favorite color?",
    "What is your favorite season and why?",
    "What is your favorite holiday?",
    "What is your favorite thing to do for fun?",
    "What is your favorite place in the world?",
  ],
  memories: [
    "What is your earliest memory?",
    "What was your childhood home like?",
    "What did you want to be when you grew up?",
    "What was your favorite subject in school?",
    "Do you remember any holidays from when you were young?",
    "What was the happiest day of your life?",
    "What accomplishment are you most proud of?",
    "What advice would you give to your younger self?",
  ],
  feelings: [
    "How are you feeling right now?",
    "What made you happy recently?",
    "Is there anything worrying you?",
    "What makes you feel peaceful?",
    "What activities make you feel good?",
    "Do you have any goals you'd like to achieve?",
    "What are you looking forward to?",
    "What would make today a perfect day?",
  ],
};

const MOODS = [
  { value: 'happy', label: 'Happy', icon: Smile, color: '#10B981' },
  { value: 'good', label: 'Good', icon: Heart, color: '#3B82F6' },
  { value: 'okay', label: 'Okay', icon: Meh, color: '#F59E0B' },
  { value: 'sad', label: 'Sad', icon: Frown, color: '#6B7280' },
  { value: 'grateful', label: 'Grateful', icon: Star, color: '#EC4899' },
];

export const PatientJournal: React.FC = () => {
  const { user } = useUser();
  const { journalEntries, addJournalEntry, removeJournalEntry } = useData();
  
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [mood, setMood] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof JOURNAL_PROMPTS>('today');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
      if (playingAudio) playingAudio.pause();
    };
  }, [playingAudio]);

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
          setAudioData(reader.result as string);
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

  const clearRecording = () => {
    setAudioData(null);
    setRecordingTime(0);
  };

  const getRandomPrompt = () => {
    const prompts = JOURNAL_PROMPTS[selectedCategory];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(randomPrompt);
    setShowPrompts(false);
  };

  const handleSaveEntry = () => {
    if (!content.trim() && !audioData) return;
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    addJournalEntry({
      date: dateStr,
      content,
      audioData: audioData || undefined,
      audioDuration: recordingTime || undefined,
      prompt: prompt || undefined,
      mood: mood || undefined,
    });
    
    setContent('');
    setPrompt('');
    setMood('');
    setAudioData(null);
    setRecordingTime(0);
  };

  const playAudio = (audioData: string, id: string) => {
    if (playingAudio) {
      playingAudio.pause();
    }
    const audio = new Audio(audioData);
    audio.onended = () => setPlayingAudio(null);
    audio.play();
    setPlayingAudio(audio);
    setPlayingId(id);
  };

  const stopAudio = () => {
    if (playingAudio) {
      playingAudio.pause();
      setPlayingAudio(null);
    }
    setPlayingId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupedEntries = journalEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, typeof journalEntries>);

  return (
    <div className="journal-page">
      <div className="journal-header">
        <h1><BookOpen size={28} /> My Journal</h1>
        <p>Write or record your thoughts and memories</p>
      </div>

      <div className="journal-compose">
        <div className="compose-section">
          <div className="prompt-section">
            <button 
              className="prompt-button"
              onClick={() => setShowPrompts(!showPrompts)}
            >
              <Sparkles size={20} />
              Get a Writing Prompt
            </button>
            
            {showPrompts && (
              <div className="prompt-popup">
                <div className="category-tabs">
                  {Object.keys(JOURNAL_PROMPTS).map(cat => (
                    <button
                      key={cat}
                      className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat as keyof typeof JOURNAL_PROMPTS)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="random-prompt-btn" onClick={getRandomPrompt}>
                  <Sparkles size={16} />
                  Random Prompt
                </button>
              </div>
            )}
          </div>

          {prompt && (
            <div className="active-prompt">
              <Sparkles size={16} />
              <span>{prompt}</span>
              <button onClick={() => setPrompt('')}><ChevronUp size={16} /></button>
            </div>
          )}
        </div>

        <div className="compose-section">
          <label>How are you feeling?</label>
          <div className="mood-selector">
            {MOODS.map(m => (
              <button
                key={m.value}
                className={`mood-btn ${mood === m.value ? 'active' : ''}`}
                style={{ '--mood-color': m.color } as React.CSSProperties}
                onClick={() => setMood(m.value)}
              >
                <m.icon size={20} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="compose-section">
          <textarea
            className="journal-textarea"
            placeholder="Write about your day, your feelings, or your memories..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </div>

        <div className="compose-section voice-section">
          <div className="voice-recorder">
            {audioData ? (
              <div className="recorded-audio">
                <button className="play-btn" onClick={() => playAudio(audioData, 'current')}>
                  {playingId === 'current' ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <span className="duration">{formatTime(recordingTime)}</span>
                <button className="clear-btn" onClick={clearRecording}>
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <button
                className={`record-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <Square size={20} />
                    <span>Stop ({formatTime(recordingTime)})</span>
                  </>
                ) : (
                  <>
                    <Mic size={20} />
                    <span>Record Voice</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <button 
          className="save-journal-btn"
          onClick={handleSaveEntry}
          disabled={!content.trim() && !audioData}
        >
          <BookOpen size={20} />
          Save Entry
        </button>
      </div>

      <div className="journal-entries">
        <h2><Calendar size={24} /> Past Entries</h2>
        
        {journalEntries.length === 0 ? (
          <div className="no-entries">
            <BookOpen size={48} />
            <p>No journal entries yet.</p>
            <p>Start writing or recording to capture your memories!</p>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([date, entries]) => (
            <div key={date} className="entry-group">
              <div className="entry-date">{date}</div>
              {entries.map(entry => (
                <div 
                  key={entry.id} 
                  className={`journal-entry ${expandedEntry === entry.id ? 'expanded' : ''}`}
                >
                  <div 
                    className="entry-header"
                    onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                  >
                    <div className="entry-preview">
                      {entry.mood && (
                        <span className="entry-mood" style={{ color: MOODS.find(m => m.value === entry.mood)?.color }}>
                          {MOODS.find(m => m.value === entry.mood)?.icon && 
                            React.createElement(MOODS.find(m => m.value === entry.mood)!.icon, { size: 16 })}
                        </span>
                      )}
                      <span className="entry-text">
                        {entry.content?.substring(0, 50) || (entry.audioData ? 'Voice recording' : '')}
                        {entry.content?.length > 50 ? '...' : ''}
                      </span>
                    </div>
                    <div className="entry-actions">
                      {entry.audioData && (
                        <button 
                          className="entry-play-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            playingId === entry.id ? stopAudio() : playAudio(entry.audioData!, entry.id);
                          }}
                        >
                          {playingId === entry.id ? <Pause size={16} /> : <Volume2 size={16} />}
                        </button>
                      )}
                      {expandedEntry === entry.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                  
                  {expandedEntry === entry.id && (
                    <div className="entry-content">
                      {entry.prompt && (
                        <div className="entry-prompt">
                          <Sparkles size={14} />
                          <span>{entry.prompt}</span>
                        </div>
                      )}
                      {entry.content && <p>{entry.content}</p>}
                      {entry.audioData && (
                        <div className="entry-audio">
                          <button 
                            className="play-full-btn"
                            onClick={() => playingId === entry.id ? stopAudio() : playAudio(entry.audioData!, entry.id)}
                          >
                            {playingId === entry.id ? <><Pause size={18} /> Stop</> : <><Play size={18} /> Play Voice ({formatTime(entry.audioDuration || 0)})</>}
                          </button>
                        </div>
                      )}
                      <div className="entry-footer">
                        <span className="entry-time">{formatTimestamp(entry.createdAt)}</span>
                        <button 
                          className="delete-entry-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this journal entry?')) {
                              removeJournalEntry(entry.id);
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <style>{`
        .journal-page {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .journal-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .journal-header h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #1E293B;
          margin-bottom: 8px;
        }

        .journal-header p {
          color: #64748B;
          font-size: 16px;
        }

        .journal-compose {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          margin-bottom: 32px;
        }

        .compose-section {
          margin-bottom: 20px;
        }

        .compose-section label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .prompt-section {
          position: relative;
        }

        .prompt-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .prompt-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        .prompt-popup {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          padding: 16px;
          z-index: 100;
          min-width: 300px;
        }

        .category-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .category-tab {
          padding: 6px 12px;
          background: #F1F5F9;
          border: none;
          border-radius: 20px;
          font-size: 13px;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-tab.active {
          background: #8B5CF6;
          color: white;
        }

        .random-prompt-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          background: #F59E0B;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .random-prompt-btn:hover {
          background: #D97706;
        }

        .active-prompt {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border-radius: 12px;
          margin-top: 16px;
          color: #92400E;
          font-size: 15px;
        }

        .active-prompt button {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #92400E;
        }

        .mood-selector {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .mood-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 16px;
          background: #F8FAFC;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mood-btn.active {
          border-color: var(--mood-color);
          background: color-mix(in srgb, var(--mood-color) 10%, white);
        }

        .mood-btn span {
          font-size: 13px;
          color: #64748B;
        }

        .mood-btn.active span {
          color: var(--mood-color);
          font-weight: 600;
        }

        .journal-textarea {
          width: 100%;
          padding: 16px;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .journal-textarea:focus {
          outline: none;
          border-color: #8B5CF6;
        }

        .voice-section {
          display: flex;
          justify-content: center;
          padding: 16px 0;
          border-top: 1px solid #E2E8F0;
          border-bottom: 1px solid #E2E8F0;
        }

        .voice-recorder {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .record-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: #EF4444;
          color: white;
          border: none;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .record-btn.recording {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .recorded-audio {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: #F0FDF4;
          border-radius: 30px;
        }

        .recorded-audio .play-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #10B981;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .recorded-audio .duration {
          color: #059669;
          font-weight: 600;
        }

        .recorded-audio .clear-btn {
          background: none;
          border: none;
          color: #DC2626;
          cursor: pointer;
          padding: 4px;
        }

        .save-journal-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px;
          background: #10B981;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .save-journal-btn:hover:not(:disabled) {
          background: #059669;
        }

        .save-journal-btn:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
        }

        .journal-entries h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1E293B;
          margin-bottom: 20px;
        }

        .no-entries {
          text-align: center;
          padding: 48px;
          background: #F8FAFC;
          border-radius: 16px;
          color: #94A3B8;
        }

        .no-entries svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .no-entries p {
          margin: 4px 0;
        }

        .entry-group {
          margin-bottom: 24px;
        }

        .entry-date {
          font-size: 14px;
          font-weight: 600;
          color: #64748B;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #E2E8F0;
        }

        .journal-entry {
          background: white;
          border-radius: 12px;
          margin-bottom: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .entry-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .entry-header:hover {
          background: #F8FAFC;
        }

        .entry-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .entry-mood {
          display: flex;
          align-items: center;
        }

        .entry-text {
          color: #374151;
          font-size: 15px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .entry-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .entry-play-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #F1F5F9;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748B;
        }

        .entry-content {
          padding: 16px;
          border-top: 1px solid #E2E8F0;
          background: #FAFBFC;
        }

        .entry-prompt {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          background: #F5F3FF;
          border-radius: 8px;
          margin-bottom: 16px;
          color: #7C3AED;
          font-size: 14px;
        }

        .entry-content p {
          color: #374151;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .entry-audio {
          margin: 16px 0;
        }

        .play-full-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #8B5CF6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .entry-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #E2E8F0;
        }

        .entry-time {
          font-size: 13px;
          color: #94A3B8;
        }

        .delete-entry-btn {
          background: none;
          border: none;
          color: #DC2626;
          cursor: pointer;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .delete-entry-btn:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
