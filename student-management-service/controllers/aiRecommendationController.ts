import { Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import { BadRequestError } from "../utils/errors";
import { logger } from "../utils/logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserProgressData {
  userEmail: string;
  enrollments: any[];
  quizResults?: any;
}

interface RecommendationRequest {
  userEmail: string;
  courseId?: string;
  quizResults?: any;
  progressData?: any;
  language?: string;
}

export const generateLearningRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      userEmail,
      courseId,
      quizResults,
      progressData,
      language = 'en'
    }: RecommendationRequest = req.body;

    if (!userEmail) {
      throw new BadRequestError('User email is required');
    }

    logger.info('Generating AI recommendations for user:', { userEmail, courseId });

    // Prepare context for AI
    const contextData = {
      userEmail,
      courseId,
      quizResults,
      progressData,
      timestamp: new Date().toISOString()
    };

    // Create personalized prompt based on available data
    let prompt = `You are an AI learning assistant analyzing student performance data. `;
    
    if (language === 'ru') {
      prompt = `Вы - ИИ-помощник для обучения, анализирующий данные об успеваемости студентов. `;
    } else if (language === 'kz') {
      prompt = `Сіз студенттердің үлгерімі туралы деректерді талдайтын оқыту ІИ көмекшісісіз. `;
    }

    // Add quiz analysis if available
    if (quizResults) {
      prompt += `\n\nQuiz Results Analysis:
      - Score: ${quizResults.score}/${quizResults.totalPossibleScore}
      - Passed: ${quizResults.passed}
      - Questions: ${quizResults.totalQuestions}
      - Individual Question Results: ${JSON.stringify(quizResults.questionResults, null, 2)}`;
    }

    // Add progress analysis if available
    if (progressData) {
      prompt += `\n\nCourse Progress Analysis:
      - Overall Progress: ${progressData.overallProgress || 0}%
      - Completed Components: ${progressData.completedComponents || 0}
      - Total Components: ${progressData.totalComponents || 0}
      - Component Progress: ${JSON.stringify(progressData.componentProgress, null, 2)}
      - Topics Progress: ${JSON.stringify(progressData.topicsProgress, null, 2)}`;
    }

    // Set response language and format
    if (language === 'ru') {
      prompt += `\n\nПроанализируйте эти данные и предоставьте персонализированные рекомендации на русском языке в следующем формате JSON:
      {
        "insights": {
          "strengths": ["список сильных сторон"],
          "weaknesses": ["список слабых сторон"],
          "patterns": ["обнаруженные закономерности в обучении"]
        },
        "recommendations": {
          "immediate": ["срочные действия"],
          "shortTerm": ["краткосрочные цели"],
          "longTerm": ["долгосрочные рекомендации"]
        },
        "motivation": {
          "encouragement": "мотивационное сообщение",
          "nextSteps": ["конкретные следующие шаги"]
        },
        "intervention": {
          "required": true/false,
          "type": "warning|encouragement|milestone",
          "message": "сообщение для интервенции",
          "urgency": "low|medium|high"
        }
      }`;
    } else if (language === 'kz') {
      prompt += `\n\nОсы деректерді талдап, қазақ тілінде келесі JSON форматында жекелендірілген ұсыныстар беріңіз:
      {
        "insights": {
          "strengths": ["күшті жақтардың тізімі"],
          "weaknesses": ["әлсіз жақтардың тізімі"],
          "patterns": ["оқытуда анықталған заңдылықтар"]
        },
        "recommendations": {
          "immediate": ["шұғыл әрекеттер"],
          "shortTerm": ["қысқа мерзімді мақсаттар"],
          "longTerm": ["ұзақ мерзімді ұсыныстар"]
        },
        "motivation": {
          "encouragement": "мотивациялық хабарлама",
          "nextSteps": ["нақты келесі қадамдар"]
        },
        "intervention": {
          "required": true/false,
          "type": "warning|encouragement|milestone",
          "message": "интервенция үшін хабарлама",
          "urgency": "low|medium|high"
        }
      }`;
    } else {
      prompt += `\n\nAnalyze this data and provide personalized recommendations in the following JSON format:
      {
        "insights": {
          "strengths": ["list of strengths"],
          "weaknesses": ["list of weaknesses"],
          "patterns": ["detected learning patterns"]
        },
        "recommendations": {
          "immediate": ["immediate actions"],
          "shortTerm": ["short-term goals"],
          "longTerm": ["long-term recommendations"]
        },
        "motivation": {
          "encouragement": "motivational message",
          "nextSteps": ["specific next steps"]
        },
        "intervention": {
          "required": true/false,
          "type": "warning|encouragement|milestone",
          "message": "intervention message",
          "urgency": "low|medium|high"
        }
      }`;
    }

    prompt += `\n\nFocus on providing actionable, specific, and encouraging guidance. Return ONLY the JSON object, no additional text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert learning analytics AI that provides personalized educational recommendations based on student performance data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const aiResponse = response.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let recommendations;
    try {
      recommendations = JSON.parse(aiResponse);
    } catch (parseError) {
      logger.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid AI response format');
    }

    logger.info('AI recommendations generated successfully', { 
      userEmail, 
      interventionRequired: recommendations.intervention?.required 
    });

    return res.status(200).json({
      success: true,
      data: {
        recommendations,
        metadata: {
          userEmail,
          courseId,
          generatedAt: new Date().toISOString(),
          language
        }
      }
    });

  } catch (error) {
    logger.error('Error generating AI recommendations:', error);
    next(error);
  }
};

export const generateQuizFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizResults, courseId, userEmail, language = 'en' } = req.body;

    if (!quizResults || !userEmail) {
      throw new BadRequestError('Quiz results and user email are required');
    }

    logger.info('Generating quiz feedback for user:', { userEmail, courseId });

    let prompt = `Analyze this quiz performance and provide immediate feedback in ${language} language:\n\n`;
    prompt += `Quiz Results: ${JSON.stringify(quizResults, null, 2)}\n\n`;
    
    if (language === 'ru') {
      prompt += `Предоставьте краткую обратную связь (максимум 3 предложения) о результатах этого теста, включая:
      1. Общую оценку результата
      2. Конкретные области для улучшения (если есть)
      3. Поощрительное сообщение и следующие шаги`;
    } else if (language === 'kz') {
      prompt += `Осы тест нәтижелері туралы қысқаша кері байланыс беріңіз (ең көбі 3 сөйлем), соның ішінде:
      1. Нәтижеге жалпы баға
      2. Жақсартуға арналған нақты салалар (егер бар болса)
      3. Ынталандыру хабарламасы және келесі қадамдар`;
    } else {
      prompt += `Provide brief feedback (maximum 3 sentences) about this quiz performance including:
      1. Overall assessment of the result
      2. Specific areas for improvement (if any)
      3. Encouraging message and next steps`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    const feedback = response.choices[0].message.content;

    return res.status(200).json({
      success: true,
      data: {
        feedback,
        metadata: {
          userEmail,
          courseId,
          generatedAt: new Date().toISOString(),
          language
        }
      }
    });

  } catch (error) {
    logger.error('Error generating quiz feedback:', error);
    next(error);
  }
};

export const chatWithAI = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, conversationHistory = [], language = 'en', userContext } = req.body;

    if (!message) {
      throw new BadRequestError('Message is required');
    }

    logger.info('Processing AI chat request');

    // Programming keywords for context filtering
    const programmingKeywords = [
      'java', 'javascript', 'python', 'html', 'css', 'sql', 'programming',
      'function', 'variable', 'class', 'method', 'algorithm', 'code'
    ];

    const isProgrammingQuestion = programmingKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );

    if (!isProgrammingQuestion) {
      const restrictionMessage = language === 'ru' 
        ? "Извините, я отвечаю только на вопросы, связанные с программированием."
        : language === 'kz'
        ? "Кешіріңіз, мен тек бағдарламалау сұрақтарына жауап беремін."
        : "Sorry, I only answer programming-related questions.";

      return res.status(200).json({
        success: true,
        data: {
          response: restrictionMessage,
          metadata: {
            generatedAt: new Date().toISOString(),
            language,
            restricted: true
          }
        }
      });
    }

    // Prepare conversation context
    const messages = [
      {
        role: "system" as const,
        content: `You are a helpful programming tutor. Answer questions about programming concepts, provide code examples, and help with learning. Respond in ${language} language.`
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      })),
      {
        role: "user" as const,
        content: message
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 800
    });

    const aiResponse = response.choices[0].message.content;

    return res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        metadata: {
          generatedAt: new Date().toISOString(),
          language,
          restricted: false
        }
      }
    });

  } catch (error) {
    logger.error('Error in AI chat:', error);
    next(error);
  }
};