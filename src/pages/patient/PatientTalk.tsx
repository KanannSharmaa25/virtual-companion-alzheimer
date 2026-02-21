import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, Heart, Volume2, Sparkles, Music, Image, Calendar, Brain, BookOpen, Activity, Coffee, Sun, Moon, Star, X, RotateCcw, Copy, Check } from 'lucide-react';
import { useData } from '../../context/AppContext';
import './Talk.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

interface ConversationContext {
  lastTopic: string | null;
  userMood: 'happy' | 'sad' | 'anxious' | 'neutral' | 'confused' | 'lonely';
  conversationCount: number;
  userName: string;
  lastActivity: string | null;
}

const generatePatientId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const responses: Record<string, { responses: string[]; followUps: string[] }> = {
  greeting: {
    responses: [
      "Hello! It's wonderful to see you today. How are you feeling right now?",
      "Hi there! I've been looking forward to our chat. How are you doing?",
      "Good to see you! How's everything going today?",
      "Hello, dear friend! How have you been?",
    ],
    followUps: [
      "Would you like to share what's on your mind?",
      "Is there anything you'd like to talk about?",
      "What's been happening today?",
    ],
  },
  feeling_good: {
    responses: [
      "That's wonderful to hear! I'd love to hear more about what's making you feel good.",
      "That's fantastic! Your happiness matters to me. What contributed to this?",
      "That's great! It's so good to see you in high spirits. What's been the highlight?",
    ],
    followUps: [
      "Would you like to tell me more about it?",
      "Shall we do something fun together?",
      "Would you like to write about this in your journal?",
    ],
  },
  feeling_bad: {
    responses: [
      "I'm sorry you're going through this. It takes courage to share how you feel. I'm here with you.",
      "I understand this is difficult. Please know that you're not alone - I'm here for you.",
      "It's okay to feel this way. I'm here to listen without judgment. Would you like to talk about it?",
    ],
    followUps: [
      "Would you like to talk about what's troubling you?",
      "Would some calming music help?",
      "Would you like me to show you some family photos?",
    ],
  },
  lonely: {
    responses: [
      "I understand loneliness can be hard. Remember, your family loves you very much. Would you like me to help you connect with them?",
      "Being alone doesn't mean you're lonely - I'm here to keep you company. Would you like to chat, or shall I call someone for you?",
      "I wish I could give you a hug right now. Your family and friends care about you so much. Would you like to reach out to them?",
    ],
    followUps: [
      "Would you like to call a family member?",
      "Would you like to send a voice message to someone?",
      "Shall I show you some photos of your loved ones?",
    ],
  },
  anxious: {
    responses: [
      "Let's take a moment to breathe together. Inhale... and exhale... That's it. Let's do it a few more times.",
      "I understand anxiety can be overwhelming. Let's try to take things one step at a time. I'm here with you.",
      "It's okay to feel worried sometimes. Let's focus on the present moment together. Take a deep breath.",
    ],
    followUps: [
      "Would you like some calming music?",
      "Would you like me to guide you through a relaxation exercise?",
      "Would it help to talk about what's making you anxious?",
    ],
  },
  confused: {
    responses: [
      "It's okay to feel confused - it happens to everyone. Let's work through this together, one step at a time.",
      "Don't worry - I'm here to help you figure things out. Take your time, and we'll get through it.",
      "I understand this is frustrating. Let's break it down into smaller pieces and tackle it together.",
    ],
    followUps: [
      "Would you like me to help you with that?",
      "Shall I show you some reminders or your schedule?",
      "Would it help to write this down?",
    ],
  },
  memory: {
    responses: [
      "What a wonderful memory! They say sharing memories keeps them alive. Would you like to write about this?",
      "I love hearing about your memories! Each one is a precious treasure. Would you like to save this in your journal?",
      "That's beautiful! Your memories are so valuable. Would you like me to help you document this?",
    ],
    followUps: [
      "Would you like to see photos related to this?",
      "Would you like me to play some music from that time?",
      "Would you like to add this to your journal?",
    ],
  },
  family: {
    responses: [
      "Family is so important! They clearly mean the world to you. Would you like to connect with them?",
      "Your family loves you so much! It's beautiful to see such strong bonds. Would you like to reach out to them?",
      "Family is everything, isn't it? They lucky to have you, and you're lucky to have them.",
    ],
    followUps: [
      "Would you like to call them?",
      "Would you like to send them a voice message?",
      "Would you like to look at some family photos together?",
    ],
  },
  music: {
    responses: [
      "Music has such power to touch our hearts! Let me take you to the music section where we can listen to your favorites.",
      "Music can lift our spirits and bring back beautiful memories. Shall we go to the music therapy section?",
      "I love that you enjoy music! Studies show it has wonderful effects on our well-being. Want to listen together?",
    ],
    followUps: [
      "Let me take you to play some music.",
      "Would you like me to open the music player?",
      "Shall we find some of your favorite songs?",
    ],
  },
  hungry: {
    responses: [
      "Eating well is so important! Would you like me to remind you about meal times?",
      "Food gives us energy and joy! When did you last eat? Would you like me to help you remember meal times?",
      "Meals are such important parts of our day! Would you like to see your schedule for today?",
    ],
    followUps: [
      "Would you like me to check your meal schedule?",
      "Would you like a reminder set for your next meal?",
    ],
  },
  tired: {
    responses: [
      "Rest is so important for our well-being! Taking breaks helps us feel better.",
      "It's good to listen to your body. If you're tired, maybe a short rest would help?",
      "We all need rest to recharge. Would you like me to help you with anything before you rest?",
    ],
    followUps: [
      "Would you like me to play some relaxing music?",
      "Would you like me to read you something calming?",
    ],
  },
  thank: {
    responses: [
      "You're so welcome! Helping you is what I'm here for. It's my joy to be of service.",
      "That's what friends are for! I'm always here for you, anytime you need me.",
      "I'm glad I could help! Remember, I'm just a message away whenever you need me.",
    ],
    followUps: [
      "Is there anything else I can help you with?",
      "Would you like to chat more?",
    ],
  },
  name: {
    responses: [
      "I'm your AI companion, here to keep you company and help you throughout the day. Think of me as a caring friend who's always here for you.",
      "I'm your virtual companion, designed to support you and keep you company. I'm always happy to chat or help with anything you need.",
    ],
    followUps: [
      "Would you like to chat about your day?",
      "Is there anything I can help you with?",
    ],
  },
  help: {
    responses: [
      "Of course! I'm here to help. What would you like assistance with today?",
      "I'm happy to help! Just let me know what you need - I can assist with reminders, music, photos, and much more.",
      "Absolutely! I'm here to make your day better. What can I help you with?",
    ],
    followUps: [
      "Would you like to see your schedule?",
      "Would you like to listen to some music?",
      "Shall I show you some family photos?",
    ],
  },
  medication: {
    responses: [
      "Taking medication on time is very important for your health. Would you like me to check your medication schedule?",
      "Your health matters! Let me show you your current medications and reminders.",
      "I can help you keep track of your medications. Would you like to see your schedule?",
    ],
    followUps: [
      "Shall I show you your medication reminders?",
      "Would you like me to add a medication reminder?",
      "Would you like to review your current medications?",
    ],
  },
  doctor: {
    responses: [
      "Your health is important! Would you like me to show your medical information to share with your doctor?",
      "I can help you keep track of your medical details. Would you like to review them?",
      "Your doctor information is stored safely. Would you like me to show it to you?",
    ],
    followUps: [
      "Would you like to see your doctor's contact info?",
      "Shall I show your medical history?",
      "Would you like to review your current health status?",
    ],
  },
  exercise: {
    responses: [
      "Exercise is wonderful for both body and mind! Brain games can help keep your memory sharp too.",
      "Let's give your brain a workout! Studies show mental exercises can be very beneficial.",
      "Your mind is a muscle too! Would you like to try some brain exercises together?",
    ],
    followUps: [
      "Would you like to play a memory game?",
      "Shall we try some cognitive exercises?",
      "Would you like to see how you've been doing with brain games?",
    ],
  },
  photo: {
    responses: [
      "Photos are such wonderful treasures! They capture our precious memories.",
      "What a great idea! Looking at photos can bring back beautiful memories.",
      "Let me show you the photo gallery! Would you like to see family photos or share new ones?",
    ],
    followUps: [
      "Would you like to see family photos?",
      "Shall I show you how to add new photos?",
      "Would you like to share photos with your caregiver?",
    ],
  },
  chat: {
    responses: [
      "Staying connected is so important! Let me take you to the chat where you can message your caregiver.",
      "Communication is key! Your caregiver would love to hear from you.",
      "Would you like to send a message to your caregiver? I can take you to the chat.",
    ],
    followUps: [
      "Shall I open the chat for you?",
      "Would you like to send a voice message?",
      "Would you like to send a text message?",
    ],
  },
  journal: {
    responses: [
      "Journaling is a beautiful way to express your thoughts and feelings. Would you like to write today?",
      "Writing can be very therapeutic! Your journal is a safe space for your thoughts.",
      "I'd love to help you write in your journal. Would you like to start a new entry?",
    ],
    followUps: [
      "Would you like me to give you a writing prompt?",
      "Shall we start a new journal entry?",
      "Would you like to review your past entries?",
    ],
  },
  prayer: {
    responses: [
      "I understand the importance of faith and spirituality. I'm here to support you in any way that brings you comfort.",
      "Peace and faith can bring great comfort. Would you like me to help you in any way?",
      "Spirituality can be a source of great strength. I'm here to listen and support you.",
    ],
    followUps: [
      "Would you like me to sit with you in quiet reflection?",
      "Shall we think about what brings you peace?",
      "Would you like to talk about what gives you hope?",
    ],
  },
  comfort: {
    responses: [
      "I'm here for you. You don't have to face anything alone.",
      "You are loved and valued. Take all the time you need.",
      "It's okay to take things one moment at a time. I'm right here with you.",
    ],
    followUps: [
      "Would you like me to stay and chat?",
      "Shall I play some soothing music for you?",
      "Would you like me to read you something comforting?",
    ],
  },
  pet: {
    responses: [
      "Pets are such wonderful companions! They bring so much joy and love into our lives.",
      "Animals can be such great comfort. It's clear they mean a lot to you!",
      "Our furry friends are family too! They provide such unconditional love.",
    ],
    followUps: [
      "Would you like to tell me more about your pet?",
      "Do you have photos of your pet you'd like to share?",
      "Would you like me to help you remember pet care tasks?",
    ],
  },
  hobby: {
    responses: [
      "Hobbies bring such joy and purpose to our lives! It's wonderful that you have interests.",
      "Having hobbies is so important for well-being! What activities do you enjoy?",
      "Let's think about the things that make you happy! What do you like to do?",
    ],
    followUps: [
      "Would you like to tell me about your hobbies?",
      "Shall we add a hobby-related reminder?",
      "Would you like to explore new activities?",
    ],
  },
  weather: {
    responses: [
      "The weather can affect how we feel! How are you enjoying today's weather?",
      "It's a beautiful day! The weather can be so refreshing.",
      "I hope the weather is treating you well today! Is it nice outside?",
    ],
    followUps: [
      "Would you like to go for a walk if the weather is nice?",
      "Shall we plan indoor activities for today?",
      "Would you like me to remind you about outdoor activities?",
    ],
  },
  time: {
    responses: [
      "Time is precious! How would you like to spend your time today?",
      "Each day is a gift. Is there something specific you'd like to do?",
      "I'm here to help you make the most of your day. What would you like to do?",
    ],
    followUps: [
      "Would you like to see your schedule for today?",
      "Shall we plan some activities together?",
      "Would you like me to remind you about something?",
    ],
  },
  news: {
    responses: [
      "Staying informed is great! While I don't have live news, I can help you find information about many topics.",
      "I'm not connected to live news, but I'm happy to chat about many topics or help you find information.",
      "I can help with many things! Is there something specific you'd like to know about?",
    ],
    followUps: [
      "Would you like to talk about something specific?",
      "Shall we check your messages instead?",
      "Would you like to do something else?",
    ],
  },
  goodbye: {
    responses: [
      "It was wonderful chatting with you! Take care of yourself.",
      "I'll be here whenever you need me. Don't hesitate to come back!",
      "Bye for now! Remember, I'm always just a message away.",
    ],
    followUps: [
      "Will you come back and chat with me soon?",
      "Take care of yourself!",
      "Looking forward to our next conversation!",
    ],
  },
  default: {
    responses: [
      "I'm here to listen. Please tell me more about what's on your mind.",
      "Thank you for sharing that with me. I'd love to hear more if you'd like to continue.",
      "I appreciate you opening up to me. What else is on your heart?",
    ],
    followUps: [
      "Would you like to tell me more?",
      "Is there something specific you'd like to talk about?",
      "Would you like to do something else together?",
    ],
  },
};

