import React, { useState, useEffect } from "react";
import { apiService } from "../../utils/apiService";
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "sonner";
import { Lightbulb, TrendingUp, AlertTriangle, Trophy } from "lucide-react";

const AIChatDialog = ({ isOpen, onClose, recommendations = null, courseId, userEmail, progressData }) => {
  const { currentLanguage, displayLanguage } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const MAX_MESSAGES = 10;
  let isRequestPending = false;

  // Add recommendations to chat when they're available
  useEffect(() => {
    if (recommendations && isOpen) {
      const recommendationMessage = {
        sender: "ai",
        text: formatRecommendations(recommendations),
        type: "recommendations",
        data: recommendations
      };
      setMessages(prev => [...prev, recommendationMessage]);
    }
  }, [recommendations, isOpen]);

  if (!isOpen) return null;

  const formatRecommendations = (recs) => {
    if (!recs) return "";

    let message = "🎯 **AI Learning Analysis**\n\n";

    // Add intervention message if available
    if (recs.intervention?.message) {
      message += `💡 **${recs.intervention.message}**\n\n`;
    }

    // Add strengths
    if (recs.insights?.strengths?.length > 0) {
      message += "💪 **Your Strengths:**\n";
      recs.insights.strengths.forEach(strength => {
        message += `• ${strength}\n`;
      });
      message += "\n";
    }

    // Add areas for improvement
    if (recs.insights?.weaknesses?.length > 0) {
      message += "🎯 **Areas to Focus On:**\n";
      recs.insights.weaknesses.forEach(weakness => {
        message += `• ${weakness}\n`;
      });
      message += "\n";
    }

    // Add immediate recommendations
    if (recs.recommendations?.immediate?.length > 0) {
      message += "⚡ **Immediate Actions:**\n";
      recs.recommendations.immediate.forEach(action => {
        message += `• ${action}\n`;
      });
      message += "\n";
    }

    // Add motivation
    if (recs.motivation?.encouragement) {
      message += `🌟 **Motivation:** ${recs.motivation.encouragement}\n\n`;
    }

    return message;
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'encouragement':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'milestone':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };


  const handleSend = async () => {
    if (isRequestPending) {
      console.warn("Please wait before sending another request.");
      return;
    }

    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    isRequestPending = true;
    setTimeout(() => {
      isRequestPending = false;
    }, 1500);

    setIsThinking(true);

    try {
      const trimmedMessages = messages.slice(-MAX_MESSAGES);

      const response = await apiService.student.post('/ai/chat', {
        message: currentInput,
        conversationHistory: trimmedMessages,
        language: currentLanguage,
        userContext: {} // Can be expanded with user data
      });

      if (response.success && response.data.response) {
        const aiMessage = {
          sender: "ai",
          text: response.data.response,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error("Error communicating with AI:", error);
      const errorMessage = {
        sender: "ai",
        text: currentLanguage === "ru"
          ? "Извините, произошла ошибка при обработке запроса."
          : currentLanguage === "kk"
          ? "Кешіріңіз, сұранысты өңдеу кезінде қате орын алды."
          : "Sorry, an error occurred while processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-200 w-11/12 md:w-1/2 p-6 rounded-xl shadow-2xl transform scale-100 animate-zoomIn">
        

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-gray-800">Qural AI</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Message history */}
        <div
          className="flex-1 overflow-y-auto mb-4 border border-gray-300 p-4 rounded-lg bg-white shadow-inner space-y-3 h-96"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-lg shadow-lg ${
                  msg.sender === "user"
                    ? "bg-blue-100 text-blue-800 text-right max-w-xs"
                    : msg.type === "recommendations"
                    ? "bg-gradient-to-br from-purple-50 to-blue-50 text-gray-800 text-left max-w-md border border-purple-200"
                    : "bg-gray-100 text-gray-800 text-left max-w-xs"
                }`}
              >
                {msg.type === "recommendations" ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-3">
                      {getRecommendationIcon(msg.data?.intervention?.type)}
                      <span className="font-bold text-purple-700">AI Learning Assistant</span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {msg.text.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <h4 key={i} className="font-bold text-gray-700 mt-3 mb-1">
                              {line.replace(/\*\*/g, '')}
                            </h4>
                          );
                        } else if (line.startsWith('• ')) {
                          return (
                            <li key={i} className="text-gray-600 ml-4 mb-1">
                              {line.substring(2)}
                            </li>
                          );
                        } else if (line.trim()) {
                          return (
                            <p key={i} className="text-gray-700 mb-2">
                              {line}
                            </p>
                          );
                        }
                        return <br key={i} />;
                      })}
                    </div>
                    
                    {/* Action buttons for recommendations */}
                    <div className="flex space-x-2 mt-4 pt-3 border-t border-purple-200">
                      <button
                        onClick={() => {
                          const askForMore = `Can you explain more about ${msg.data?.insights?.weaknesses?.[0] || 'my learning progress'}?`;
                          setInput(askForMore);
                        }}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
                      >
                        Tell me more
                      </button>
                      <button
                        onClick={() => {
                          setInput("What should I focus on next?");
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                      >
                        Next steps?
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="text-left text-gray-400 italic animate-pulse">
              {currentLanguage === "ru" 
                ? "Думаю..." 
                : currentLanguage === "kk"
                ? "Ойлап жатырмын..."
                : "Thinking..."
              }
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            placeholder={
              currentLanguage === "ru" 
                ? "Напишите с чем нужна помощь" 
                : currentLanguage === "kk"
                ? "Көмек керек нәрсені жазыңыз"
                : "Write what you need help with"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isThinking}
          />
          <button
            onClick={handleSend}
            disabled={isThinking}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentLanguage === "ru" 
              ? "Отправить" 
              : currentLanguage === "kk"
              ? "Жіберу"
              : "Send"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatDialog;