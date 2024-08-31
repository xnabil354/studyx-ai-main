// components/WritingAssistant.tsx

"use client";
import React, { useState } from 'react';
import axios from 'axios';

const WritingAssistant: React.FC = () => {
    const [input, setInput] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [keyChanges, setKeyChanges] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setGeneratedText('');
        setKeyChanges([]);

        try {
            // First API call to saveWriteQuestion
            const saveResponse = await axios.post(
                'https://mapp.studyxapp.com/api/studyx/v5/cloud/chat/saveWriteQuestion',
                {
                    aiType: 1,
                    writeType: 3,
                    userInput: input,
                },
                {
                    headers: {
                        "accept": "application/json, text/plain, */*",
                        "accept-encoding": "gzip, deflate, br, zstd",
                        "accept-language": "en,id-ID;q=0.9,id;q=0.8,en-US;q=0.7,es;q=0.6,zh-CN;q=0.5,zh;q=0.4,ms;q=0.3,ca;q=0.2,pt;q=0.1,sv;q=0.1",
                        "authorization": "eyJ0eXBlIjoiSldUIiwiZXhwIjoxNzI2NDA2MDQ3LCJhbGciOiJIUzI1NiIsImlhdCI6MTcyNTExMDA0N30.eyJyb2xlY29kZSI6IjMwIiwidXNlcmd1aWQiOiIxODI5ODcwMjgzMjg5Mzk5Mjk2In0.a9e33fa86a2145cf99a1c0378bfb9c8d",
                        "content-length": "434",
                        "content-type": "application/json;charset=UTF-8",
                        "origin": "https://studyx.ai",
                        "platform": "webclient",
                        "priority": "u=1, i",
                        "referer": "https://studyx.ai/",
                        "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": '"Windows"',
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "cross-site",
                        "token": "eyJ0eXBlIjoiSldUIiwiZXhwIjoxNzI2NDA2MDQ3LCJhbGciOiJIUzI1NiIsImlhdCI6MTcyNTExMDA0N30.eyJyb2xlY29kZSI6IjMwIiwidXNlcmd1aWQiOiIxODI5ODcwMjgzMjg5Mzk5Mjk2In0.a9e33fa86a2145cf99a1c0378bfb9c8d",
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                        "version": "3.2.6"
                    },
                }
            );

            const { id } = saveResponse.data.data;

            // Second API call to questionOther using the id from the first response
            const response = await axios.post(
                'https://mapp.studyxapp.com/api/studyx/v5/cloud/chat/questionOther',
                {
                    aiType: 1,
                    writeType: 3,
                    userInput: input,
                    writeId: id,
                },
                {
                    headers: {
                        "accept": "application/json, text/plain, */*",
                        "accept-encoding": "gzip, deflate, br, zstd",
                        "accept-language": "en,id-ID;q=0.9,id;q=0.8,en-US;q=0.7,es;q=0.6,zh-CN;q=0.5,zh;q=0.4,ms;q=0.3,ca;q=0.2,pt;q=0.1,sv;q=0.1",
                        "authorization": "eyJ0eXBlIjoiSldUIiwiZXhwIjoxNzI2NDA2MDQ3LCJhbGciOiJIUzI1NiIsImlhdCI6MTcyNTExMDA0N30.eyJyb2xlY29kZSI6IjMwIiwidXNlcmd1aWQiOiIxODI5ODcwMjgzMjg5Mzk5Mjk2In0.a9e33fa86a2145cf99a1c0378bfb9c8d",
                        "content-length": "466",
                        "content-type": "application/json;charset=UTF-8",
                        "origin": "https://studyx.ai",
                        "platform": "webclient",
                        "priority": "u=1, i",
                        "referer": "https://studyx.ai/",
                        "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": '"Windows"',
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "cross-site",
                        "token": "eyJ0eXBlIjoiSldUIiwiZXhwIjoxNzI2NDA2MDQ3LCJhbGciOiJIUzI1NiIsImlhdCI6MTcyNTExMDA0N30.eyJyb2xlY29kZSI6IjMwIiwidXNlcmd1aWQiOiIxODI5ODcwMjgzMjg5Mzk5Mjk2In0.a9e33fa86a2145cf99a1c0378bfb9c8d",
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                        "version": "3.2.6"
                    },
                }
            );

            const { ai_Improved_Text, key_Changes } = response.data.data;

            setGeneratedText(ai_Improved_Text);
            setKeyChanges(key_Changes || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl w-full p-8 bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Writing Assistant - Grammarly Checker</h1>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 text-lg"
                rows={6}
                placeholder="Enter your topic or question here..."
            />
            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 rounded-lg text-white font-bold text-lg tracking-wider transition-all duration-300 ease-out ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {loading ? 'Checking...' : 'Check Grammar'}
            </button>

            {generatedText && (
                <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-indigo-400">Improved Text</h2>
                <div className="text-gray-300 text-lg leading-relaxed animate-pulse">{generatedText}</div>
            </div>
        )}

            {keyChanges.length > 0 && (
                <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-indigo-400">Key Changes</h2>
                    <ul className="text-gray-400 text-lg list-disc pl-5">
                        {keyChanges.map((change, index) => (
                            <li
                                key={index}
                                className="mb-2 transition-transform transform hover:scale-110 hover:text-white animate-fadeIn"
                            >
                                {change}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default WritingAssistant;
