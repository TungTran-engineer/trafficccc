import React, { useState, useRef, useEffect } from 'react';

// ==================== 🔑 NHẬP API KEY CỦA BẠN VÀO ĐÂY ====================
const GROQ_API_KEY = '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';
// ======================================================================

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [trafficData, setTrafficData] = useState({});

  const messagesEndRef = useRef(null);

  // Lấy dữ liệu traffic realtime từ Flask
  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const res = await fetch('http://localhost:5000/traffic');
        if (res.ok) {
          const data = await res.json();
          setTrafficData(data);
        }
      } catch (err) {
        console.error('Không lấy được traffic data:', err);
      }
    };

    fetchTraffic();
    const interval = setInterval(fetchTraffic, 4000); // cập nhật mỗi 4 giây
    return () => clearInterval(interval);
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gọi Groq AI với context traffic
  const callGroq = async (userMessage) => {
    // Chuẩn bị context traffic
    let trafficContext = "Dữ liệu giao thông hiện tại:\n";
    
    if (Object.keys(trafficData).length > 0) {
      Object.keys(trafficData).forEach(key => {
        const cam = trafficData[key];
        trafficContext += `- ${key}: ${cam.cars} ô tô, ${cam.motorcycles} xe máy, trạng thái: ${cam.traffic}\n`;
      });
    } else {
      trafficContext += "Hiện chưa có dữ liệu giao thông realtime.";
    }

    const systemPrompt = `Bạn là Trợ lý Giao thông thông minh tại Đà Nẵng, Việt Nam.
Bạn trả lời ngắn gọn, thân thiện, hữu ích bằng tiếng Việt.
${trafficContext}

Hãy sử dụng dữ liệu trên để trả lời chính xác về tình trạng giao thông, camera, tắc đường.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInputText('');
    setLoading(true);

    try {
      const lowerMsg = userMessage.toLowerCase();

      // Xử lý đặc biệt xem camera
      if (lowerMsg.includes('camera') || lowerMsg.includes('xem cam')) {
        let camName = "Camera 1 - Giao lộ Nguyễn Văn Linh";
        if (lowerMsg.includes('cầu rồng')) camName = "Camera 2 - Cầu Rồng";
        else if (lowerMsg.includes('phạm văn đồng')) camName = "Camera 3 - Phạm Văn Đồng";
        else if (lowerMsg.includes('bạch đằng')) camName = "Camera 4 - Bạch Đằng";

        const streamUrl = `http://localhost:5000/video/${encodeURIComponent(camName)}`;

        setMessages(prev => [...prev, {
          text: `📹 Đang mở camera: ${camName}`,
          isUser: false,
          isCamera: true,
          streamUrl
        }]);
        setLoading(false);
        return;
      }

      // Gọi Groq AI với dữ liệu traffic
      const replyText = await callGroq(userMessage);

      setMessages(prev => [...prev, { text: replyText, isUser: false }]);

    } catch (error) {
      console.error('Lỗi Groq:', error);
      setMessages(prev => [...prev, {
        text: "❌ Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
        isUser: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full bg-[#F7F5F8] flex flex-col">
      <div className="bg-white p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold text-violet-700">🚦 Traffic Assistant (Groq AI)</h1>
        <div className="text-green-600 text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Online
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <div className="mx-auto w-24 h-24 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-6xl text-violet-600">smart_toy</span>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Xin chào!</h2>
            <p className="text-gray-600">Hỏi tôi bất cứ điều gì về giao thông Đà Nẵng nhé.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            {msg.isUser ? (
              <div className="max-w-[75%] bg-violet-600 text-white px-5 py-3.5 rounded-2xl rounded-br-none">
                {msg.text}
              </div>
            ) : msg.isCamera ? (
              <div className="max-w-[90%] bg-white rounded-2xl p-4 shadow">
                <p className="font-medium mb-3">{msg.text}</p>
                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-gray-300">
                  <img 
                    src={msg.streamUrl} 
                    alt="Live Camera" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-[80%] bg-white px-5 py-3.5 rounded-2xl rounded-bl-none shadow leading-relaxed">
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-3 rounded-2xl">🤔 Đang suy nghĩ...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ví dụ: Tình trạng giao thông hôm nay, xem camera Cầu Rồng, đường Nguyễn Văn Linh thế nào?"
            className="flex-1 px-5 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !inputText.trim()}
            className="px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-medium disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;