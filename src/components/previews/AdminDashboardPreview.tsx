import { useState } from 'react';
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
import { FileText, Clock, CheckCircle, XCircle, Download } from 'lucide-react';

export default function AdminDashboardPreview() {
  const { toast } = useToast();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Mock pending uploads for preview
  const mockPendingUploads = [
    {
      id: '1',
      user_id: 'abc12345-6789-def0-1234-567890abcdef',
      stored_filename: 'SMITH_JANE_contract.pdf',
      original_filename: 'signed_contract.pdf',
      uploaded_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'def67890-1234-abc5-6789-0123456789ab',
      stored_filename: 'JOHNSON_MIKE_contract.pdf',
      original_filename: 'my_contract_final.pdf',
      uploaded_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      user_id: 'ghi11111-2222-3333-4444-555566667777',
      stored_filename: 'WILLIAMS_SARAH_contract.pdf',
      original_filename: 'contract_signed_v2.pdf',
      uploaded_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const handleApprove = () => {
    toast({ title: 'Preview Mode', description: 'Approval disabled in preview mode.' });
  };

  const handleReject = () => {
    toast({ title: 'Preview Mode', description: 'Rejection disabled in preview mode.' });
    setShowRejectDialog(false);
    setRejectReason('');
  };

  const handleDownload = () => {
    toast({ title: 'Preview Mode', description: 'Download disabled in preview mode.' });
  };

  return (
    <div className="space-y-6 container mx-auto px-4">
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
                <p className="text-2xl font-bold text-foreground">{mockPendingUploads.length}</p>
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
          <div className="space-y-4">
            {mockPendingUploads.map((upload) => (
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
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    className="bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
            <Button variant="destructive" onClick={handleReject}>
              Reject (Preview)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
