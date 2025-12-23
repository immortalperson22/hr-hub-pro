import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface DocumentUpload {
  id: string;
  original_filename: string;
  stored_filename: string;
  status: string;
  rejection_reason: string | null;
  uploaded_at: string;
}

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploads, setUploads] = useState<DocumentUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchUploads = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('document_uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching uploads:', error);
    } else {
      setUploads(data || []);
    }
  }, [user]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file only.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);

    try {
      // Generate stored filename: applicant-{userId}_contract.pdf
      const storedFilename = `applicant-${user.id.substring(0, 8)}_contract.pdf`;
      const storagePath = `${user.id}/${storedFilename}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(storagePath, selectedFile, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Create database record
      const { error: dbError } = await supabase
        .from('document_uploads')
        .insert({
          user_id: user.id,
          original_filename: selectedFile.name,
          stored_filename: storedFilename,
          storage_path: storagePath,
          status: 'pending',
        });

      if (dbError) {
        throw dbError;
      }

      toast({ title: 'Document uploaded successfully!' });
      setSelectedFile(null);
      fetchUploads();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }

    setIsUploading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium border';
    switch (status) {
      case 'approved':
        return `${baseClasses} status-approved`;
      case 'rejected':
        return `${baseClasses} status-rejected`;
      default:
        return `${baseClasses} status-pending`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Applicant Dashboard</h2>
        <p className="text-muted-foreground">Upload your signed contract documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Contract
          </CardTitle>
          <CardDescription>
            Upload your signed contract as a PDF. The file will be renamed automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract">Select PDF File</Label>
            <Input
              id="contract"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Uploads</CardTitle>
          <CardDescription>Track the status of your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(upload.status)}
                    <div>
                      <p className="font-medium text-foreground">{upload.stored_filename}</p>
                      <p className="text-xs text-muted-foreground">
                        Original: {upload.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(upload.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={getStatusBadge(upload.status)}>
                      {upload.status}
                    </span>
                    {upload.status === 'rejected' && upload.rejection_reason && (
                      <p className="text-xs text-destructive mt-1">
                        Reason: {upload.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
