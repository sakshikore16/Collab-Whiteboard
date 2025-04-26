import React, { useState, useEffect, useRef } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Manager } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

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
      const manager = new Manager(SOCKET_SERVER_URL);
      socket = manager.socket('/');
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
    <div className="d-flex flex-column h-100">
      <div className="p-3 border-bottom">
        <h2 className="h5 mb-0">Chat</h2>
      </div>
      <div className="flex-grow-1 overflow-auto p-3">
        <div className="d-flex flex-column gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`d-flex flex-column ${
                message.userId === state.userId ? 'align-items-end' : 'align-items-start'
              }`}
            >
              <div className="small text-muted">
                {message.username}
              </div>
              <div
                className={`rounded-3 p-2 ${
                  message.userId === state.userId
                    ? 'bg-primary text-white'
                    : 'bg-light'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-3 border-top">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button 
            className="btn btn-primary" 
            type="button"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}; 