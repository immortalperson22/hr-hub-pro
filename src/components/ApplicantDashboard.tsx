import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApplicantRecord {
  id: string;
  user_id: string;
  pre_employment_url: string | null;
  policy_rules_url: string | null;
  status: 'pending' | 'revision_required' | 'approved';
  admin_comment: string | null;
  created_at: string;
}

const SEJDA_LINKS = {
  preEmployment: 'https://sejda.com/project/sign-pdf',
  policyRules: 'https://sejda.com/project/sign-pdf',
};

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [applicant, setApplicant] = useState<ApplicantRecord | null>(null);
  const [preEmploymentFile, setPreEmploymentFile] = useState<File | null>(null);
  const [policyRulesFile, setPolicyRulesFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preEmploymentUrl, setPreEmploymentUrl] = useState<string | null>(null);
  const [policyRulesUrl, setPolicyRulesUrl] = useState<string | null>(null);

  const fetchApplicantRecord = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setApplicant(data);
    } catch (error: any) {
      console.error('Error fetching applicant record:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your application data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchApplicantRecord();
  }, [fetchApplicantRecord]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
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
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 20MB.',
          variant: 'destructive',
        });
        return;
      }
      setter(file);
    }
  };

  const uploadDocument = async (
    file: File,
    documentType: 'pre_employment' | 'policy_rules'
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const timestamp = Date.now();
      const fileName = `${documentType}_${timestamp}.pdf`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('applicant-docs')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('applicant-docs')
        .createSignedUrl(filePath, 60 * 60 * 24 * 30); // 30 days

      if (urlError) throw urlError;

      return signedUrlData.signedUrl;
    } catch (error: any) {
      console.error(`Error uploading ${documentType}:`, error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!preEmploymentFile || !policyRulesFile) {
      toast({
        title: 'Missing documents',
        description: 'Please upload both PDF documents.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) return;

    setIsUploading(true);

    try {
      const preUrl = await uploadDocument(preEmploymentFile, 'pre_employment');
      const policyUrl = await uploadDocument(policyRulesFile, 'policy_rules');

      if (!applicant) {
        const { error } = await supabase
          .from('applicants')
          .insert({
            user_id: user.id,
            pre_employment_url: preUrl,
            policy_rules_url: policyUrl,
            status: 'pending',
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('applicants')
          .update({
            pre_employment_url: preUrl,
            policy_rules_url: policyUrl,
            status: 'pending',
          })
          .eq('user_id', user.id);

        if (error) throw error;
      }

      toast({ title: 'Success', description: 'Documents submitted for review.' });
      setPreEmploymentFile(null);
      setPolicyRulesFile(null);
      fetchApplicantRecord();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDocument = async (url: string | null, docType: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isSubmitDisabled =
    !preEmploymentFile || !policyRulesFile || isUploading || applicant?.status === 'approved';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Application Dashboard</h2>
        <p className="text-muted-foreground">Upload your signed documents for review</p>
      </div>

      {applicant?.status === 'revision_required' && applicant.admin_comment && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">Revision Required</div>
            <div>{applicant.admin_comment}</div>
          </AlertDescription>
        </Alert>
      )}

      {applicant?.status === 'approved' && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Your application has been approved!</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pre-Employment Document */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pre-Employment Document</CardTitle>
            <CardDescription>Required signed PDF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => window.open(SEJDA_LINKS.preEmployment, '_blank')}
              variant="outline"
              className="w-full"
            >
              Fill & Sign in Sejda
            </Button>

            <div className="space-y-2">
              <Label htmlFor="pre-employment">Upload PDF</Label>
              <Input
                id="pre-employment"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e, setPreEmploymentFile)}
                disabled={isUploading}
              />
              {preEmploymentFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                  <FileText className="w-4 h-4" />
                  {preEmploymentFile.name}
                </div>
              )}
            </div>

            {applicant?.pre_employment_url && (
              <Button
                onClick={() => handleViewDocument(applicant.pre_employment_url, 'pre-employment')}
                variant="secondary"
                className="w-full"
              >
                View Submitted Document
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Policy Rules Document */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Policy Rules & Information</CardTitle>
            <CardDescription>Required signed PDF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => window.open(SEJDA_LINKS.policyRules, '_blank')}
              variant="outline"
              className="w-full"
            >
              Fill & Sign in Sejda
            </Button>

            <div className="space-y-2">
              <Label htmlFor="policy-rules">Upload PDF</Label>
              <Input
                id="policy-rules"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e, setPolicyRulesFile)}
                disabled={isUploading}
              />
              {policyRulesFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                  <FileText className="w-4 h-4" />
                  {policyRulesFile.name}
                </div>
              )}
            </div>

            {applicant?.policy_rules_url && (
              <Button
                onClick={() => handleViewDocument(applicant.policy_rules_url, 'policy-rules')}
                variant="secondary"
                className="w-full"
              >
                View Submitted Document
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Section */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Documents</CardTitle>
          <CardDescription>Both documents must be uploaded to submit</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>Uploading...</>
            ) : applicant?.status === 'approved' ? (
              <>Application Approved</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Documents
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status Info */}
      {applicant && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-semibold capitalize">{applicant.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted:</span>
              <span>{new Date(applicant.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
