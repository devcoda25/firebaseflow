import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon } from 'lucide-react';

type Media = { type: 'image' | 'video' | 'audio' | 'document', url: string, name?: string };

type ImageAttachmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: Media) => void;
  onDelete: () => void;
  media?: Media;
};

export default function ImageAttachmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  media
}: ImageAttachmentModalProps) {
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (media && media.type === 'image') {
      setUrl(media.url);
    } else {
      setUrl('');
    }
  }, [media, isOpen]);

  const handleSave = () => {
    if (!url) return;
    onSave({ type: 'image', url });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach Image</DialogTitle>
          <DialogDescription>Add an image to your message. Provide a URL or upload a file.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center h-48 bg-muted rounded-md overflow-hidden">
                {url ? 
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="Image preview" width={200} height={200} className="object-contain max-h-full" /> : 
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                }
            </div>
            <div className="grid gap-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input id="image-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" />
            </div>
            <div className="text-center text-sm text-muted-foreground">or</div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <Button variant="outline" type="button" onClick={handleUploadClick}>Upload from device</Button>
        </div>
        <DialogFooter className="justify-between">
            <div>
              {media && media.type === 'image' && <Button variant="destructive" onClick={onDelete}>Delete</Button>}
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
