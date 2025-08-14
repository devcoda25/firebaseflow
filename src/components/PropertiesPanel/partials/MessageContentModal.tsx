import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type MessageContentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  content?: string;
};

export default function MessageContentModal({
  isOpen,
  onClose,
  onSave,
  content
}: MessageContentModalProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText(content || '');
    }
  }, [content, isOpen]);

  const handleSave = () => {
    onSave(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
          <DialogDescription>Modify the text content of your message below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message-text">Message Content</Label>
            <Textarea 
              id="message-text" 
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder="Type your message here..."
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
