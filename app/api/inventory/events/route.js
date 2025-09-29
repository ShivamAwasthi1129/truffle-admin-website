import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Store active connections
const connections = new Set();

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user has inventory permission
    if (!decoded.permissions?.includes('inventory') && decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Inventory permission required.' }, { status: 403 });
    }

    // Create SSE response
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const data = `data: ${JSON.stringify({ type: 'connected', message: 'Connected to inventory updates' })}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));

        // Store connection
        const connection = {
          controller,
          userId: decoded.id,
          close: () => {
            connections.delete(connection);
            controller.close();
          }
        };
        connections.add(connection);

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          connection.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('Error setting up SSE connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Function to broadcast inventory updates to all connected clients
export function broadcastInventoryUpdate(type, data) {
  const message = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  
  connections.forEach(connection => {
    try {
      connection.controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      console.error('Error sending message to client:', error);
      connection.close();
    }
  });
}