const categorizeMessage = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey') || lowerText.includes('good morning') || lowerText.includes('good afternoon') || lowerText.includes('good evening')) {
    return 'greeting';
  }
  
  if (lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('happy') || lowerText.includes('wonderful') || lowerText.includes('fantastic') || lowerText.includes('excellent') || lowerText.includes('better')) {
    return 'feeling_good';
  }
  
  if (lowerText.includes('sad') || lowerText.includes('bad') || lowerText.includes('not good') || lowerText.includes('unhappy') || lowerText.includes('down') || lowerText.includes('upset') || lowerText.includes('depressed') || lowerText.includes('feeling')) {
    return 'feeling_bad';
  }
  
  if (lowerText.includes('lonely') || lowerText.includes('alone') || lowerText.includes('miss') || lowerText.includes('nobody')) {
    return 'lonely';
  }
  
  if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('nervous') || lowerText.includes('stress') || lowerText.includes('overwhelmed') || lowerText.includes('panic')) {
    return 'anxious';
  }
  
  if (lowerText.includes('confused') || lowerText.includes('forgot') || lowerText.includes('lost') || lowerText.includes('don\'t remember') || lowerText.includes('don\'t know')) {
    return 'confused';
  }
  
  if (lowerText.includes('remember') || lowerText.includes('memory') || lowerText.includes('when i was') || lowerText.includes('back then') || lowerText.includes('old days')) {
    return 'memory';
  }
  
  if (lowerText.includes('family') || lowerText.includes('wife') || lowerText.includes('husband') || lowerText.includes('son') || lowerText.includes('daughter') || lowerText.includes('mom') || lowerText.includes('dad') || lowerText.includes('grandchild') || lowerText.includes('brother') || lowerText.includes('sister')) {
    return 'family';
  }
  
  if (lowerText.includes('music') || lowerText.includes('song') || lowerText.includes('listen') || lowerText.includes('play')) {
    return 'music';
  }
  
  if (lowerText.includes('hungry') || lowerText.includes('eat') || lowerText.includes('food') || lowerText.includes('breakfast') || lowerText.includes('lunch') || lowerText.includes('dinner')) {
    return 'hungry';
  }
  
  if (lowerText.includes('tired') || lowerText.includes('sleepy') || lowerText.includes('rest') || lowerText.includes('sleep')) {
    return 'tired';
  }
  
  if (lowerText.includes('thank') || lowerText.includes('thanks')) {
    return 'thank';
  }
  
  if (lowerText.includes('who are you') || lowerText.includes('what are you') || lowerText.includes('your name')) {
    return 'name';
  }
  
  if (lowerText.includes('help') || lowerText.includes('assist') || lowerText.includes('can you')) {
    return 'help';
  }

  if (lowerText.includes('medicine') || lowerText.includes('medication') || lowerText.includes('pill') || lowerText.includes('drug') || lowerText.includes('dose')) {
    return 'medication';
  }

  if (lowerText.includes('doctor') || lowerText.includes('hospital') || lowerText.includes('clinic') || lowerText.includes('medical') || lowerText.includes('health') || lowerText.includes('appointment') || lowerText.includes('nurse')) {
    return 'doctor';
  }

  if (lowerText.includes('exercise') || lowerText.includes('game') || lowerText.includes('brain') || lowerText.includes('puzzle') || lowerText.includes('quiz') || lowerText.includes('memory') || lowerText.includes('match') || lowerText.includes('recall')) {
    return 'exercise';
  }

  if (lowerText.includes('photo') || lowerText.includes('picture') || lowerText.includes('gallery') || lowerText.includes('image') || lowerText.includes('camera')) {
    return 'photo';
  }

  if (lowerText.includes('message') || lowerText.includes('chat') || lowerText.includes('text') || lowerText.includes('talk to') || lowerText.includes('send')) {
    return 'chat';
  }

  if (lowerText.includes('journal') || lowerText.includes('write') || lowerText.includes('diary') || lowerText.includes('entry')) {
    return 'journal';
  }

  if (lowerText.includes('pray') || lowerText.includes('prayer') || lowerText.includes('god') || lowerText.includes('church') || lowerText.includes('faith') || lowerText.includes('spirit') || lowerText.includes('bible') || lowerText.includes('religious')) {
    return 'prayer';
  }

  if (lowerText.includes('comfort') || lowerText.includes('sad') || lowerText.includes('cry') || lowerText.includes('tears') || lowerText.includes('hug') || lowerText.includes('missing')) {
    return 'comfort';
  }

  if (lowerText.includes('pet') || lowerText.includes('dog') || lowerText.includes('cat') || lowerText.includes('animal') || lowerText.includes('bird') || lowerText.includes('fish')) {
    return 'pet';
  }

  if (lowerText.includes('hobby') || lowerText.includes('hobbies') || lowerText.includes('craft') || lowerText.includes('garden') || lowerText.includes('paint') || lowerText.includes('cook') || lowerText.includes('read') || lowerText.includes('knit')) {
    return 'hobby';
  }

  if (lowerText.includes('weather') || lowerText.includes('sunny') || lowerText.includes('rain') || lowerText.includes('cold') || lowerText.includes('hot') || lowerText.includes('warm') || lowerText.includes('snow')) {
    return 'weather';
  }

  if (lowerText.includes('time') || lowerText.includes('clock') || lowerText.includes('hour') || lowerText.includes('minute') || lowerText.includes('what time') || lowerText.includes('when')) {
    return 'time';
  }

  if (lowerText.includes('news') || lowerText.includes('newspaper') || lowerText.includes('tv') || lowerText.includes('watch') || lowerText.includes('program') || lowerText.includes('show')) {
    return 'news';
  }

  if (lowerText.includes('bye') || lowerText.includes('goodbye') || lowerText.includes('see you') || lowerText.includes('later') || lowerText.includes('talk later') || lowerText.includes('got to go')) {
    return 'goodbye';
  }
  
  return 'default';
};

