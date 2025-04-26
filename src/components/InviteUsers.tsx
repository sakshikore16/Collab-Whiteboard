import React, { useState } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

export const InviteUsers: React.FC = () => {
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
        toast.success(`Invitation sent to ${email}`);
        setEmail('');
      } else {
        toast.error('Failed to send invitation');
      }
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Invite Users</h2>
      <div className="flex gap-2 mb-4 items-center h-10">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleInvite();
            }
          }}
        />
        <Button onClick={handleInvite}>Invite</Button>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-500 mb-1">Or share this link:</p>
        <div className="p-2 bg-gray-100 rounded text-sm overflow-x-auto whitespace-nowrap max-w-full border border-gray-200">
          {`${window.location.origin}/?session=${state.sessionId}`}
        </div>
      </div>
    </div>
  );
}; 