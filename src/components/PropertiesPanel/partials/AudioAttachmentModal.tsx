import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Music } from 'lucide-react';

type Media = { type: 'audio', url: string, name?: string };

type AudioAttachmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: Media) => void;
  onDelete: () => void;
  media?: Media;
};

export default function AudioAttachmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  media
}: AudioAttachmentModalProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (media) {
      setUrl(media.url);
    } else {
      setUrl('');
    }
  }, [media]);

  const handleSave = () => {
    if (!url) return;
    onSave({ type: 'audio', url });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach Audio</DialogTitle>
          <DialogDescription>Add an audio file to your message. Provide a URL or upload a file.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center h-48 bg-muted rounded-md overflow-hidden">
            {url ? 
              <audio src={url} controls className="w-full" /> : 
              <Music className="w-16 h-16 text-muted-foreground" />
            }
          </div>
          <div className="grid gap-2">
            <Label htmlFor="audio-url">Audio URL</Label>
            <Input id="audio-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/audio.mp3" />
          </div>
          <div className="text-center text-sm text-muted-foreground">or</div>
          <Button variant="outline" type="button">Upload from device</Button>
        </div>
        <DialogFooter className="justify-between">
          <div>
            {media && <Button variant="destructive" onClick={onDelete}>Delete</Button>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!url}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
