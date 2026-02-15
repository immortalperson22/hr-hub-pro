import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface PdfFixEditorProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  onReupload: (file: File) => Promise<void>;
}

export default function PdfFixEditor({
  isOpen,
  onClose,
  pdfUrl,
  onReupload,
}: PdfFixEditorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  const handleReupload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onReupload(selectedFile);
      setSelectedFile(null);
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fix and Re-upload PDF</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {pdfUrl && (
            <div className="border rounded-lg p-4 bg-muted max-h-96 overflow-y-auto">
              <iframe
                src={pdfUrl}
                width="100%"
                height="400"
                title="Current PDF"
                className="rounded"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="replacement-pdf">Upload Corrected PDF</Label>
            <Input
              id="replacement-pdf"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleReupload}
            disabled={!selectedFile || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? 'Uploading...' : 'Re-upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
