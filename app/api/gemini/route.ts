import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// Environment variables
const GEMINI_API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

type Data = {
  success: boolean;
  message?: string;
  data?: any;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log environment variables for debugging
    console.log('Gemini API URL:', GEMINI_API_URL);
    console.log('Gemini API Key:', GEMINI_API_KEY);

    const response = await fetch(GEMINI_API_URL!, {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY!, // Updated header for Gemini API via Cloudflare
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), // Pass the request body as-is
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Gemini AI request failed with status ${response.status}`,
        }),
        { status: response.status }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error('Error during Gemini AI request:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error' }),
      { status: 500 }
    );
  }
}