import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Applicant {
  id: string;
  user_id: string;
  pre_employment_url: string | null;
  policy_rules_url: string | null;
  status: 'pending' | 'revision_required' | 'approved';
  admin_comment: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [comment, setComment] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchApplicants = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplicants(data || []);
    } catch (error: any) {
      console.error('Error fetching applicants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applicants.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const openDialog = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setComment(applicant.admin_comment || '');
    setIsDialogOpen(true);
  };

  const handleViewPdf = (url: string | null, docType: string) => {
    if (!url) {
      toast({
        title: 'Not available',
        description: 'This document has not been uploaded yet.',
        variant: 'destructive',
      });
      return;
    }
    window.open(url, '_blank');
  };

  const handleStatusUpdate = async (status: 'revision_required' | 'approved') => {
    if (!selectedApplicant) return;

    if (status === 'revision_required' && !comment.trim()) {
      toast({
        title: 'Comment required',
        description: 'Please provide feedback for revision request.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('applicants')
        .update({
          status,
          admin_comment: status === 'revision_required' ? comment.trim() : null,
        })
        .eq('id', selectedApplicant.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Application marked as ${status === 'approved' ? 'approved' : 'revision required'}.`,
      });

      setIsDialogOpen(false);
      setComment('');
      setSelectedApplicant(null);
      fetchApplicants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </div>
        );
      case 'revision_required':
        return (
          <div className="flex items-center gap-1 text-orange-700 bg-orange-100 px-2 py-1 rounded text-xs font-semibold">
            <AlertCircle className="w-3 h-3" />
            Revision Required
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-semibold">
            <Clock className="w-3 h-3" />
            Pending
          </div>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'revision_required':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading applicants...</p>
      </div>
    );
  }

  const stats = {
    pending: applicants.filter((a) => a.status === 'pending').length,
    revisionRequired: applicants.filter((a) => a.status === 'revision_required').length,
    approved: applicants.filter((a) => a.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground">Review and manage applicant submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revision Required</p>
                <p className="text-2xl font-bold">{stats.revisionRequired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applicants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Applicants
          </CardTitle>
          <CardDescription>Review documents and provide feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {applicants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No applicants yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pre-Employment</TableHead>
                    <TableHead>Policy Rules</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="text-sm">
                        {new Date(applicant.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleViewPdf(applicant.pre_employment_url, 'pre-employment')
                          }
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleViewPdf(applicant.policy_rules_url, 'policy-rules')
                          }
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => openDialog(applicant)}
                          disabled={applicant.status === 'approved'}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Leave feedback or approve this applicant's submission
            </DialogDescription>
          </DialogHeader>

          {selectedApplicant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Status</p>
                  <p className="font-semibold capitalize">{selectedApplicant.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-semibold">
                    {new Date(selectedApplicant.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Feedback/Comment</label>
                <Textarea
                  placeholder="Enter feedback or reason for revision request..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleStatusUpdate('revision_required')}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Request Revision'}
            </Button>
            <Button
              onClick={() => handleStatusUpdate('approved')}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? 'Saving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Missing icon, adding inline
function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}
