import React, { useState, useRef, useEffect } from 'react';
import { Send, User, CheckCheck } from 'lucide-react';
import { useUser, useData } from '../../context/AppContext';
import '../../styles/chat.css';

export const Chat: React.FC = () => {
  const { user } = useUser();
  const { chatMessages, addChatMessage, markChatMessagesRead } = useData();
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (user?.role === 'caregiver') {
      markChatMessagesRead();
    }
  }, [chatMessages, user?.role]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    addChatMessage({
      senderId: user?.id || '',
      senderName: user?.name || 'Unknown',
      senderRole: user?.role || 'patient',
      content: message.trim(),
    });
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOtherPartyName = () => {
    return user?.role === 'patient' ? 'Caregiver' : 'Patient';
  };

  const groupedMessages = chatMessages.reduce((groups: { date: string; messages: typeof chatMessages }[], msg) => {
    const dateKey = formatDate(msg.timestamp);
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({ date: dateKey, messages: [msg] });
    }
    return groups;
  }, []);

  return (
    <div className="chat-page">
      <div className="page-header">
        <h1>Chat</h1>
        <p>Message {user?.role === 'patient' ? 'your caregiver' : 'the patient'} directly</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="empty-chat">
              <p>No messages yet</p>
              <span>Start a conversation with {getOtherPartyName()}</span>
            </div>
          ) : (
            <>
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="date-separator">
                    <span>{group.date}</span>
                  </div>
                  {group.messages.map(msg => {
                    const isMe = msg.senderRole === user?.role;
                    return (
                      <div key={msg.id} className={`message ${isMe ? 'sent' : 'received'}`}>
                        {!isMe && (
                          <div className="message-avatar">
                            <User size={16} />
                          </div>
                        )}
                        <div className="message-bubble">
                          <p>{msg.content}</p>
                          <div className="message-meta">
                            <span className="message-time">{formatTime(msg.timestamp)}</span>
                            {isMe && (
                              <span className="message-status">
                                <CheckCheck size={14} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder={`Message ${getOtherPartyName()}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
