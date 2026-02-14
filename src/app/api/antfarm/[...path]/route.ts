import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.OPENCLAW_API_URL || 'https://api.scosta.io';
const API_TOKEN = process.env.OPENCLAW_API_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  if (!API_TOKEN) {
    return NextResponse.json({ error: 'API token not configured' }, { status: 500 });
  }

  const path = params.path.join('/');
  const searchParams = new URL(request.url).searchParams;
  const queryString = searchParams.toString();
  const url = `${API_BASE}/antfarm/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'X-Source': 'board-mission-control',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch from API', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Antfarm API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to API', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  if (!API_TOKEN) {
    return NextResponse.json({ error: 'API token not configured' }, { status: 500 });
  }

  const path = params.path.join('/');
  const body = await request.json();
  const url = `${API_BASE}/antfarm/${path}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'X-Source': 'board-mission-control',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to post to API', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Antfarm API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to API', details: String(error) },
      { status: 500 }
    );
  }
}