import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const GEMINI_API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

type Data = {
    success: boolean;
    message?: string;
    data?: any;
};

export async function POST(req: NextRequest) {
    const deviceId = req.headers.get('x-device-id');
    if (!deviceId) {
        return new Response(JSON.stringify({ success: false, message: 'Device ID missing' }), { status: 400 });
    }

    try {
        const body = await req.json();
        const response = await fetch(GEMINI_API_URL!, {
            method: 'POST',
            headers: {
                'x-goog-api-key': GEMINI_API_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return new Response(
                JSON.stringify({ success: false, message: `Gemini AI request failed with status ${response.status}` }),
                { status: response.status }
            );
        }

        const data = await response.json();
        return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    } catch (error) {
        console.error('Error during Gemini AI request:', error);
        return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
    }
}