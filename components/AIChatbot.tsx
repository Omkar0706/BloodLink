'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
imporTop Match: ${topMatch.user.name}
📍 Distance: ${topMatch.distance} km away
📞 Contact: ${topMatch.user.mobile} 
  MessageCircle, 
  X, 
  Send, 
  MapPin, 
  Phone, 
  Clock,
  Heart,
  User,
  Navigation
} from 'lucide-react';
import { useUsers, useDonations } from '@/lib/hooks';
import { findMatchingDonors, getBloodGroupColor, formatDate } from '@/utils/helpers';
import { EmergencyRequest, DonorMatch } from '@/types';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  donorMatches?: DonorMatch[];
  emergencyRequest?: EmergencyRequest;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm Blood Bridge AI Assistant. I can help you find blood donors for emergencies. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get real data from API
  const { data: usersData } = useUsers({ limit: 100 });
  const { data: donationsData } = useDonations({ limit: 500 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = async (response: string, delay: number = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    return response;
  };

  const processEmergencyRequest = async (userMessage: string) => {
    // Extract blood group and location from user message
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const cities = ['Mumbai', 'Pune', 'Hyderabad', 'Kolkata', 'Delhi', 'Chennai', 'Bangalore'];
    
    let bloodGroup = '';
    let location = '';
    let urgency = 'Medium';

    // Extract blood group
    for (const bg of bloodGroups) {
      if (userMessage.toLowerCase().includes(bg.toLowerCase())) {
        bloodGroup = bg;
        break;
      }
    }

    // Extract location
    for (const city of cities) {
      if (userMessage.toLowerCase().includes(city.toLowerCase())) {
        location = city;
        break;
      }
    }

    // Determine urgency
    if (userMessage.toLowerCase().includes('emergency') || userMessage.toLowerCase().includes('urgent') || userMessage.toLowerCase().includes('now')) {
      urgency = 'Critical';
    } else if (userMessage.toLowerCase().includes('asap') || userMessage.toLowerCase().includes('soon')) {
      urgency = 'High';
    }

    if (!bloodGroup || !location) {
      return await simulateTyping(
        "I need more information to help you. Please specify the blood group needed (e.g., O+, A-, B+) and the location (e.g., Mumbai, Pune, Hyderabad)."
      );
    }

    // Create emergency request
    const emergencyRequest: EmergencyRequest = {
      id: `emergency-${Date.now()}`,
      requesterId: 'ai-chatbot',
      patientName: 'Emergency Patient',
      bloodGroup: bloodGroup as any,
      unitsRequired: 1,
      urgencyLevel: urgency as any,
      location: `${location} Hospital`,
      contactNumber: '911',
      status: 'Pending',
      description: `Emergency blood request via AI chatbot`,
      requiredBy: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Find matching donors using real data
    if (!usersData?.data || !donationsData?.data) {
      return await simulateTyping(
        "I'm currently unable to access the donor database. Please try again in a moment."
      );
    }
    
    const matches = findMatchingDonors(usersData.data, donationsData.data, emergencyRequest);

    if (matches.length === 0) {
      return await simulateTyping(
        `I couldn't find any available ${bloodGroup} donors in ${location} at the moment. Please try expanding your search area or contact nearby blood banks.`
      );
    }

    const topMatch = matches[0];
    const response = `🚨 Emergency Response: Found ${matches.length} matching ${bloodGroup} donors in ${location}!

Top Match: ${topMatch.userName}
📍 Distance: ${topMatch.distance} km
📞 Contact: ${topMatch.contactNumber}
⭐ Match Score: ${topMatch.matchScore}%

I've sent the donor details to your hospital admin. The donor will be contacted immediately.`;

    return { response, donorMatches: matches, emergencyRequest };
  };

  const getCityCoordinates = (city: string) => {
    const coordinates = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Delhi': { lat: 28.7041, lng: 77.1025 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 }
    };
    return coordinates[city as keyof typeof coordinates] || { lat: 20.5937, lng: 78.9629 };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Process message and generate response
    const result = await processEmergencyRequest(userMessage);
    
    if (typeof result === 'string') {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: result,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } else {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        isUser: false,
        timestamp: new Date(),
        donorMatches: result.donorMatches,
        emergencyRequest: result.emergencyRequest
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chatbot Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                <span className="font-semibold">Blood Bridge AI</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    
                    {/* Donor Matches */}
                    {message.donorMatches && message.donorMatches.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold">Available Donors:</p>
                        {message.donorMatches.slice(0, 3).map((donor, index) => (
                          <div
                            key={donor.userId}
                            className="bg-white bg-opacity-20 p-2 rounded text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{donor.userName}</span>
                              <span className={`px-2 py-1 rounded text-xs ${getBloodGroupColor(donor.bloodGroup)}`}>
                                {donor.bloodGroup}
                              </span>
                            </div>
                            <div className="flex items-center text-xs opacity-90 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {donor.distance} km away
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your emergency request..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
