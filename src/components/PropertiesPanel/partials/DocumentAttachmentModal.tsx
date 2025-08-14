import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { File, FileText, FileSpreadsheet, FileJson, FileQuestion } from 'lucide-react';

type Media = { type: 'image' | 'video' | 'audio' | 'document', url: string, name?: string };

type DocumentAttachmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: Media) => void;
  onDelete: () => void;
  media?: Media;
};

const getFileIcon = (fileName?: string) => {
    if (!fileName) return <File className="w-16 h-16 text-muted-foreground" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf': return <FileText className="w-16 h-16 text-red-500" />;
        case 'docx': return <FileText className="w-16 h-16 text-blue-500" />;
        case 'txt': return <FileText className="w-16 h-16 text-gray-500" />;
        case 'csv':
        case 'xlsx': return <FileSpreadsheet className="w-16 h-16 text-green-500" />;
        case 'json': return <FileJson className="w-16 h-16 text-yellow-500" />;
        default: return <FileQuestion className="w-16 h-16 text-muted-foreground" />;
    }
}

export default function DocumentAttachmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  media
}: DocumentAttachmentModalProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (media && media.type === 'document') {
      setUrl(media.url);
      setName(media.name || '');
    } else {
      setUrl('');
      setName('');
    }
  }, [media, isOpen]);

  const handleSave = () => {
    if (!url) return;
    onSave({ type: 'document', url, name });
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
        setName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach Document</DialogTitle>
          <DialogDescription>Add a document to your message. Provide a URL or upload a file.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center h-40 bg-muted rounded-md">
            {url ? getFileIcon(name || url) : <File className="w-16 h-16 text-muted-foreground" />}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-url">Document URL</Label>
            <Input id="doc-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/document.pdf" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-name">File Name (optional)</Label>
            <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Annual Report.pdf" />
          </div>
          <div className="text-center text-sm text-muted-foreground">or</div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.json"
          />
          <Button variant="outline" type="button" onClick={handleUploadClick}>Upload from device</Button>
        </div>
        <DialogFooter className="justify-between">
          <div>
            {media && media.type === 'document' && <Button variant="destructive" onClick={onDelete}>Delete</Button>}
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
