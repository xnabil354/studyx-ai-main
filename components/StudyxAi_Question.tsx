import React, { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SimilarQuestions from "./SimilarQuestions";
import Image from "next/image";

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
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState(false);
  const [similarQuestionAnswer, setSimilarQuestionAnswer] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      const modelsData: Model[] = [
        { id: 11, modelName: "GPT-4o" },
        { id: 19, modelName: "Claude 3.5 Sonnet" },
        { id: 17, modelName: "Llama 3.1 405B" },
        { id: 6, modelName: "Gemini 1.5 Pro" },
        { id: 18, modelName: "Mistral Large 2" },
        { id: 3, modelName: "Claude3 Opus" },
        { id: 14, modelName: "Advanced" },
        { id: 13, modelName: "Basic" }
      ];
      setModels(modelsData);
    };

    fetchModels();
  }, []);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    setSelectedModelId(selectedId);
  };

  const handleDeleteImage = (index: number) => {
    setUploadedImages(prevImages => prevImages.filter((_, i) => i !== index));
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

  const typeAnswer = useCallback((text: string, index: number = 0) => {
    if (index < text.length) {
      setDisplayedAnswer((prev) => prev + text.charAt(index));
      setTimeout(() => typeAnswer(text, index + 1), 10);
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

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://mapp.studyxapp.com/api/studyx/v5/cloud/oss/uploadFileFroala', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      if (data.link) {
        setUploadedImages((prev) => [...prev, data.link]);
      }
      return data.link;
    } catch (error) {
      console.error('Error uploading image:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload image. Please try again.',
      });
      return null;
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      await handleImageUpload(file);
    }
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
    if (question.trim() === "" && uploadedImages.length === 0) {
      MySwal.fire({
        icon: "warning",
        title: "Empty Input",
        text: "Please enter a question or upload an image.",
        showConfirmButton: true,
      });
      return;
    }
    setLoading(true);
    setResult(null);
    setSimilarQuestionAnswer(null);

    try {
      const formattedQuestion = uploadedImages.length > 0
        ? `![studyx-img](${uploadedImages[0]})\n${question}`
        : question;

      const response = await fetch("/api/getShortId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paramsText: formattedQuestion,
          questionContent: formattedQuestion,
          modelType: selectedModelId,
          type: 0,
          sourceType: 3,
        }),
      });

      const data = await response.json();
      const shortId = data?.shortId || "No shortId received.";

      if (shortId !== "No shortId received.") {
        const pushResponse = await fetch("/api/getQuestion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            promptInput: formattedQuestion,
            questionId: shortId,
            regenerate: true,
            sessionId: Math.floor(Math.random() * 1e18).toString(),
            userId: Math.floor(Math.random() * 1e18).toString(),
            modelType: selectedModelId,
            event: "pushQuestion",
            eventId: `s${Date.now()}`,
            eventType: 2,
            paramsS2: shortId,
            paramsS3: "1",
            paramsS4: "",
            paramsType: selectedModelId,
            askType: "",
            eventSourceType: "web_account_homework",
            eventSourceDetail: `https://studyx.ai/webapp/homework/${shortId}`,
          }),
        });

        const pushData = await pushResponse.json();
        if (pushData.data && pushData.data[0] && pushData.data[0].answerText) {
          const answerText = pushData.data[0].answerText;
          setResult({
            shortId: shortId,
            answer: answerText,
          });
        } else {
          setResult({
            shortId: shortId,
            answer: "Waduh... Gagal mendapatkan Jawaban. Silahkan coba lagi!",
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

  const handleSimilarQuestionAnswer = (answer: string) => {
    setSimilarQuestionAnswer(answer);
    setDisplayedAnswer("");
    typeAnswer(answer);
    setQuestion("");
  };

  const handleSimilarQuestionClick = (textContent: string) => {
    setQuestion(textContent);
  };

  return (
    <div className={`w-full max-w-3xl mx-auto p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg`}>
      <h1 className="text-3xl font-bold text-center mb-6 text-purple-600">Your Best AI Homework Helper</h1>
      <p className="text-center mb-4 text-lg">Get advanced step-by-step solutions for all subjects, with all AI models (GPT-4o, Claude 3.5 Sonnet, etc.)</p>
      <form onSubmit={handleSubmit}>
        <div 
          className={`relative mb-4 min-h-[200px] border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
          onPaste={handlePaste}
        >
          {uploadedImages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
              Ask me anything... You can also paste images here!
            </div>
          )}
          <div className="p-4">
            {uploadedImages.map((img, index) => (
              <div key={index} className="relative inline-block m-2">
                <Image
          src={img}
          alt={`Uploaded image ${index + 1}`}
          width={700}
          height={700}
          className="rounded"
        />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={uploadedImages.length > 0 ? "Add your question here..." : ""}
            rows={4}
            className={`w-full p-4 bg-transparent border-t rounded-b-lg focus:outline-none ${isDarkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-300'} resize-none`}
          />
        </div>
        
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-3 border rounded-lg focus:outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
          >
            Upload Image
          </button>
        </div>
        <div className="mb-4">
          <select
            value={selectedModelId !== null ? selectedModelId : ""}
            onChange={handleModelChange}
            className={`w-full p-3 border rounded-lg focus:outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
          >
            <option value="" disabled>
              Select a model
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
            className={`inline-block px-6 py-3 rounded-full text-lg font-semibold tracking-wider focus:outline-none transition-all duration-300 ease-in-out ${loading ? 'bg-purple-300' : 'bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700'} text-white`}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Answer"}
          </button>
        </div>
      </form>
      {(result?.answer || similarQuestionAnswer) && (
        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} transition-all duration-300 ease-in-out`}>
          <h2 className="text-xl font-semibold mb-2">Answer:</h2>
          <div className="whitespace-pre-line">
            {formatAnswer(displayedAnswer)}
          </div>
          <button
            className={`mt-4 px-4 py-2 rounded-md focus:outline-none transition-all duration-300 ease-in-out ${isCopied ? 'bg-green-400' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center`}
            onClick={handleCopyResult}
          >
            <ContentCopyIcon className="mr-2" />
            {isCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
       {result && result.shortId && (
    <SimilarQuestions 
      shortId={result.shortId} 
      isDarkMode={isDarkMode} 
      onAnswerReceived={handleSimilarQuestionAnswer}
      onQuestionClick={handleSimilarQuestionClick}
    />
  )}
</div>
  );
};

export default StudyxAi_Question;