import React, { useState, useRef, useEffect } from 'react';
import authService from '../services/authService';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [conversationsList, setConversationsList] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const initialLoadDone = useRef(false);

  const API_BASE = 'https://chatbox-lor.onrender.com/api';

  // ============= LẤY USER HIỆN TẠI =============
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      console.log('Current user:', user);
    }
  }, []);

  // ============= LẤY DANH SÁCH CONVERSATIONS TỪ SERVER =============
  const loadConversationsList = async () => {
    if (!currentUser?.id && !currentUser?._id) return;
    
    const userId = currentUser.id || currentUser._id;
    
    try {
      const response = await fetch(`${API_BASE}/conversations/${userId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setConversationsList(data);
        console.log('Loaded conversations from server:', data);
      }
    } catch (err) {
      console.error('Error loading conversations list:', err);
    }
  };

  // ============= LOAD HISTORY FROM BACKEND =============
  const loadHistory = async (convId) => {
    if (!convId) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE}/history/${convId}`);
      
      if (response.status === 404) {
        setMessages([]);
      } else if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(m => ({
            text: m.content,
            isUser: m.role === "user",
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(formatted);
        } else {
          setMessages([]);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Error loading history:', err);
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ============= SEND MESSAGE =============
  const sendMessage = async () => {
    if (!inputText.trim() || loading || isSending) return;

    const userMessage = inputText.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Thêm tin nhắn user vào UI ngay lập tức
    const newUserMessage = { text: userMessage, isUser: true, timestamp };
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsSending(true);
    setLoading(true);

    try {
      let currentConvId = conversationId;
      
      // Nếu chưa có conversationId, tạo mới KHÔNG set state ngay
      const isNewConversation = !currentConvId;
      if (isNewConversation) {
        currentConvId = `conv_${Date.now()}`;
        // KHÔNG gọi setConversationId ngay để tránh trigger loadHistory
      }
      
      const userId = currentUser?.id || currentUser?._id;
      
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          conversationId: currentConvId,
          userId: userId
        })
      });

      const data = await response.json();

      if (response.ok) {
        const botReply = data.reply || 'No response';
        const newBotMessage = { 
          text: botReply, 
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, newBotMessage]);
        
        // SAU KHI GỬI THÀNH CÔNG, mới set conversationId
        if (isNewConversation) {
          setConversationId(currentConvId);
        }
        
        // Refresh conversation list để cập nhật title
        await loadConversationsList();
      } else {
        // Xóa tin nhắn user vừa thêm nếu có lỗi
        setMessages(prev => prev.filter(msg => msg !== newUserMessage));
        setMessages(prev => [...prev, { 
          text: data.error || `Server error: ${response.status}`, 
          isUser: false,
          timestamp
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Xóa tin nhắn user vừa thêm
      setMessages(prev => prev.filter(msg => msg !== newUserMessage));
      setMessages(prev => [...prev, { 
        text: '❌ Cannot connect to server. Please try again.', 
        isUser: false,
        timestamp
      }]);
    } finally {
      setLoading(false);
      setIsSending(false);
    }
  };

  // ============= CREATE NEW CONVERSATION =============
  const createNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setIsFirstMessage(true);
    setShowSidebar(false);
  };

  // ============= LOAD CONVERSATION FROM LIST =============
  const loadConversation = async (conv) => {
    setConversationId(conv._id);
    setIsFirstMessage(false);
    setShowSidebar(false);
  };

  // ============= XÓA CONVERSATION =============
  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await fetch(`${API_BASE}/conversations/${convId}`, {
        method: 'DELETE'
      });
      
      await loadConversationsList();
      
      if (convId === conversationId) {
        const updatedList = conversationsList.filter(conv => conv._id !== convId);
        if (updatedList.length > 0) {
          setConversationId(updatedList[0]._id);
        } else {
          setConversationId(null);
          setMessages([]);
          setIsFirstMessage(true);
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert('Failed to delete conversation');
    }
  };

  // // ============= CLEAR CURRENT CHAT =============
  // const clearCurrentChat = async () => {
  //   if (!conversationId) return;
    
  //   if (!window.confirm('Are you sure you want to clear all messages in this conversation?')) return;
    
  //   try {
  //     await fetch(`${API_BASE}/history/${conversationId}`, {
  //       method: 'DELETE'
  //     });
      
  //     setMessages([]);
  //   } catch (err) {
  //     console.error('Error clearing chat:', err);
  //     alert('Failed to clear chat');
  //   }
  // };

  // ============= INITIAL LOAD =============
  useEffect(() => {
    if (currentUser) {
      loadConversationsList();
    }
  }, [currentUser]);

  // Load history khi conversationId thay đổi (CHỈ KHI KHÔNG PHẢI LẦN ĐẦU GỬI TIN NHẮN)
  useEffect(() => {
    if (conversationId && !isFirstMessage && !isSending) {
      loadHistory(conversationId);
    }
    // Khi isFirstMessage = true, không load history
  }, [conversationId, isFirstMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (action) => {
    let message = '';
    switch(action) {
      case 'accidents':
        message = 'Show me accidents nearby';
        break;
      case 'camera':
        message = 'Show camera feed';
        break;
      case 'charging':
        message = 'Find charging stations near me';
        break;
    }
    setInputText(message);
    inputRef.current?.focus();
    setTimeout(() => sendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCall = () => {
    alert('Calling Traffic Assistant... (Demo)');
  };

  const handleVideoCall = () => {
    alert('Starting video call... (Demo)');
  };

  if (!currentUser) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F7F5F8]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7B00FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (isLoadingHistory && conversationId && !isFirstMessage) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F7F5F8]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7B00FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#F7F5F8] flex flex-col">
      {/* Header */}
      <div className="bg-white flex-shrink-0">
        <div className="pt-2">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                
                <button 
                  onClick={handleCall}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors group"
                  title="Call"
                >
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-[#7B00FF]">call</span>
                </button>
                <button 
                  onClick={handleVideoCall}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors group"
                  title="Video Call"
                >
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-[#7B00FF]">videocam</span>
                </button>
              </div>
              
              <div className="flex-1 text-center">
                <h1 className="text-lg font-bold">Traffic Assistant</h1>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[#7B00FF] text-xs font-semibold tracking-wider">
                    ONLINE
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={createNewConversation}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors group"
                  title="New chat"
                >
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-[#7B00FF]">add_comment</span>
                </button>
              <button 
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors group"
                  title="Chat history"
                >
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-[#7B00FF]">menu</span>
                </button>
              </div>
            </div>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#7B00FF]/20 to-transparent"></div>
        </div>
      </div>

      {/* Chat History Sidebar */}
      {showSidebar && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSidebar(false)}></div>
          <div className="fixed left-0 top-0 w-80 h-full bg-white shadow-2xl border-r border-[#7B00FF]/10 z-50 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#7B00FF]/10 bg-[#7B00FF]/5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-[#7B00FF]">
                  Chat History
                  {currentUser && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({currentUser.name || currentUser.email})
                    </span>
                  )}
                </h3>
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <button 
                onClick={createNewConversation}
                className="mt-3 w-full py-2 bg-[#7B00FF] text-white rounded-lg text-sm font-medium hover:bg-[#6600cc] transition-colors"
              >
                + New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversationsList.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversationsList.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => loadConversation(conv)}
                    className={`group p-3 mb-1 rounded-xl cursor-pointer transition-all hover:bg-[#7B00FF]/5 ${
                      conv._id === conversationId ? 'bg-[#7B00FF]/10 border-l-4 border-[#7B00FF]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {conv.title || 'New Chat'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conv.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv._id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 rounded-full"
                        title="Delete conversation"
                      >
                        <span className="material-symbols-outlined text-red-500 text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-[#7B00FF]/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#7B00FF] text-4xl">chat</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Traffic Assistant</h3>
            <p className="text-gray-500 max-w-md">
              Ask me about traffic conditions, accidents, camera feeds, or anything traffic-related!
            </p>
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => handleQuickAction('accidents')}
                className="px-4 py-2 bg-[#7B00FF]/10 text-[#7B00FF] rounded-lg text-sm font-medium hover:bg-[#7B00FF]/20 transition-colors"
              >
                Check Accidents
              </button>
              <button 
                onClick={() => handleQuickAction('camera')}
                className="px-4 py-2 bg-[#7B00FF]/10 text-[#7B00FF] rounded-lg text-sm font-medium hover:bg-[#7B00FF]/20 transition-colors"
              >
                View Cameras
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.isUser ? (
                  <div className="flex gap-3 justify-end mb-4">
                    <div className="flex items-end gap-2 max-w-[70%]">
                      <div className="bg-[#7B00FF] text-white p-3 rounded-tl-xl rounded-tr-xl rounded-bl-xl shadow-md shadow-[#7B00FF]/20">
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                      <div className="w-8 h-8 bg-[#7B00FF] rounded-full flex items-center justify-center shadow-md shadow-[#7B00FF]/30 shrink-0">
                        <span className="material-symbols-outlined text-white text-lg">person</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 text-right mr-12">{msg.timestamp}</div>
                  </div>
                ) : (
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 bg-[#7B00FF]/10 rounded-full flex items-center justify-center border border-[#7B00FF]/20 shrink-0">
                      <span className="material-symbols-outlined text-[#7B00FF] text-lg">smart_toy</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white p-3 rounded-xl border border-[#7B00FF]/10">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 ml-1">{msg.timestamp}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 bg-[#7B00FF]/10 rounded-full flex items-center justify-center border border-[#7B00FF]/20 shrink-0">
                  <span className="material-symbols-outlined text-[#7B00FF] text-lg">smart_toy</span>
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Thinking text */}
      {loading && (
        <div className="text-center py-2 bg-[#F7F5F8] flex-shrink-0">
          <span className="text-[#7B00FF] text-sm">Thinking...</span>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="bg-white flex-shrink-0">
        {/* Quick Actions */}
        <div className="px-4 pt-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max pb-2">
            <button 
              onClick={() => handleQuickAction('accidents')}
              className="flex items-center gap-2 px-3 py-2 bg-[#F7F5F8] border border-[#7B00FF]/20 rounded-lg hover:bg-[#7B00FF] hover:text-white transition-all group"
            >
              <span className="material-symbols-outlined text-sm text-[#7B00FF] group-hover:text-white">
                warning
              </span>
              <span className="text-xs font-medium text-[#7B00FF] group-hover:text-white whitespace-nowrap">
                Accidents nearby
              </span>
            </button>
            <button 
              onClick={() => handleQuickAction('camera')}
              className="flex items-center gap-2 px-3 py-2 bg-[#F7F5F8] border border-[#7B00FF]/20 rounded-lg hover:bg-[#7B00FF] hover:text-white transition-all group"
            >
              <span className="material-symbols-outlined text-sm text-[#7B00FF] group-hover:text-white">
                videocam
              </span>
              <span className="text-xs font-medium text-[#7B00FF] group-hover:text-white whitespace-nowrap">
                Camera feed
              </span>
            </button>
            <button 
              onClick={() => handleQuickAction('charging')}
              className="flex items-center gap-2 px-3 py-2 bg-[#F7F5F8] border border-[#7B00FF]/20 rounded-lg hover:bg-[#7B00FF] hover:text-white transition-all group"
            >
              <span className="material-symbols-outlined text-sm text-[#7B00FF] group-hover:text-white">
                ev_station
              </span>
              <span className="text-xs font-medium text-[#7B00FF] group-hover:text-white whitespace-nowrap">
                Charging stations
              </span>
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 pt-0">
          <div className="flex items-center gap-2 p-1 bg-[#F7F5F8] border border-[#7B00FF]/10 rounded-lg">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={loading || isSending}
              className="flex-1 px-3 py-2 bg-transparent outline-none text-sm disabled:opacity-50"
            />
            <button 
              onClick={sendMessage}
              disabled={loading || isSending || !inputText.trim()}
              className="w-10 h-10 bg-[#7B00FF] rounded-lg flex items-center justify-center shadow-lg shadow-[#7B00FF]/30 hover:bg-[#6600cc] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-white text-lg">send</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid rgba(123, 0, 255, 0.1);
          width: fit-content;
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          background: #7B00FF;
          border-radius: 50%;
          opacity: 0.4;
          animation: typing 1.4s infinite;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.4; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;