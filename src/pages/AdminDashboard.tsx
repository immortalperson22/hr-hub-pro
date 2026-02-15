import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, CheckCircle, XCircle, Eye, Save } from 'lucide-react';

interface Applicant {
  id: string;
  user_id: string;
  pre_employment_url: string | null;
  policy_rules_url: string | null;
  created_at: string;
  status: string;
  admin_comment: string | null;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchApplicants();
  }, [user, role]);

  const fetchApplicants = async () => {
    const { data, error } = await supabase
      .from('applicants')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applicants:', error);
    }

    setApplicants(data || []);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500',
      revision_required: 'bg-orange-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return <Badge className={styles[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
  };

  const handleViewPdf = (url: string | null) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const handleApprove = async () => {
    if (!selectedApplicant) return;
    await saveDecision('approved');
  };

  const handleReject = async () => {
    if (!selectedApplicant) return;
    await saveDecision('rejected');
  };

  const handleRevision = async () => {
    if (!selectedApplicant) return;
    await saveDecision('revision_required');
  };

  const saveDecision = async (status: string) => {
    if (!selectedApplicant) return;

    setSaving(true);
    const { error } = await supabase
      .from('applicants')
      .update({
        status,
        admin_comment: comment
      })
      .eq('id', selectedApplicant.id);

    if (error) {
      console.error('Error updating:', error);
    } else {
      setSelectedApplicant({ ...selectedApplicant, status, admin_comment: comment });
      fetchApplicants();
    }

    setSaving(false);
  };

  const openReview = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setComment(applicant.admin_comment || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Applicants ({applicants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {applicants.length === 0 ? (
                <p className="text-gray-500">No applicants yet.</p>
              ) : (
                <div className="space-y-2">
                  {applicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-medium">
                          {applicant.profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(applicant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(applicant.status)}
                        <Button size="sm" variant="outline" onClick={() => openReview(applicant)}>
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Applicant</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedApplicant ? (
                <p className="text-gray-500 text-center py-8">
                  Select an applicant to review
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">
                      {selectedApplicant.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(selectedApplicant.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleViewPdf(selectedApplicant.pre_employment_url)}
                      disabled={!selectedApplicant.pre_employment_url}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Pre-Employment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleViewPdf(selectedApplicant.policy_rules_url)}
                      disabled={!selectedApplicant.policy_rules_url}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Policy Rules
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Admin Comment
                    </label>
                    <Textarea
                      placeholder="Enter feedback for applicant..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={saving}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRevision}
                      disabled={saving}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Request Revision
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={saving}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
