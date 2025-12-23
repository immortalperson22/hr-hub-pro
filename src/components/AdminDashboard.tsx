import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Clock, CheckCircle, XCircle, Download, Eye } from 'lucide-react';

interface PendingUpload {
  id: string;
  user_id: string;
  original_filename: string;
  stored_filename: string;
  storage_path: string;
  status: string;
  uploaded_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<PendingUpload | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingUploads = useCallback(async () => {
    const { data, error } = await supabase
      .from('document_uploads')
      .select('*')
      .eq('status', 'pending')
      .order('uploaded_at', { ascending: true });

    if (error) {
      console.error('Error fetching uploads:', error);
    } else {
      setPendingUploads(data || []);
    }
  }, []);

  useEffect(() => {
    fetchPendingUploads();
  }, [fetchPendingUploads]);

  const handleApprove = async (upload: PendingUpload) => {
    setIsProcessing(true);

    try {
      // Update status to approved
      const { error: updateError } = await supabase
        .from('document_uploads')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', upload.id);

      if (updateError) throw updateError;

      // Call edge function to send email
      const { error: emailError } = await supabase.functions.invoke('send-contract-email', {
        body: {
          uploadId: upload.id,
          storagePath: upload.storage_path,
          filename: upload.stored_filename,
        },
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast({
          title: 'Approved but email failed',
          description: 'Document approved but email notification failed.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Document approved and email sent!' });
      }

      fetchPendingUploads();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }

    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedUpload || !rejectReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a rejection reason.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('document_uploads')
        .update({
          status: 'rejected',
          rejection_reason: rejectReason.trim(),
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', selectedUpload.id);

      if (error) throw error;

      toast({ title: 'Document rejected' });
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedUpload(null);
      fetchPendingUploads();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }

    setIsProcessing(false);
  };

  const handleDownload = async (upload: PendingUpload) => {
    try {
      const { data, error } = await supabase.storage
        .from('contracts')
        .download(upload.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = upload.stored_filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openRejectDialog = (upload: PendingUpload) => {
    setSelectedUpload(upload);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground">Review and manage pending document uploads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingUploads.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pending Uploads
          </CardTitle>
          <CardDescription>
            Review documents and approve or reject them
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUploads.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-muted-foreground">No pending documents to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{upload.stored_filename}</p>
                      <p className="text-sm text-muted-foreground">
                        Applicant ID: {upload.user_id.substring(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(upload.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(upload)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(upload)}
                      disabled={isProcessing}
                      className="bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openRejectDialog(upload)}
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection (one word, e.g., blurry, cropped, incomplete)
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g., blurry"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            maxLength={50}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
