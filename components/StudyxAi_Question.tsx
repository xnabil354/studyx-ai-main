"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

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
  const [question, setQuestion] = useState<string>("");
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Result | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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
  };

  const handleDeleteQuestion = () => {
    setQuestion("");
  };

  const handleCopyResult = () => {
    if (result && result.answer) {
      navigator.clipboard.writeText(result.answer);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      MySwal.fire({
        icon: "success",
        title: "Copied!",
        text: "The answer has been copied to your clipboard.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const formatBoldText = (text: string): JSX.Element[] => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith("*") && part.endsWith("*")) {
        return <strong key={index}>{part.slice(1, -1)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const formatAnswer = (text: string): JSX.Element => {
    const lines = text
      .replace(/###/g, "")
      .split("\n")
      .filter((line) => line.trim() !== "");

    const formattedLines = lines.map((line, index) => {
      if (/^#\s/.test(line)) {
        return (
          <h2 key={index} className="text-xl font-bold mt-4 mb-2">
            {formatBoldText(line.replace(/^#\s/, ""))}
          </h2>
        );
      }

      if (/^\d+\./.test(line)) {
        const [number, ...rest] = line.split(".");
        return (
          <p key={index} className="ml-4 mb-2">
            <span className="font-bold">{number}.</span>
            {formatBoldText(rest.join(".").trim())}
          </p>
        );
      }

      if (line.trim() === "Solution By Steps") {
        return (
          <h3
            key={index}
            className="text-lg font-semibold mt-4 mb-2 bg-purple-100 p-2 rounded"
          >
            Solution By Steps
          </h3>
        );
      }

      if (/^-\s/.test(line)) {
        return (
          <p key={index} className="ml-4 mb-2">
            • {formatBoldText(line.replace(/^-\s/, ""))}
          </p>
        );
      }

      return (
        <p key={index} className="mb-2">
          {formatBoldText(line)}
        </p>
      );
    });

    return <div className="answer-container">{formattedLines}</div>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModelId === null) {
      MySwal.fire({
        icon: "warning",
        title: "Model Not Selected",
        text: "Please select a model.",
        showConfirmButton: true,
      });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/studyx-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        const pushResponse = await fetch("/api/pushQuestionV2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
            eventSourceDetail: `https://studyx.ai/webapp/homework/${shortId}`,
          }),
        });

        const pushData = await pushResponse.json();
        if (pushData.data && pushData.data[0] && pushData.data[0].answerText) {
          setResult({
            shortId: shortId,
            answer: pushData.data[0].answerText,
          });
        } else {
          setResult({
            shortId: shortId,
            answer: "No answer received from the API.",
          });
        }
      } else {
        setResult({
          shortId: null,
          answer: "Failed to get shortId from the API.",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setResult({
        shortId: null,
        answer: "Yahh... Gagal mendapatkan Jawaban. Silahkan coba lagi!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg`}>
      <h1 className={`text-4xl font-bold text-center ${isDarkMode ? 'bg-gradient-to-r from-purple-300 to-pink-300' : 'bg-gradient-to-r from-purple-500 to-pink-500'} text-transparent bg-clip-text mb-2`}>
        Your Best AI Homework Helper
      </h1>
      <p className="text-center mb-6">
        Get advanced step-by-step solutions for all subjects, with all AI models (GPT-4o, Claude 3.5 Sonnet, etc.)
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            className={`w-full p-4 border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-purple-300'} rounded-lg focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-purple-300' : 'focus:ring-purple-500'} resize-none h-40 pr-10`}
            placeholder="Ask anything in any subject..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          {question && (
            <button
              type="button"
              onClick={handleDeleteQuestion}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="space-y-4">
          <label htmlFor="model-select" className="block font-semibold">
            Select AI Model:
          </label>
          <select
            id="model-select"
            className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            value={selectedModelId || ''}
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
        <button
          type="submit"
          className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-purple-300 to-pink-300' : 'bg-gradient-to-r from-purple-500 to-pink-500'} text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Get answer'}
        </button>
      </form>
      {loading && (
        <div className="flex justify-center my-4">
          <svg
            className="animate-spin h-8 w-8 text-purple-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        </div>
      )}
      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Answer:</h2>
            <button
              onClick={handleCopyResult}
              className={`group relative inline-flex items-center justify-center p-2 overflow-hidden font-medium rounded-md transition duration-300 ease-out ${
                isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
              } hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50`}
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full group-hover:translate-x-0 ease">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </span>
              <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease">
                {isCopied ? "Copied!" : "Copy Answer"}
              </span>
              <span className="relative invisible">Copy Answer</span>
            </button>
          </div>
          <div className="mt-4 text-gray-700">
            {formatAnswer(result.answer || "No answer available.")}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyxAi_Question;