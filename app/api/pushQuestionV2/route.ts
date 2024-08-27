import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const response = await fetch(
      "https://mapp.studyxapp.com/api/studyx/v5/cloud/ai/pushQuestionV2",
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
    console.log("Received response from pushQuestionV2 API:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in pushQuestionV2 route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}