const studyxai = async (prompt) => {
    try {
        const response1 = await fetch('https://studyxai.vercel.app/api/studyx-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionContent: `<p>${prompt}</p>`,
                modelType: 11,
                type: 0,
                sourceType: 3
            })
        });

        if (!response1.ok) throw new Error(`First request failed with status: ${response1.status}`);
        
        const { shortId } = await response1.json();

        const response2 = await fetch('https://studyxai.vercel.app/api/pushQuestionV2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://studyxai.vercel.app/'
            },
            body: JSON.stringify({
                promptInput: prompt,
                questionId: shortId,
                regenerate: true,
                sessionId: "358892933691248960",
                userId: "203779283621105860",
                modelType: 11,
                event: "pushQuestion",
                eventId: "s1724998652358",
                eventType: 2,
                paramsS2: shortId,
                paramsS3: 1,
                paramsS4: "",
                paramsType: 11,
                askType: "",
                eventSourceType: "web_account_homework",
                eventSourceDetail: `https://studyx.ai/webapp/homework/${shortId}`
            })
        });

        if (!response2.ok) throw new Error(`Second request failed with status: ${response2.status}`);

        return await response2.json();

    } catch (error) {
        return { error: error.message };
    }
};

const getAnswer = async () => {
    const { data } = await studyxai("sebutkan 5 hewan");
    return data[0].answerText;
};

getAnswer().then(answerText => {
    console.log(answerText);
}).catch(error => {
    console.error(error);
});