const extractKeywords = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const keywords: string[] = [];
  
  const wordMappings: Record<string, string[]> = {
    'family': ['family', 'wife', 'husband', 'son', 'daughter', 'mom', 'dad', 'parent', 'child', 'grandchild', 'sibling', 'brother', 'sister', 'cousin', 'aunt', 'uncle', 'family member'],
    'music': ['music', 'song', 'songs', 'listen', 'play', 'hear', 'melody', 'sing', 'singer', 'band', 'concert'],
    'photo': ['photo', 'photos', 'picture', 'pictures', 'gallery', 'image', 'images', 'camera', 'snapshot'],
    'reminder': ['reminder', 'remind', 'schedule', 'appointment', 'medicine', 'medication', 'pill', 'dose'],
    'exercise': ['exercise', 'game', 'games', 'brain', 'memory', 'puzzle', 'quiz', 'match', 'recall', 'sequence', 'word'],
    'journal': ['journal', 'write', 'diary', 'record', 'entry', 'writing'],
    'medical': ['doctor', 'medical', 'health', 'hospital', 'clinic', 'nurse', 'appointment'],
    'chat': ['message', 'chat', 'text', 'talk', 'send', 'call', 'phone'],
    'pet': ['pet', 'dog', 'cat', 'animal', 'bird', 'fish', 'pet'],
    'hobby': ['hobby', 'hobbies', 'craft', 'garden', 'paint', 'cook', 'read', 'knit', 'sew'],
  };
  
  for (const [category, words] of Object.entries(wordMappings)) {
    if (words.some(word => lowerText.includes(word))) {
      keywords.push(category);
    }
  }
  
  return keywords;
};

