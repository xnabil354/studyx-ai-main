import { NextRequest, NextResponse } from "next/server";


function generateRandomClientId() {
  return `${Math.floor(Math.random() * 1000000000)}`;
}

function generateRandomUserAgent() {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
  const os = ['Windows NT 10.0', 'Macintosh; Intel Mac OS X 10_15_7', 'X11; Linux x86_64'];
  const browser = browsers[Math.floor(Math.random() * browsers.length)];
  const osVersion = os[Math.floor(Math.random() * os.length)];
  const browserVersion = Math.floor(Math.random() * 100);

  return `Mozilla/5.0 (${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${browserVersion}.0.0 Safari/537.36`;
}

function generateRandomSecChUa() {
  const browsers = ['"Not)A;Brand"', '"Google Chrome"', '"Chromium"'];
  const versions = Array.from({ length: 3 }, () => Math.floor(Math.random() * 100));
  
  return browsers.map((browser, i) => `${browser};v="${versions[i]}"`).join(", ");
}

function generateRandomAcceptLanguage() {
  const languages = ['en-US', 'en', 'id-ID', 'id', 'es', 'zh-CN', 'zh', 'ms', 'ca', 'pt', 'sv'];
  return languages
    .map(lang => `${lang};q=${(Math.random() * 0.9 + 0.1).toFixed(1)}`)
    .join(", ");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const randomClientId = generateRandomClientId();
  const randomUserAgent = generateRandomUserAgent();
  const randomSecChUa = generateRandomSecChUa();
  const randomAcceptLanguage = generateRandomAcceptLanguage();

  try {
    const response = await fetch(
      "https://mapp.studyxapp.com/api/studyx/v5/cloud/ai/question/getShortId",
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': randomAcceptLanguage,
          'clientid': randomClientId,
          'origin': 'https://studyx.ai',
          'priority': 'u=1, i',
          'referer': 'https://studyx.ai/',
          'sec-ch-ua': randomSecChUa,
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'user-agent': randomUserAgent,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from studyx API" },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    console.log("Received shortId from studyx API:", responseData);
    const shortId = responseData?.data?.shortId;

    return NextResponse.json({ shortId });
  } catch (error) {
    console.error("Error in studyx-ai route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
