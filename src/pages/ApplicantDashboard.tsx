import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApplicantRecord {
  id: string;
  user_id: string;
  pre_employment_url: string | null;
  policy_rules_url: string | null;
  created_at: string;
  status: string;
  admin_comment: string | null;
}

const SEJDA_PRE_EMPLOYMENT = 'https://www.sejda.com/pdf-fill';
const SEJDA_POLICY = 'https://www.sejda.com/pdf-fill';

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicant, setApplicant] = useState<ApplicantRecord | null>(null);
  const [preEmploymentFile, setPreEmploymentFile] = useState<File | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchApplicantRecord();
  }, [user]);

  const fetchApplicantRecord = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching applicant:', error);
    }
    
    setApplicant(data as ApplicantRecord | null);
    setLoading(false);
  };

  const handleFileChange = (type: 'pre_employment' | 'policy') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Only PDF files are allowed' });
      return;
    }

    if (type === 'pre_employment') {
      setPreEmploymentFile(file);
    } else {
      setPolicyFile(file);
    }
    setMessage(null);
  };

  const uploadFile = async (file: File, fileName: string): Promise<string | null> => {
    if (!user) return null;

    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('applicant-docs')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: signedUrl } = supabase.storage
      .from('applicant-docs')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    return signedUrl?.signedUrl || null;
  };

  const handleSubmit = async () => {
    if (!user || !preEmploymentFile || !policyFile) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const preEmploymentUrl = await uploadFile(preEmploymentFile, 'pre-employment.pdf');
      const policyUrl = await uploadFile(policyFile, 'policy-rules.pdf');

      if (!preEmploymentUrl || !policyUrl) {
        setMessage({ type: 'error', text: 'Failed to upload files. Please try again.' });
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('applicants')
        .insert({
          user_id: user.id,
          pre_employment_url: preEmploymentUrl,
          policy_rules_url: policyUrl,
          status: 'pending'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        setMessage({ type: 'error', text: 'Failed to submit documents. Please try again.' });
      } else {
        setMessage({ type: 'success', text: 'Documents submitted successfully!' });
        fetchApplicantRecord();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }

    setSubmitting(false);
  };

  const handleResubmit = async () => {
    if (!user || !preEmploymentFile || !policyFile || !applicant) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const updates: { pre_employment_url?: string; policy_rules_url?: string } = {};

      if (preEmploymentFile) {
        const url = await uploadFile(preEmploymentFile, 'pre-employment.pdf');
        if (url) updates.pre_employment_url = url;
      }

      if (policyFile) {
        const url = await uploadFile(policyFile, 'policy-rules.pdf');
        if (url) updates.policy_rules_url = url;
      }

      const { error: updateError } = await supabase
        .from('applicants')
        .update({ ...updates, status: 'pending', admin_comment: null })
        .eq('id', applicant.id);

      if (updateError) {
        setMessage({ type: 'error', text: 'Failed to resubmit documents.' });
      } else {
        setMessage({ type: 'success', text: 'Documents resubmitted successfully!' });
        setPreEmploymentFile(null);
        setPolicyFile(null);
        fetchApplicantRecord();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred.' });
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const canSubmit = preEmploymentFile && policyFile && !submitting;
  const showResubmit = applicant && (applicant.status === 'revision_required' || applicant.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Applicant Dashboard</h1>

        {message && (
          <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {applicant?.status === 'approved' && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Your application has been approved!
            </AlertDescription>
          </Alert>
        )}

        {applicant?.status === 'revision_required' && (
          <Alert className="mb-4 border-yellow-500 bg-yellow-50">
            <FileText className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              <span className="font-semibold">Revision Required:</span> {applicant.admin_comment || 'Please review the comments and resubmit.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Pre-Employment Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.open(SEJDA_PRE_EMPLOYMENT, '_blank')}>
                  Fill & Sign in Sejda
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Upload PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange('pre_employment')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>
              {applicant?.pre_employment_url && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Uploaded
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Policy Rules & Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.open(SEJDA_POLICY, '_blank')}>
                  Fill & Sign in Sejda
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Upload PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange('policy')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>
              {applicant?.policy_rules_url && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Uploaded
                </p>
              )}
            </CardContent>
          </Card>

          {!applicant && (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Submit Documents
            </Button>
          )}

          {showResubmit && (
            <Button
              onClick={handleResubmit}
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Fix & Resubmit
            </Button>
          )}

          {applicant && !showResubmit && applicant.status === 'pending' && (
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Your documents are pending review. You will be notified once an admin reviews them.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
