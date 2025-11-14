import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "API route is working",
    hasApiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
    apiKeyLength: process.env.GOOGLE_GEMINI_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
  });
}
