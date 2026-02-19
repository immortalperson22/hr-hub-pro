import { useState } from 'react';
import { FileText, Upload, AlertCircle, X, Download } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';

/**
 * Standalone test page for the Applicant Dashboard UI.
 * Matches the design from 1.png — dark theme, teal accents.
 * Access at /dev-mode (no auth required).
 */
export default function DevMode() {
  const [preEmploymentFile, setPreEmploymentFile] = useState<File | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);

  const PRE_EMPLOYEMENT_SIG_URL = 'https://www.sejda.com/sign-pdf?files=[%7B%22downloadUrl%22%3A%22https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Ddownload%26id%3D1GHeJTZPXcIdZkMg8X0DaV9O4adqA-H5c%22%7D]';
  const POLICY_SIG_URL = 'https://www.sejda.com/sign-pdf?files=[%7B%22downloadUrl%22%3A%22https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Ddownload%26id%3D1moSDwjV9A4UJngeGBJGTfQbFmiMlgXMl%22%7D]';

  // Simulated state - Defaulting to rejection state for preview
  const mockEmail = 'delosreyesjr09@gmail.com';
  const mockAdminFeedback = 'Please ensure the Pre-Employment and Policy Acknowledged Form is signed in all required fields.';
  const mockPreFeedback = 'Signature missing on page 2.';
  const mockPolicyFeedback = ''; // No feedback for policy
  const hasAdminFeedback = true;
  const showResubmit = true;

  const handleFileSelect = (type: 'pre' | 'policy') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (type === 'pre') setPreEmploymentFile(file);
        else setPolicyFile(file);
      }
    };
    input.click();
  };

  const handleDrop = (type: 'pre' | 'policy') => (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      if (type === 'pre') setPreEmploymentFile(file);
      else setPolicyFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const canSubmit = preEmploymentFile && policyFile;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-heading font-bold">HR Portal</h1>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/20">
              <FileText className="w-3 h-3" />
              applicant
            </span>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <span className="text-sm text-muted-foreground hidden lg:block">
              {mockEmail}
            </span>
            <button className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Title */}
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-3xl font-heading font-bold">Applicant Dashboard</h2>
          <p className="text-muted-foreground mt-1">Complete your onboarding requirements</p>
        </div>

        {/* Admin Feedback Banner */}
        {hasAdminFeedback && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10 animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive text-sm font-heading">Admin Feedback</p>
              <p className="text-sm text-muted-foreground mt-1">"{mockAdminFeedback}"</p>
            </div>
          </div>
        )}

        {/* Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pre-Employment Form Card */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg leading-none font-heading">Pre-Employment Form</h3>
            </div>

            <a
              href={PRE_EMPLOYEMENT_SIG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mb-4 w-fit"
            >
              <Download className="w-3 h-3" />
              Download Template: Pre-Employment Form.pdf
            </a>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop('pre')}
              onDragOver={handleDragOver}
              className="flex-grow border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4 flex flex-col justify-center items-center"
              onClick={() => handleFileSelect('pre')}
            >
              <Upload className="w-8 h-8 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Click or drag PDF to upload</p>
              <button
                className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors"
                onClick={(e) => { e.stopPropagation(); handleFileSelect('pre'); }}
              >
                Select PDF
              </button>
            </div>

            {/* Status Indicator / Pill */}
            {preEmploymentFile ? (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg py-3 px-4 transition-all duration-300">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                  </div>
                  <span className="text-sm text-green-400 truncate">
                    {preEmploymentFile.name}
                  </span>
                </div>
                <button
                  onClick={() => setPreEmploymentFile(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/30 border border-border py-3 px-4 text-center">
                <p className="text-sm text-muted-foreground">No file selected</p>
              </div>
            )}

            {/* Simulated Granular Feedback */}
            {mockPreFeedback && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{mockPreFeedback}</p>
              </div>
            )}
          </div>

          {/* Policy Acknowledgement Form Card */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg leading-none font-heading">Policy Acknowledgement Form</h3>
            </div>

            <a
              href={POLICY_SIG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mb-4 w-fit"
            >
              <Download className="w-3 h-3" />
              Download Template: Policy_Acknowledgement.pdf
            </a>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop('policy')}
              onDragOver={handleDragOver}
              className="flex-grow border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4 flex flex-col justify-center items-center"
              onClick={() => handleFileSelect('policy')}
            >
              <Upload className="w-8 h-8 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Click or drag PDF to upload</p>
              <button
                className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors"
                onClick={(e) => { e.stopPropagation(); handleFileSelect('policy'); }}
              >
                Select PDF
              </button>
            </div>

            {/* Status Indicator / Pill */}
            {policyFile ? (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg py-3 px-4 transition-all duration-300">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                  </div>
                  <span className="text-sm text-green-400 truncate">
                    {policyFile.name}
                  </span>
                </div>
                <button
                  onClick={() => setPolicyFile(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/30 border border-border py-3 px-4 text-center">
                <p className="text-sm text-muted-foreground">No file selected</p>
              </div>
            )}

            {/* Simulated Granular Feedback */}
            {mockPolicyFeedback && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{mockPolicyFeedback}</p>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-center justify-center gap-2 text-sm text-amber-500 bg-amber-500/10 py-2 px-4 rounded-full w-fit mx-auto mb-8 border border-amber-500/20">
          <AlertCircle className="w-4 h-4" />
          All required PDFs must be uploaded before submitting.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          {!showResubmit ? (
            <button
              disabled={!canSubmit}
              className="px-10 py-3 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-w-[220px]"
            >
              Submit Application
            </button>
          ) : (
            <button
              disabled={!canSubmit}
              className="px-10 py-3 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-w-[220px]"
            >
              Resubmit Application
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-muted-foreground border-t border-border pt-8">
          © 2023 HR Portal System. All onboarding data is securely encrypted.
        </footer>
      </main>
    </div>
  );
}
