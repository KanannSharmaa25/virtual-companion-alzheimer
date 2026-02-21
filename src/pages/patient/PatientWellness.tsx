import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, Phone, Users, Music, BookOpen, Brain, Activity, Coffee, Sun, Moon, Star, Send, Volume2, RefreshCw, ArrowRight } from 'lucide-react';
import { useUser, useData } from '../../context/AppContext';

const MOOD_ICONS: Record<string, React.ReactNode> = {
  happy: <Sun size={32} />,
  content: <Star size={32} />,
  neutral: <Activity size={32} />,
  sad: <Moon size={32} />,
  anxious: <Activity size={32} />,
  lonely: <Heart size={32} />,
  confused: <Brain size={32} />,
};

const MOOD_COLORS: Record<string, string> = {
  happy: '#10B981',
  content: '#3B82F6',
  neutral: '#64748B',
  sad: '#6366F1',
  anxious: '#F59E0B',
  lonely: '#EC4899',
  confused: '#8B5CF6',
};

interface Message {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: number;
}

export const PatientWellness: React.FC = () => {
  const { user } = useUser();
  const { moodAnalysis, analyzeWellness, journalEntries, cognitiveResults, musicMemories, familyMembers, chatMessages, voiceMessages } = useData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const analysis = analyzeWellness();
      setIsAnalyzing(false);
      
      if (analysis) {
        setShowSupport(analysis.flags.stress || analysis.flags.sadness || analysis.flags.loneliness || analysis.flags.confusion);
        startConversation(analysis);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = (analysis: typeof moodAnalysis) => {
    if (!analysis) return;

    const greeting = getGreetingMessage(analysis);
    setMessages([{
      id: '1',
      sender: 'ai',
      content: greeting,
      timestamp: Date.now(),
    }]);
  };

  const getGreetingMessage = (analysis: typeof moodAnalysis) => {
    if (!analysis) return "Hello! I'm your wellness companion. How are you feeling today?";

    switch (analysis.overallMood) {
      case 'lonely':
        return "Hello! I can see you might be feeling a bit lonely. I'm here for you. Would you like to chat, or perhaps we could call one of your family members?";
      case 'sad':
        return "Hello, friend. I'm here with you. Sometimes it helps to talk about what's on your mind. I'm listening.";
      case 'anxious':
        return "Hello! I notice you might be feeling worried. Let's take it slow. Deep breath in... and out. I'm here whenever you're ready to talk.";
      case 'confused':
        return "Hello! Don't worry - I'm here to help. Sometimes everything can feel overwhelming. Let's work through it together.";
      case 'happy':
        return "Hello! It's so wonderful to see you! You seem to be feeling good today. I'd love to hear what's making you happy!";
      case 'content':
        return "Hello! I hope you're having a good day. I'm here if you'd like to chat or need anything.";
      default:
        return "Hello, friend! I'm always here for you. How are you feeling right now?";
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputMessage;
    setInputMessage('');

    setTimeout(() => {
      const response = generateResponse(userInput);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 800);
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('lonely') || input.includes('alone')) {
      return "I understand. Being lonely is hard. Your family loves you very much. Would you like me to help you call them, or would you prefer to just chat with me?";
    }
    
    if (input.includes('sad') || input.includes('unhappy') || input.includes('down')) {
      return "I'm here with you. It really helps to talk about things. I'm listening. Would you like to share what's making you feel this way?";
    }
    
    if (input.includes('stressed') || input.includes('worried') || input.includes('anxious')) {
      return "Take a moment to breathe. In... and out... That's it. Everything will be okay. I'm right here with you.";
    }
    
    if (input.includes('confused') || input.includes('forgot') || input.includes('lost')) {
      return "That's okay. I'm here to help you figure things out. Take your time - we can work through this together.";
    }
    
    if (input.includes('thank')) {
      return "You're so welcome! That's what I'm here for. Remember, I'm always just a message away.";
    }
    
    if (input.includes('family') || input.includes('call')) {
      return "Family is so important. Let me help you connect with them. Would you like to call or send a voice message?";
    }
    
    if (input.includes('music')) {
      return "Music can be so comforting. Your favorite songs are waiting for you in the Music Therapy section. Would you like me to take you there?";
    }
    
    if (input.includes('journal') || input.includes('write')) {
      return "Writing can be very healing. The Journal section is a wonderful place to express your thoughts. Shall we go there?";
    }
    
    if (input.includes('exercise') || input.includes('game') || input.includes('quiz')) {
      return "Brain exercises are wonderful for keeping the mind sharp! Would you like to try some exercises now?";
    }
    
    const supportiveResponses = [
      "Thank you for sharing that with me. I'm always here to listen. Is there anything else you'd like to talk about?",
      "I appreciate you opening up to me. Your feelings matter a lot. Would you like to continue talking or try something else?",
      "You mean so much to the people around you. I'm glad we can talk. What else is on your mind?",
      "Let's take things one moment at a time. I'm here for you no matter what.",
    ];
    
    return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const handleCallFamily = () => {
    const primaryFamily = familyMembers[0];
    if (primaryFamily?.phone) {
      window.location.href = `tel:${primaryFamily.phone}`;
    } else {
      alert("No family member's phone number found. You can add family members in the Family section!");
    }
  };

  const refreshAnalysis = () => {
    analyzeWellness();
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  if (isAnalyzing) {
    return (
      <div className="wellness-page">
        <div className="wellness-loading">
          <div className="loading-heart">
            <Heart size={48} />
          </div>
          <h2>Checking in on you...</h2>
          <p>Analyzing your recent activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wellness-page">
      <div className="wellness-header">
        <div className="header-content">
          <Heart size={32} className="header-heart" />
          <div>
            <h1>Wellness Companion</h1>
            <p>I'm always here for you</p>
          </div>
        </div>
      </div>

      {showSupport && moodAnalysis && (
        <div className="support-card" style={{ borderLeftColor: MOOD_COLORS[moodAnalysis.overallMood] }}>
          <div className="support-card-icon" style={{ background: MOOD_COLORS[moodAnalysis.overallMood] }}>
            {MOOD_ICONS[moodAnalysis.overallMood]}
          </div>
          <div className="support-card-content">
            <h3>I'm here for you</h3>
            <p>{moodAnalysis.recommendations[0]}</p>
          </div>
        </div>
      )}

      <div className="mood-section">
        <div className="section-header">
          <h2>How You're Feeling</h2>
          <button onClick={refreshAnalysis} className="refresh-button">
            <RefreshCw size={18} />
          </button>
        </div>
        
        <div className="mood-display">
          <div className="mood-large-icon" style={{ background: MOOD_COLORS[moodAnalysis?.overallMood || 'neutral'] }}>
            {MOOD_ICONS[moodAnalysis?.overallMood || 'neutral']}
          </div>
          <div className="mood-info">
            <span className="mood-main">{moodAnalysis?.overallMood ? moodAnalysis.overallMood.charAt(0).toUpperCase() + moodAnalysis.overallMood.slice(1) : 'Okay'}</span>
            <span className="mood-sub">Based on your recent activities</span>
          </div>
        </div>

        {moodAnalysis?.flags && Object.values(moodAnalysis.flags).some(v => v) && (
          <div className="flags-display">
            {moodAnalysis.flags.stress && <span className="flag-item stress">Feeling Stressed</span>}
            {moodAnalysis.flags.sadness && <span className="flag-item sad">Feeling Sad</span>}
            {moodAnalysis.flags.loneliness && <span className="flag-item lonely">Feeling Lonely</span>}
            {moodAnalysis.flags.confusion && <span className="flag-item confused">Feeling Confused</span>}
          </div>
        )}
      </div>

      <div className="quick-section">
        <h2>Quick Actions</h2>
        <div className="quick-buttons">
          <Link to="/patient/music" className="quick-btn">
            <Music size={24} />
            <span>Play Music</span>
          </Link>
          <Link to="/patient/journal" className="quick-btn">
            <BookOpen size={24} />
            <span>Write Journal</span>
          </Link>
          <Link to="/patient/exercises" className="quick-btn">
            <Brain size={24} />
            <span>Brain Games</span>
          </Link>
          <button onClick={handleCallFamily} className="quick-btn">
            <Users size={24} />
            <span>Call Family</span>
          </button>
          <Link to="/patient/chat" className="quick-btn">
            <MessageCircle size={24} />
            <span>Send Message</span>
          </Link>
          <Link to="/patient/family" className="quick-btn">
            <Users size={24} />
            <span>My Family</span>
          </Link>
        </div>
      </div>

      <div className="chat-section">
        <button 
          className={`chat-toggle ${showChat ? 'active' : ''}`}
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle size={24} />
          <span>Chat with Me</span>
          {messages.length > 0 && <span className="chat-badge">{messages.length}</span>}
        </button>

        {showChat && (
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`chat-message ${msg.sender}`}>
                  <div className="chat-bubble">
                    {msg.sender === 'ai' && (
                      <button 
                        className="speak-btn"
                        onClick={() => speakMessage(msg.content)}
                      >
                        <Volume2 size={14} />
                      </button>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="activity-section">
        <h2>Your Activity This Week</h2>
        <div className="activity-bars">
          <div className="activity-bar-item">
            <BookOpen size={18} />
            <span className="activity-name">Journal</span>
            <div className="activity-bar">
              <div className="activity-fill purple" style={{ width: `${Math.min(100, journalEntries.length * 20)}%` }} />
            </div>
            <span className="activity-count">{journalEntries.length}</span>
          </div>
          <div className="activity-bar-item">
            <Brain size={18} />
            <span className="activity-name">Exercises</span>
            <div className="activity-bar">
              <div className="activity-fill green" style={{ width: `${Math.min(100, cognitiveResults.length * 20)}%` }} />
            </div>
            <span className="activity-count">{cognitiveResults.length}</span>
          </div>
          <div className="activity-bar-item">
            <Music size={18} />
            <span className="activity-name">Music</span>
            <div className="activity-bar">
              <div className="activity-fill pink" style={{ width: `${Math.min(100, musicMemories.length * 20)}%` }} />
            </div>
            <span className="activity-count">{musicMemories.length}</span>
          </div>
          <div className="activity-bar-item">
            <MessageCircle size={18} />
            <span className="activity-name">Messages</span>
            <div className="activity-bar">
              <div className="activity-fill blue" style={{ width: `${Math.min(100, (chatMessages.length + voiceMessages.length) * 20)}%` }} />
            </div>
            <span className="activity-count">{chatMessages.length + voiceMessages.length}</span>
          </div>
        </div>
      </div>

      <style>{`
        .wellness-page {
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .wellness-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .loading-heart {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #EC4899, #F472B6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          animation: heartbeat 1.5s ease-in-out infinite;
          margin-bottom: 24px;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .wellness-loading h2 {
          color: #1E293B;
          margin-bottom: 8px;
        }

        .wellness-loading p {
          color: #64748B;
        }

        .wellness-header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-heart {
          color: #EC4899;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .wellness-header h1 {
          color: #1E293B;
          font-size: 24px;
          margin: 0;
        }

        .wellness-header p {
          color: #64748B;
          margin: 4px 0 0;
        }

        .support-card {
          display: flex;
          gap: 16px;
          background: white;
          padding: 20px;
          border-radius: 16px;
          border-left: 4px solid #EC4899;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .support-card-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .support-card-content h3 {
          color: #1E293B;
          margin: 0 0 8px;
          font-size: 16px;
        }

        .support-card-content p {
          color: #64748B;
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .mood-section {
          background: white;
          padding: 24px;
          border-radius: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          color: #1E293B;
          font-size: 18px;
          margin: 0;
        }

        .refresh-button {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #F1F5F9;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748B;
        }

        .mood-display {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
          border-radius: 16px;
        }

        .mood-large-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .mood-info {
          display: flex;
          flex-direction: column;
        }

        .mood-main {
          font-size: 28px;
          font-weight: 700;
          color: #1E293B;
          text-transform: capitalize;
        }

        .mood-sub {
          font-size: 14px;
          color: #94A3B8;
          margin-top: 4px;
        }

        .flags-display {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        .flag-item {
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .flag-item.stress {
          background: #FEF3C7;
          color: #D97706;
        }

        .flag-item.sad {
          background: #EDE9FE;
          color: #7C3AED;
        }

        .flag-item.lonely {
          background: #FCE7F3;
          color: #DB2777;
        }

        .flag-item.confused {
          background: #E0E7FF;
          color: #4F46E5;
        }

        .quick-section {
          margin-bottom: 20px;
        }

        .quick-section h2 {
          color: #1E293B;
          font-size: 18px;
          margin: 0 0 16px;
        }

        .quick-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .quick-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 24px 16px;
          background: white;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          text-decoration: none;
          color: #64748B;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }

        .quick-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          background: #F8FAFC;
        }

        .quick-btn span {
          font-size: 14px;
          font-weight: 600;
        }

        .chat-section {
          margin-bottom: 20px;
        }

        .chat-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px;
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .chat-badge {
          background: white;
          color: #8B5CF6;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
        }

        .chat-container {
          background: white;
          border-radius: 16px;
          margin-top: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }

        .chat-messages {
          max-height: 300px;
          overflow-y: auto;
          padding: 16px;
          background: #F8FAFC;
        }

        .chat-message {
          display: flex;
          margin-bottom: 12px;
        }

        .chat-message.user {
          justify-content: flex-end;
        }

        .chat-bubble {
          max-width: 80%;
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 15px;
          line-height: 1.5;
          position: relative;
        }

        .chat-message.ai .chat-bubble {
          background: white;
          color: #374151;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .chat-message.user .chat-bubble {
          background: #8B5CF6;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .chat-message.ai .speak-btn {
          position: absolute;
          bottom: 6px;
          right: 6px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #F1F5F9;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748B;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .chat-message.ai:hover .speak-btn {
          opacity: 1;
        }

        .chat-input {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: white;
          border-top: 1px solid #E2E8F0;
        }

        .chat-input input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          font-size: 15px;
          color: #1E293B;
        }

        .chat-input input:focus {
          outline: none;
          border-color: #8B5CF6;
        }

        .chat-input input::placeholder {
          color: #94A3B8;
        }

        .chat-input button {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #8B5CF6;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-input button:disabled {
          background: #CBD5E1;
          cursor: not-allowed;
        }

        .activity-section {
          background: white;
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .activity-section h2 {
          color: #1E293B;
          font-size: 18px;
          margin: 0 0 20px;
        }

        .activity-bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-bar-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .activity-bar-item svg {
          color: #94A3B8;
          width: 20px;
        }

        .activity-name {
          width: 80px;
          font-size: 14px;
          color: #64748B;
        }

        .activity-bar {
          flex: 1;
          height: 10px;
          background: #E2E8F0;
          border-radius: 5px;
          overflow: hidden;
        }

        .activity-fill {
          height: 100%;
          border-radius: 5px;
          transition: width 0.5s ease;
        }

        .activity-fill.purple { background: #8B5CF6; }
        .activity-fill.green { background: #10B981; }
        .activity-fill.pink { background: #EC4899; }
        .activity-fill.blue { background: #3B82F6; }

        .activity-count {
          width: 30px;
          text-align: right;
          font-weight: 600;
          color: #64748B;
        }
      `}</style>
    </div>
  );
};
