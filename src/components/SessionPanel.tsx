import React, { useState } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Users } from 'lucide-react';

export const SessionPanel: React.FC = () => {
  const { state, createSession, joinSession } = useWhiteboard();
  const [inputSessionId, setInputSessionId] = useState('');
  const [username, setUsername] = useState(state.username);
  const [isDialogOpen, setIsDialogOpen] = useState(!state.sessionId);

  const handleCreateSession = () => {
    if (!username.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    createSession(username);
    setIsDialogOpen(false);
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!inputSessionId.trim()) {
      toast.error('Please enter a session ID');
      return;
    }
    
    joinSession(inputSessionId, username);
    setIsDialogOpen(false);
  };

  const copySessionId = () => {
    if (!state.sessionId) return;
    
    navigator.clipboard.writeText(state.sessionId)
      .then(() => toast.success('Session ID copied to clipboard!'))
      .catch(() => toast.error('Failed to copy session ID'));
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={() => setIsDialogOpen(true)}
      >
        <Users className="h-4 w-4" />
        {state.sessionId ? 'Session: ' + state.sessionId : 'Join Session'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collaborative Whiteboard Session</DialogTitle>
            <DialogDescription>Join or create a collaborative whiteboard session</DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            {state.sessionId ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Current Session ID:</p>
                <div className="flex gap-2">
                  <Input
                    value={state.sessionId}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={copySessionId} className="shrink-0">
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="username" className="text-sm">Your Name</label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <Button onClick={handleCreateSession}>
                    Create New Session
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or join existing
                      </span>
                    </div>
                  </div>
                  
                  <form onSubmit={handleJoinSession} className="flex flex-col gap-2">
                    <Input
                      value={inputSessionId}
                      onChange={(e) => setInputSessionId(e.target.value)}
                      placeholder="Enter Session ID"
                      className="font-mono"
                    />
                    <Button type="submit" disabled={!inputSessionId.trim()}>
                      Join Session
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
