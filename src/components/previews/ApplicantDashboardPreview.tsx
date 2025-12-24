import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Clock, CheckCircle, XCircle, FileSignature, PenTool } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ApplicantDashboardPreview() {
  const { toast } = useToast();
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractGenerated, setContractGenerated] = useState(false);

  // Mock uploads for preview
  const mockUploads = [
    {
      id: '1',
      stored_filename: 'DOE_JOHN_contract.pdf',
      original_filename: 'my_contract.pdf',
      status: 'pending',
      rejection_reason: null,
      uploaded_at: new Date().toISOString(),
    },
    {
      id: '2',
      stored_filename: 'DOE_JOHN_contract.pdf',
      original_filename: 'signed_contract_v2.pdf',
      status: 'approved',
      rejection_reason: null,
      uploaded_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      stored_filename: 'DOE_JOHN_contract.pdf',
      original_filename: 'old_contract.pdf',
      status: 'rejected',
      rejection_reason: 'blurry',
      uploaded_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

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

  const handleGenerateContract = () => {
    toast({ title: 'Preview Mode', description: 'PDF generation disabled in preview mode.' });
    setContractGenerated(true);
    setShowContractForm(false);
  };

  return (
    <div className="space-y-6 container mx-auto px-4">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Applicant Dashboard</h2>
        <p className="text-muted-foreground">Fill, sign, and upload your contract</p>
      </div>

      {/* Contract Signing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Contract Signing
          </CardTitle>
          <CardDescription>
            Fill out your contract details and sign electronically
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showContractForm ? (
            <Button onClick={() => setShowContractForm(true)} className="w-full sm:w-auto">
              <PenTool className="w-4 h-4 mr-2" />
              Fill & Sign Contract
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" placeholder="e.g., Software Engineer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your Signature</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/50">
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      [Signature Canvas - Draw your signature here]
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Draw your signature using your mouse or finger
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerateContract}>
                  Generate PDF
                </Button>
                <Button variant="outline" onClick={() => setShowContractForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Your Signed Contract
          </CardTitle>
          <CardDescription>
            {contractGenerated 
              ? 'Your contract has been generated. Upload the signed PDF below.'
              : 'After signing your contract, upload it here for review.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract">Select PDF File</Label>
            <Input
              id="contract"
              type="file"
              accept=".pdf"
              className="cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">DOE_JOHN_contract.pdf</span>
            <span className="text-xs text-muted-foreground ml-auto">245.3 KB</span>
          </div>
          <Button disabled>Upload Document (Preview)</Button>
        </CardContent>
      </Card>

      {/* My Uploads Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Uploads</CardTitle>
          <CardDescription>Track the status of your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockUploads.map((upload) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
