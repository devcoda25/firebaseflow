import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { File, FileText, FileSpreadsheet, FileJson, FileQuestion } from 'lucide-react';

type Media = { type: 'document', url: string, name?: string };

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

  useEffect(() => {
    if (media) {
      setUrl(media.url);
      setName(media.name || '');
    } else {
      setUrl('');
      setName('');
    }
  }, [media]);

  const handleSave = () => {
    if (!url) return;
    onSave({ type: 'document', url, name });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach Document</DialogTitle>
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
