import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGetUserByEmail } from '../hooks/useGetUserByEmail';
import { useGetEnrolledCourses } from '../hooks/useGetEnrolledCourses';
import { apiService } from '../utils/apiService';
import { toast } from 'sonner';
import { X, Lightbulb, AlertTriangle, Trophy, TrendingUp } from 'lucide-react';

const AIInterventionSystem = ({ 
  quizResults = null, 
  progressData = null, 
  courseId = null,
  onClose 
}) => {
  const [intervention, setIntervention] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { data: userData } = useGetUserByEmail();
  const { data: enrollmentData } = useGetEnrolledCourses();

  // Analyze data and trigger AI recommendations when data changes
  useEffect(() => {
    const analyzeAndRecommend = async () => {
      if (!user?.email || (!quizResults && !progressData)) return;

      try {
        setIsLoading(true);

        // Prepare comprehensive data for AI analysis
        const analysisData = {
          userEmail: user.email,
          courseId,
          quizResults,
          progressData,
          userData,
          enrollmentData,
          language: 'en' // Could be dynamic based on user preference
        };

        console.log('Triggering AI analysis with data:', analysisData);

        const response = await apiService.student.post('/ai/recommendations', analysisData);

        if (response.success && response.data.recommendations) {
          const recommendations = response.data.recommendations;
          
          // Check if intervention is required
          if (recommendations.intervention?.required) {
            setIntervention(recommendations);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Error getting AI recommendations:', error);
        // Don't show error to user for background AI analysis
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the analysis to avoid too many API calls
    const timeoutId = setTimeout(analyzeAndRecommend, 1000);
    return () => clearTimeout(timeoutId);
  }, [quizResults, progressData, courseId, user?.email, userData, enrollmentData]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const getInterventionIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'encouragement':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'milestone':
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      default:
        return <Lightbulb className="w-6 h-6 text-blue-500" />;
    }
  };

  const getInterventionColor = (type, urgency) => {
    const baseColors = {
      warning: 'border-orange-200 bg-orange-50',
      encouragement: 'border-green-200 bg-green-50',
      milestone: 'border-yellow-200 bg-yellow-50',
      default: 'border-blue-200 bg-blue-50'
    };

    const urgencyClasses = {
      high: 'ring-2 ring-red-300 shadow-lg',
      medium: 'ring-1 ring-gray-300 shadow-md',
      low: 'shadow-sm'
    };

    return `${baseColors[type] || baseColors.default} ${urgencyClasses[urgency] || urgencyClasses.low}`;
  };

  if (!isVisible || !intervention) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <div 
        className={`rounded-xl p-6 border-2 transition-all duration-300 transform ${
          getInterventionColor(intervention.intervention.type, intervention.intervention.urgency)
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getInterventionIcon(intervention.intervention.type)}
            <h3 className="font-bold text-gray-800">
              AI Learning Assistant
            </h3>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Message */}
        <div className="mb-4">
          <p className="text-gray-700 font-medium">
            {intervention.intervention.message}
          </p>
        </div>

        {/* Insights Section */}
        {intervention.insights && (
          <div className="mb-4 space-y-3">
            {intervention.insights.strengths?.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 text-sm mb-1">
                  💪 Strengths:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {intervention.insights.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-1">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {intervention.insights.weaknesses?.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-700 text-sm mb-1">
                  🎯 Areas for Improvement:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {intervention.insights.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-1">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {intervention.recommendations && (
          <div className="mb-4">
            <h4 className="font-semibold text-blue-700 text-sm mb-2">
              📋 Recommended Actions:
            </h4>
            <div className="space-y-2">
              {intervention.recommendations.immediate?.map((action, index) => (
                <div key={index} className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Immediate
                  </span>
                  <p className="text-sm text-gray-700 mt-1">{action}</p>
                </div>
              ))}
              {intervention.recommendations.shortTerm?.slice(0, 2).map((action, index) => (
                <div key={index} className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    Short-term
                  </span>
                  <p className="text-sm text-gray-700 mt-1">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivation */}
        {intervention.motivation?.encouragement && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-purple-700 text-sm mb-1">
              🌟 Motivation:
            </h4>
            <p className="text-sm text-gray-700">
              {intervention.motivation.encouragement}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 flex space-x-2">
          <button 
            onClick={handleClose}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Got it
          </button>
          <button 
            onClick={() => {
              // Could open full recommendations view or AI chat
              toast.success("Opening AI assistant...");
              handleClose();
            }}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Learn More
          </button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInterventionSystem;