"use client";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

type Model = {
  id: number;
  modelName: string;
};

type Result = {
  shortId: string | null;
  answer: string | null;
};

const StudyxAi_Question = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [question, setQuestion] = useState<string>('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      const modelsData: Model[] = [
        { id: 11, modelName: "GPT-4o" },
        { id: 19, modelName: "Claude 3.5 Sonnet" },
        { id: 17, modelName: "Llama 3.1 405B" },
        { id: 6, modelName: "Genimi 1.5 Pro" },
        { id: 18, modelName: "Mistral Large 2" },
        { id: 3, modelName: "Claude3 Opus" },
        { id: 13, modelName: "Basic" },
        { id: 14, modelName: "Advanced" },
      ];
      setModels(modelsData);
    };

    fetchModels();
  }, []);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    setSelectedModelId(selectedId);

    const selectedModel = models.find(model => model.id === selectedId);
    if (selectedModel && selectedModel.modelName !== "Basic") {
      setNotificationMessage(`Model "${selectedModel.modelName}" adalah model premium. Siapkan lebih dari satu akun Google untuk mengakses jawaban premium.`);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 15000);
    }
  };

  const handleCopyUrl = () => {
    if (result && result.shortId) {
      navigator.clipboard.writeText(`https://studyx.ai/webapp/homework/${result.shortId}`);
      MySwal.fire({
        icon: 'success',
        title: 'URL berhasil disalin!',
        text: 'URL telah disalin ke clipboard. Anda bisa menggunakannya untuk mengakses jawaban.',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const notifyTempEmailCreation = () => {
    MySwal.fire({
      title: 'Pembuatan Akun Temporary Gmail untuk Akses Jawaban Premium studyx.ai',
      html: `
        <p>Anda dapat membuat akun Temporary Gmail menggunakan situs web berikut:</p>
        <ul class="list-disc list-inside">
          <li>
            <a href="https://www.emailnator.com/" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">
              Emailnator
            </a> 
            <button id="emailnator-copy" class="ml-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white py-1 px-3 rounded-full shadow-lg transform transition-transform hover:scale-105">
              Copy URL
            </button>
          </li>
          <li class="mt-2">
            <a href="https://www.mailticking.com/" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">
              Mailticking
            </a> 
            <button id="mailticking-copy" class="ml-2 bg-gradient-to-r from-green-400 to-green-600 text-white py-1 px-3 rounded-full shadow-lg transform transition-transform hover:scale-105">
              Copy URL
            </button>
          </li>
        </ul>
        <p class="mt-4 text-sm text-gray-600">Klik tombol "Copy URL" untuk menyalin tautan dan kunjungi situs tersebut untuk membuat akun Temporary Gmail.</p>
      `,
      showConfirmButton: false,
      didOpen: () => {
        const emailnatorCopyBtn = document.getElementById('emailnator-copy');
        const mailtickingCopyBtn = document.getElementById('mailticking-copy');
  
        if (emailnatorCopyBtn) {
          emailnatorCopyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('https://www.emailnator.com/');
            MySwal.fire({
              icon: 'success',
              title: 'Copied URL',
              text: 'Emailnator URL has been copied!',
              showConfirmButton: false,
              timer: 1500,
            });
          });
        }
  
        if (mailtickingCopyBtn) {
          mailtickingCopyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('https://www.mailticking.com/');
            MySwal.fire({
              icon: 'success',
              title: 'Copied URL',
              text: 'Mailticking URL has been copied!',
              showConfirmButton: false,
              timer: 1500,
            });
          });
        }
      }
    });
  };

  const formatBoldText = (text: string): JSX.Element[] => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return <strong key={index}>{part.slice(1, -1)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const formatAnswer = (text: string): JSX.Element => {
    const lines = text.replace(/###/g, '').split('\n').filter(line => line.trim() !== '');
    
    const formattedLines = lines.map((line, index) => {
      if (/^#\s/.test(line)) {
        return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{formatBoldText(line.replace(/^#\s/, ''))}</h2>;
      }
      
      if (/^\d+\./.test(line)) {
        const [number, ...rest] = line.split('.');
        return (
          <p key={index} className="ml-4 mb-2">
            <span className="font-bold">{number}.</span>{formatBoldText(rest.join('.').trim())}
          </p>
        );
      }
      
      if (line.trim() === "Solution By Steps") {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 bg-purple-100 p-2 rounded">Solution By Steps</h3>;
      }

      if (/^-\s/.test(line)) {
        return <p key={index} className="ml-4 mb-2">• {formatBoldText(line.replace(/^-\s/, ''))}</p>;
      }
      
      return <p key={index} className="mb-2">{formatBoldText(line)}</p>;
    });

    return <div className="answer-container">{formattedLines}</div>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModelId === null) {
      MySwal.fire({
        icon: 'warning',
        title: 'Model Not Selected',
        text: 'Please select a model.',
        showConfirmButton: true,
      });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/studyx-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionContent: `<p>${question}</p>`,
          modelType: selectedModelId,  
          type: 0,
          sourceType: 3,
        }),
      });

      const data = await response.json();
      const shortId = data?.shortId || "No shortId received.";

      if (shortId !== "No shortId received.") {
        const pushResponse = await fetch('/api/pushQuestionV2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            promptInput: question,
            questionId: shortId,
            regenerate: true,
            sessionId: Math.floor(Math.random() * 1e18).toString(),
            userId: Math.floor(Math.random() * 1e18).toString(),
            modelType: selectedModelId,
            event: "pushQuestion",
            eventId: `s${Date.now()}`,
            eventType: 2,
            paramsS2: shortId,
            paramsS3: 1,
            paramsS4: "",
            paramsType: selectedModelId,
            askType: "",
            eventSourceType: "web_account_homework",
            eventSourceDetail: `https://studyx.ai/webapp/homework/${shortId}`
          }),
        });

        const pushData = await pushResponse.json();
        if (pushData.data && pushData.data[0] && pushData.data[0].answerText) {
          setResult({
            shortId: shortId,
            answer: pushData.data[0].answerText
          });
        } else {
          setResult({
            shortId: shortId,
            answer: "No answer received from the API."
          });
        }
      } else {
        setResult({
          shortId: null,
          answer: "Failed to get shortId from the API."
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setResult({
        shortId: null,
        answer: "Failed to get response from API"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-xl mx-auto p-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
      <h1 className="text-2xl font-bold mb-4">Ask a Question</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select a Model:</label>
        <select
          className={`w-full p-2 border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} rounded`}
          value={selectedModelId ?? ''}
          onChange={handleModelChange}
        >
          <option value="" disabled>Select a model</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.modelName}
            </option>
          ))}
        </select>
      </div>

      {showNotification && (
        <div className="mb-4 p-2 bg-yellow-300 text-yellow-900 rounded relative">
          {notificationMessage}
          <button
            className="absolute top-0 right-0 mt-2 mr-2 text-yellow-900"
            onClick={() => setShowNotification(false)}
          >
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          className={`w-full p-2 border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} rounded mb-4`}
          rows={4}
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Fetching Answer...' : 'Get Answer'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          {result.shortId && (
            <div className="mb-4 text-center">
              <h2 className="text-lg font-semibold">Url Jawaban :</h2>
              <p className="break-all">https://studyx.ai/webapp/homework/{result.shortId}</p>
              <button
                onClick={handleCopyUrl}
                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
              >
                Copy URL
              </button>
              <p className="mt-4 text-gray-700">
                Untuk mengakses Jawaban secara langsung di Website studyx.ai, Salin URL di atas dan login menggunakan <button onClick={notifyTempEmailCreation} className="text-blue-600 underline">Temporary Gmail</button> atau Akun <a href="https://studyx.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Studyx AI</a> yang Anda punya. Pastikan Anda memiliki lebih dari satu akun Google atau akun Studyx.ai untuk mengakses jawaban. Dan berikut dibawah ini adalah Jawaban langsung dari Studyx AI:
              </p>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold mb-4">JAWABAN :</h2>
            {formatAnswer(result.answer || "No answer available.")}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyxAi_Question;