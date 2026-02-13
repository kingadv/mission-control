import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.OPENCLAW_API_URL || 'https://api.scosta.io'
const API_TOKEN = process.env.OPENCLAW_API_TOKEN || 'f2e4c94ad3247d5b760eb429d73c65a0dfae258518aeeca3'

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.join('/')
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    
    const apiUrl = `${API_BASE}/brain/${path}${searchParams ? `?${searchParams}` : ''}`
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'X-Source': 'board-mission-control',
      },
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'API request failed' },
        { status: response.status }
      )
    }
    
    // For file downloads, stream the response
    if (path === 'documents/download') {
      const arrayBuffer = await response.arrayBuffer()
      const headers = new Headers()
      
      // Copy relevant headers
      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')
      const contentDisposition = response.headers.get('content-disposition')
      
      if (contentType) headers.set('Content-Type', contentType)
      if (contentLength) headers.set('Content-Length', contentLength)
      if (contentDisposition) headers.set('Content-Disposition', contentDisposition)
      
      return new Response(arrayBuffer, {
        status: 200,
        headers,
      })
    }
    
    // For JSON responses
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Brain API proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}