import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Applicant {
  id: string;
  user_id: string;
  pre_employment_url: string | null;
  policy_rules_url: string | null;
  created_at: string;
  status: string;
  admin_comment: string | null;
  pre_employment_feedback: string | null;
  policy_rules_feedback: string | null;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

export default function AdminDashboard() {
  const { user, role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [comment, setComment] = useState('');
  const [preFeedback, setPreFeedback] = useState('');
  const [policyFeedback, setPolicyFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && role === 'admin') {
      fetchApplicants();
    }
  }, [user, role]);

  const fetchApplicants = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('applicants' as any)
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching applicants:', fetchError);
        setError(fetchError.message);
      } else {
        setApplicants((data as unknown as Applicant[]) || []);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500 hover:bg-yellow-600',
      revision_required: 'bg-orange-500 hover:bg-orange-600',
      approved: 'bg-green-500 hover:bg-green-600',
      rejected: 'bg-red-500 hover:bg-red-600'
    };
    return <Badge className={styles[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
  };

  const handleViewPdf = (url: string | null) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const saveDecision = async (status: string) => {
    if (!selectedApplicant) return;

    setSaving(true);
    try {
      const { error: appError } = await supabase
        .from('applicants' as any)
        .update({
          status,
          admin_comment: comment,
          pre_employment_feedback: preFeedback,
          policy_rules_feedback: policyFeedback
        })
        .eq('id', selectedApplicant.id);

      if (appError) throw appError;

      if (status === 'approved') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: 'employee' })
          .eq('user_id', selectedApplicant.user_id);

        if (roleError) {
          console.error('Error promoting user:', roleError);
        }
      }

      setSelectedApplicant({
        ...selectedApplicant,
        status,
        admin_comment: comment,
        pre_employment_feedback: preFeedback,
        policy_rules_feedback: policyFeedback
      });
      fetchApplicants();
    } catch (error) {
      console.error('Error updating:', error);
    } finally {
      setSaving(false);
    }
  };

  const openReview = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setComment(applicant.admin_comment || '');
    setPreFeedback(applicant.pre_employment_feedback || '');
    setPolicyFeedback(applicant.policy_rules_feedback || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1">Review and manage onboarding applications</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center gap-3 shadow-sm">
          <XCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm font-medium text-destructive">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-heading flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Recent Applicants ({applicants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applicants.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No applicants yet.</p>
            ) : (
              <div className="space-y-3">
                {applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group"
                    onClick={() => openReview(applicant)}
                  >
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {applicant.profiles?.full_name || `Applicant (${applicant.user_id.slice(0, 8)})`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(applicant.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(applicant.status)}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-heading">Application Review</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedApplicant ? (
              <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground italic">Select an applicant to begin review</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="font-bold text-lg text-foreground">
                    {selectedApplicant.profiles?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {selectedApplicant.id}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Pre-Employment PDF</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-border/50 bg-background hover:bg-muted"
                      onClick={() => handleViewPdf(selectedApplicant.pre_employment_url)}
                      disabled={!selectedApplicant.pre_employment_url}
                    >
                      <Eye className="w-4 h-4 mr-2 text-primary" />
                      Open Document
                    </Button>
                    <Input
                      placeholder="Comment for this file..."
                      value={preFeedback}
                      onChange={(e) => setPreFeedback(e.target.value)}
                      className="text-xs bg-muted/20 border-border/50 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Policy Rules PDF</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-border/50 bg-background hover:bg-muted"
                      onClick={() => handleViewPdf(selectedApplicant.policy_rules_url)}
                      disabled={!selectedApplicant.policy_rules_url}
                    >
                      <Eye className="w-4 h-4 mr-2 text-primary" />
                      Open Document
                    </Button>
                    <Input
                      placeholder="Comment for this file..."
                      value={policyFeedback}
                      onChange={(e) => setPolicyFeedback(e.target.value)}
                      className="text-xs bg-muted/20 border-border/50 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Overall Conclusion</Label>
                  <Textarea
                    placeholder="Enter final summary or next steps for the applicant..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px] bg-muted/20 border-border/50 focus:ring-primary text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="destructive"
                    className="shadow-lg shadow-destructive/20"
                    onClick={() => saveDecision('rejected')}
                    disabled={saving}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-orange-500 hover:bg-orange-600 border-none text-white shadow-lg shadow-orange-500/20"
                    onClick={() => saveDecision('revision_required')}
                    disabled={saving}
                  >
                    <FileText className="w-4 h-4 mr-1.5" />
                    Revision
                  </Button>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                    onClick={() => saveDecision('approved')}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`block text-sm font-medium ${className}`}>{children}</label>;
}
