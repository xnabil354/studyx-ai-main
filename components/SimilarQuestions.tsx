import React, { useState, useEffect, useCallback } from 'react';

interface SimilarQuestion {
  qntId: string;
  htmlContent: string;
  textContent: string;
  score: number;
}

interface SimilarQuestionsProps {
  shortId: string;
  isDarkMode: boolean;
  onAnswerReceived: (answer: string) => void;
  onQuestionClick: (textContent: string) => void;
}

const SimilarQuestions: React.FC<SimilarQuestionsProps> = ({ shortId, isDarkMode, onAnswerReceived, onQuestionClick }) => {
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarQuestions = async () => {
      try {
        const response = await fetch('https://mapp.studyxapp.com/api/studyx/v5/cloud/question/searchV3/matchQntV2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shortId, qntType: null }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch similar questions');
        }

        const data = await response.json();
        setSimilarQuestions(data.data);
      } catch (error) {
        setError('Error fetching similar questions');
        console.error('Error fetching similar questions:', error);
      }
    };

    if (shortId) {
      fetchSimilarQuestions();
    }
  }, [shortId]);

  const fetchQuestionAnswer = useCallback(async (qntId: string, textContent: string) => {
    setLoading(true);
    setError(null);
    setSelectedQuestion(qntId);
    try {
      const response = await fetch('/api/getQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptInput: textContent,
          questionId: qntId,
          regenerate: true,
          sessionId: Math.floor(Math.random() * 1e18).toString(),
          userId: Math.floor(Math.random() * 1e18).toString(),
          modelType: 11,
          event: 'pushQuestion',
          eventId: `s${Date.now()}`,
          eventType: 2,
          paramsS2: qntId,
          paramsS3: 1,
          paramsS4: '',
          paramsType: 11,
          askType: '',
          eventSourceType: 'web_account_homework',
          eventSourceDetail: `https://studyx.ai/webapp/homework/${qntId}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch question answer');
      }

      const data = await response.json();
      if (data.data && data.data[0] && data.data[0].answerText) {
        const answerText = data.data[0].answerText;
        onAnswerReceived(answerText);
      } else {
        onAnswerReceived('Waduh... Gagal mendapatkan Jawaban. Silahkan coba lagi!');
      }
    } catch (error) {
      setError('Error fetching question answer');
      console.error('Error fetching question answer:', error);
    } finally {
      setLoading(false);
    }
  }, [onAnswerReceived]);

  const handleQuestionClick = (question: SimilarQuestion) => {
    fetchQuestionAnswer(question.qntId, question.textContent);
    onQuestionClick(question.textContent);
  };

  const renderHtmlContent = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  return (
    <div className={`mt-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-4">Similar Questions</h2>
      <div className="space-y-4">
        {similarQuestions.map((question) => (
          <div
            key={question.qntId}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-md'
            } ${selectedQuestion === question.qntId ? 'ring-2 ring-purple-500' : ''}`}
            onClick={() => handleQuestionClick(question)}
          >
            <div 
              dangerouslySetInnerHTML={renderHtmlContent(question.htmlContent)} 
              className="mb-2"
            />
            <div className="flex justify-between items-center mt-2">
            </div>
          </div>
        ))}
      </div>
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-2">Loading answer...</p>
        </div>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default SimilarQuestions;