export const PatientTalk: React.FC = () => {
  const { journalEntries, cognitiveResults, musicMemories, familyMembers, reminders, voiceMessages } = useData();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [context, setContext] = useState<ConversationContext>({
    lastTopic: null,
    userMood: 'neutral',
    conversationCount: 0,
    userName: '',
    lastActivity: null,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('patientId');
    if (!id) {
      id = generatePatientId();
      localStorage.setItem('patientId', id);
    }
    setPatientId(id);
    
    const patientData = JSON.parse(localStorage.getItem('patientRegistry') || '{}');
    if (!patientData[id]) {
      patientData[id] = {
        id: id,
        name: '',
        linked: false,
        lastActive: Date.now(),
      };
      localStorage.setItem('patientRegistry', JSON.stringify(patientData));
    } else {
      patientData[id].lastActive = Date.now();
      localStorage.setItem('patientRegistry', JSON.stringify(patientData));
    }
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(patientId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  useEffect(() => {
    const greetingKeys = Object.keys(responses).filter(k => k !== 'default');
    const category = greetingKeys[Math.floor(Math.random() * greetingKeys.length)];
    const responseData = responses[category] || responses.default;
    const greeting = responseData.responses[Math.floor(Math.random() * responseData.responses.length)];
    
    const initialMessage: Message = {
      id: '1',
      text: `${greeting} Your patient ID is ${patientId || 'generating...'}. Share this with your caregiver to stay connected!`,
      sender: 'ai',
      timestamp: Date.now(),
    };
    
    setMessages([initialMessage]);
    setTimeout(() => speakMessage(initialMessage.text, true), 500);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getVoices = useCallback((): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();
    return voices.find(v => v.name.includes('Female') || v.name.includes('Samantha')) || voices[0] || null;
  }, []);

  const speakMessage = useCallback((text: string, isGreeting = false) => {
    speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = isGreeting ? 0.75 : 0.8;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    
    const voice = getVoices();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [getVoices]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const generateResponse = useCallback((userText: string): string => {
    const category = categorizeMessage(userText);
    const responseData = responses[category] || responses.default;
    
    let mainResponse = responseData.responses[Math.floor(Math.random() * responseData.responses.length)];
    const followUp = responseData.followUps[Math.floor(Math.random() * responseData.followUps.length)];
    
    const keywords = extractKeywords(userText);
    let contextAddition = '';
    
    if (keywords.includes('family') && familyMembers.length > 0) {
      contextAddition = ` I see you have ${familyMembers.length} family member${familyMembers.length > 1 ? 's' : ''} in your circle. `;
    }
    
    if (keywords.includes('music') && musicMemories.length > 0) {
      contextAddition += ` You have ${musicMemories.length} special music memories saved! `;
    }
    
    if (keywords.includes('reminder') || keywords.includes('medical')) {
      const upcomingReminders = reminders.filter(r => r.enabled).slice(0, 3);
      if (upcomingReminders.length > 0) {
        contextAddition += ` You have ${upcomingReminders.length} upcoming reminder${upcomingReminders.length > 1 ? 's' : ''}. `;
      }
    }

    if (keywords.includes('exercise') && cognitiveResults.length > 0) {
      const recentResults = cognitiveResults.slice(-3);
      const avgScore = recentResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / recentResults.length;
      contextAddition += ` You've been doing great with an average score of ${Math.round(avgScore)}%! `;
    }

    if (keywords.includes('journal') && journalEntries.length > 0) {
      contextAddition += ` You have ${journalEntries.length} journal entrie${journalEntries.length > 1 ? 's' : ''} to reflect on. `;
    }

    if (context.conversationCount > 0 && context.lastTopic && context.lastTopic !== category) {
      if (category === 'greeting' && context.conversationCount > 2) {
        mainResponse = `Welcome back! I've missed our conversations. How are you doing today?`;
      }
    }

    let detectedMood: ConversationContext['userMood'] = 'neutral';
    if (['feeling_good', 'happy'].includes(category)) detectedMood = 'happy';
    else if (['feeling_bad', 'sad'].includes(category)) detectedMood = 'sad';
    else if (['lonely'].includes(category)) detectedMood = 'lonely';
    else if (['anxious', 'worried'].includes(category)) detectedMood = 'anxious';
    else if (['confused'].includes(category)) detectedMood = 'confused';
    
    setContext(prev => ({
      ...prev,
      lastTopic: category,
      conversationCount: prev.conversationCount + 1,
      userMood: detectedMood !== 'neutral' ? detectedMood : prev.userMood,
      lastActivity: Date.now().toString(),
    }));
    
    return `${mainResponse}${contextAddition}${followUp}`;
  }, [familyMembers, musicMemories, reminders, cognitiveResults, journalEntries, context]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    stopSpeaking();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const response = generateResponse(userMessage.text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      speakMessage(response);
    }, 600);
  }, [inputText, generateResponse, speakMessage, stopSpeaking]);

  const handleMic = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      setIsListening(true);
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (inputText.trim()) {
          handleSend();
        }
      };
      
      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  }, [inputText, handleSend]);

  const quickActions = [
    { id: 'mood', text: "How am I feeling?", icon: Heart },
    { id: 'family', text: "Show my family", icon: Image },
    { id: 'music', text: "Play music", icon: Music },
    { id: 'schedule', text: "My schedule", icon: Calendar },
    { id: 'exercises', text: "Brain games", icon: Brain },
    { id: 'journal', text: "Write journal", icon: BookOpen },
    { id: 'myid', text: "Show my ID", icon: Copy },
  ];

  const handleQuickAction = (action: typeof quickActions[0]) => {
    stopSpeaking();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: action.text,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    let response = '';
    switch(action.id) {
      case 'mood':
        const mood = context.userMood || 'neutral';
        response = `Based on our conversation, you seem to be feeling ${mood}. Remember, it's completely okay to feel any way you feel. Would you like to talk more about how you're feeling?`;
        break;
      case 'family':
        if (familyMembers.length > 0) {
          response = `You have ${familyMembers.length} family member${familyMembers.length > 1 ? 's' : ''} in your circle: ${familyMembers.map(m => m.name).join(', ')}. Would you like to connect with them?`;
        } else {
          response = "You haven't added family members yet. Would you like to go to the Family section to add them?";
        }
        break;
      case 'music':
        response = "Let me take you to the Music Therapy section where you can listen to your favorite songs!";
        break;
      case 'schedule':
        const todayReminders = reminders.filter(r => r.enabled).slice(0, 4);
        if (todayReminders.length > 0) {
          response = `Here's your schedule: ${todayReminders.map(r => `${r.time} - ${r.title}`).join(', ')}. Would you like more details?`;
        } else {
          response = "You don't have any reminders set for today. Would you like me to help you add some?";
        }
        break;
      case 'exercises':
        const recentExercises = cognitiveResults.length;
        response = recentExercises > 0 
          ? `You've completed ${recentExercises} brain exercise${recentExercises > 1 ? 's' : ''} so far! Would you like to do some more to keep your mind sharp?`
          : "Let's exercise your brain! Brain games can help keep your memory strong. Would you like to try some?";
        break;
      case 'journal':
        const entries = journalEntries.length;
        response = entries > 0
          ? `You have ${entries} journal entrie${entries > 1 ? 's' : ''}. Would you like to write about today?`
          : "Would you like to start a journal entry? Writing can be very therapeutic!";
        break;
      case 'myid':
        response = `Your unique Patient ID is ${patientId}. Share this with your caregiver so they can connect with you! You can also find this ID displayed at the top of this page.`;
        break;
      default:
        response = "I'm here to help! What would you like to do?";
    }

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);
      speakMessage(response);
    }, 500);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <h1>AI Companion</h1>
            <p>I'm here to keep you company</p>
          </div>
          {patientId && (
            <div style={{ 
              background: '#EFF6FF', 
              padding: '8px 12px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #BFDBFE'
            }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Your ID:</span>
              <span style={{ fontWeight: '700', color: '#3B82F6', fontSize: '16px', letterSpacing: '1px' }}>{patientId}</span>
              <button 
                onClick={handleCopyId}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: copiedId ? '#10B981' : '#64748B',
                }}
                title="Copy ID"
              >
                {copiedId ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              {message.sender === 'ai' && (
                <div className="ai-avatar">
                  <Sparkles size={20} color="#10B981" />
                </div>
              )}
              <div className="message-bubble">
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          
          {messages.length > 0 && (
            <div className="quick-actions-row">
              {quickActions.map(action => (
                <button 
                  key={action.id}
                  className="quick-action_chip"
                  onClick={() => handleQuickAction(action)}
                >
                  <action.icon size={16} />
                  {action.text}
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <button
            className={`mic-btn-large ${isListening ? 'listening' : ''}`}
            onClick={handleMic}
            title="Hold to speak"
          >
            <Mic size={24} color={isListening ? '#fff' : '#10B981'} />
          </button>
          
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="chat-input"
          />
          
          <button
            className="send-btn-large"
            onClick={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={22} color="#fff" />
          </button>

          <button 
            className={`repeat-btn-large ${isSpeaking ? 'speaking' : ''}`} 
            onClick={() => {
              const lastAi = messages.filter(m => m.sender === 'ai').pop();
              if (lastAi) speakMessage(lastAi.text);
            }}
            title="Repeat message"
          >
            <Volume2 size={22} color={isSpeaking ? '#10B981' : '#64748B'} />
          </button>
        </div>
      </div>
    </div>
  );
};
