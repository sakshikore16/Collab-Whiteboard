import React, { useState, useEffect, useRef } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

const SOCKET_SERVER_URL = 'http://localhost:4000'; // Change if your server is remote
let socket: Socket | null = null;

export const Chat: React.FC = () => {
  const { state } = useWhiteboard();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.sessionId) return;
    if (!socket) {
      socket = io(SOCKET_SERVER_URL);
    }
    socket.emit('join-session', state.sessionId);
    socket.on('chat-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket?.off('chat-message');
    };
  }, [state.sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !state.sessionId) return;
    const message: Message = {
      id: Date.now().toString(),
      userId: state.userId,
      username: state.username,
      content: newMessage,
      timestamp: Date.now(),
    };
    socket?.emit('chat-message', { sessionId: state.sessionId, message });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>
      <ScrollArea className="flex-1 p-4 h-56 max-h-56 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.userId === state.userId ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-sm text-gray-500">
                {message.username}
              </div>
              <div
                className={`max-w-[80%] p-2 rounded-lg ${
                  message.userId === state.userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}; 