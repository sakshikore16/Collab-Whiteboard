import React, { useState } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { toast } from '@/components/ui/sonner';
import { Users } from 'lucide-react';

interface SessionPanelProps {
  showNotification: (msg: string) => void;
}

export const SessionPanel: React.FC<SessionPanelProps> = ({ showNotification }) => {
  const { state, createSession, joinSession } = useWhiteboard();
  const [inputSessionId, setInputSessionId] = useState('');
  const [username, setUsername] = useState(state.username);
  const [isDialogOpen, setIsDialogOpen] = useState(!state.sessionId);

  const handleCreateSession = () => {
    if (!username.trim()) {
      showNotification('Please enter your name');
      return;
    }
    createSession(username);
    showNotification('Session created!');
    setIsDialogOpen(false);
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showNotification('Please enter your name');
      return;
    }
    if (!inputSessionId.trim()) {
      showNotification('Please enter a session ID');
      return;
    }
    joinSession(inputSessionId, username);
    showNotification('Session joined successfully!');
    setIsDialogOpen(false);
  };

  const copySessionId = () => {
    if (!state.sessionId) return;
    navigator.clipboard.writeText(state.sessionId)
      .then(() => showNotification('Session ID copied to clipboard!'))
      .catch(() => showNotification('Failed to copy session ID'));
  };

  return (
    <>
      <button 
        type="button"
        className="btn btn-outline-primary d-flex align-items-center gap-2" 
        onClick={() => setIsDialogOpen(true)}
      >
        <Users className="h-4 w-4" />
        {state.sessionId ? 'Session: ' + state.sessionId : 'Join Session'}
      </button>

      {isDialogOpen && (
        <div className="modal show d-block" tabIndex={-1}>
          <div
            className="modal-dialog modal-dialog-centered w-auto"
            style={{
              maxWidth: '400px',
              width: '95vw',
              marginLeft: window.innerWidth >= 768 ? '25%' : 'auto', // Moved slightly right!
              marginRight: window.innerWidth >= 768 ? 'auto' : 'auto',
            }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Collaborative Whiteboard Session</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setIsDialogOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column gap-3">
                  {state.sessionId ? (
                    <div className="d-flex flex-column gap-2">
                      <p className="small text-muted">Current Session ID:</p>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control font-monospace"
                          value={state.sessionId}
                          readOnly
                        />
                        <button 
                          type="button"
                          className="btn btn-outline-secondary" 
                          onClick={copySessionId}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex flex-column gap-2">
                        <label htmlFor="username" className="form-label">Your Name</label>
                        <input
                          type="text"
                          id="username"
                          className="form-control"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter your name"
                        />
                      </div>
                      
                      <div className="d-flex flex-column gap-3">
                        <button 
                          type="button"
                          className="btn btn-primary" 
                          onClick={handleCreateSession}
                        >
                          Create New Session
                        </button>
                        
                        <div className="d-flex align-items-center">
                          <hr className="flex-grow-1" />
                          <span className="px-2 small text-muted">Or join existing</span>
                          <hr className="flex-grow-1" />
                        </div>
                        
                        <form onSubmit={handleJoinSession} className="d-flex flex-column gap-2">
                          <input
                            type="text"
                            className="form-control font-monospace"
                            value={inputSessionId}
                            onChange={(e) => setInputSessionId(e.target.value)}
                            placeholder="Enter Session ID"
                          />
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={!inputSessionId.trim()}
                          >
                            Join Session
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
