import React, { useState, useContext } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';

interface InviteUsersProps {
  showNotification: (msg: string) => void;
}

export const InviteUsers: React.FC<InviteUsersProps> = ({ showNotification }) => {
  const { state } = useWhiteboard();
  const [email, setEmail] = useState('');

  const handleInvite = async () => {
    if (!email.trim() || !state.sessionId) return;

    try {
      const invitationLink = `${window.location.origin}/?session=${state.sessionId}`;
      const response = await fetch('http://localhost:4000/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, link: invitationLink }),
      });
      if (response.ok) {
        showNotification(`Invitation sent to ${email}`);
        setEmail('');
      } else {
        showNotification('Failed to send invitation');
      }
    } catch (error) {
      showNotification('Failed to send invitation');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?session=${state.sessionId}`);
    showNotification('Invite link copied to clipboard!');
  };

  return (
    <div>
      <h2 className="h5 mb-3">Invite Users</h2>
      <div className="input-group mb-3">
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleInvite();
            }
          }}
        />
        <button 
          className="btn btn-primary" 
          type="button"
          onClick={handleInvite}
        >
          Invite
        </button>
      </div>
      <div className="mt-3">
        <p className="small text-muted mb-2">Or share this link:</p>
        <div className="p-2 bg-light rounded-2 small overflow-auto border" onClick={handleCopy} style={{ cursor: 'pointer' }}>
          {`${window.location.origin}/?session=${state.sessionId}`}
        </div>
      </div>
    </div>
  );
}; 