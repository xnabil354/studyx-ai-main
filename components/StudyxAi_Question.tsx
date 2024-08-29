"use client";
import React, { useState, useEffect, useCallback } from "react";
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
  const [displayedAnswer, setDisplayedAnswer] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      const modelsData: Model[] = [
        { id: 11, modelName: "GPT-4o" },
        { id: 19, modelName: "Claude 3.5 Sonnet" },
        { id: 6, modelName: "Gemini 1.5 Pro" },
        { id: 14, modelName: "Advanced" },
      ];
      setModels(modelsData);
    };

    fetchModels();
  }, []);

  const typeAnswer = useCallback((text: string, index: number = 0) => {
    if (index < text.length) {
      setDisplayedAnswer((prev) => prev + text.charAt(index));
      setTimeout(() => typeAnswer(text, index + 1), 20);
    } else {
      setIsTyping(false);
    }
  }, []);

  useEffect(() => {
    if (result && result.answer) {
      setIsTyping(true);
      setDisplayedAnswer("");
      typeAnswer(result.answer);
    }
  }, [result, typeAnswer]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    setSelectedModelId(selectedId);
  };

  const handleDeleteQuestion = () => {
    setQuestion("");
  };

  const handleCopyResult = () => {
    if (result && result.answer && !result.answer.includes("Yahh... Gagal mendapatkan Jawaban.")) {
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
    setDisplayedAnswer("");

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
          <label htmlFor="question" className="block text-sm font-medium">
            Enter your question:
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            rows={4}
            placeholder="Ask me anything..."
          ></textarea>
          <button
            type="button"
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
            onClick={handleDeleteQuestion}
          >
            Clear
          </button>
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium">
            Select a model:
          </label>
          <select
            id="model"
            value={selectedModelId ?? ""}
            onChange={handleModelChange}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="" disabled>
              Select a model...
            </option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.modelName}
              </option>
            ))}
          </select>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            ) : (
              "Get Answer"
            )}
          </button>
        </div>
      </form>
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md shadow-md">
          <div className="text-sm">
            <strong>Question ID:</strong> {result.shortId || "N/A"}
          </div>
          <div className="mt-4">
            <strong>Answer:</strong>
            <div className="mt-2 whitespace-pre-wrap">
              {isTyping ? displayedAnswer : formatAnswer(result.answer || "")}
            </div>
          </div>
          {!result.answer?.includes("Yahh... Gagal mendapatkan Jawaban.") && (
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleCopyResult}
              disabled={isCopied}
            >
              {isCopied ? "Copied!" : "Copy Answer"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyxAi_Question;
