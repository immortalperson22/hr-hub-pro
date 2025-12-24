import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SignatureCanvas from '@/components/SignatureCanvas';
import { useToast } from '@/hooks/use-toast';
import { FileSignature, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ContractFormProps {
  onContractGenerated: () => void;
}

export default function ContractForm({ onContractGenerated }: ContractFormProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fullName = profile?.full_name || '';

  const generatePDF = async () => {
    if (!signatureData) {
      toast({
        title: 'Signature required',
        description: 'Please sign in the signature box.',
        variant: 'destructive',
      });
      return;
    }

    if (!position || !startDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('EMPLOYMENT CONTRACT', pageWidth / 2, 30, { align: 'center' });

      // Company info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('HR Department', pageWidth / 2, 45, { align: 'center' });
      doc.text('Company Name Inc.', pageWidth / 2, 52, { align: 'center' });

      // Contract content
      doc.setFontSize(11);
      let y = 75;

      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
      y += 15;

      doc.setFont('helvetica', 'bold');
      doc.text('Employee Information:', 20, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`Full Name: ${fullName}`, 20, y);
      y += 8;
      doc.text(`Position: ${position}`, 20, y);
      y += 8;
      doc.text(`Start Date: ${startDate}`, 20, y);
      y += 20;

      // Terms
      doc.setFont('helvetica', 'bold');
      doc.text('Terms and Conditions:', 20, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      const terms = [
        '1. The Employee agrees to perform duties as assigned by the Company.',
        '2. The Employee will maintain confidentiality of company information.',
        '3. The employment is subject to a probationary period of 90 days.',
        '4. Either party may terminate this agreement with 2 weeks notice.',
        '5. The Employee agrees to follow all company policies and procedures.',
      ];

      terms.forEach((term) => {
        doc.text(term, 20, y, { maxWidth: pageWidth - 40 });
        y += 12;
      });

      y += 20;
      doc.text('I hereby agree to the terms and conditions stated above.', 20, y);
      y += 25;

      // Signature
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Signature:', 20, y);
      y += 5;

      // Add signature image
      doc.addImage(signatureData, 'PNG', 20, y, 80, 30);
      y += 40;

      doc.setFont('helvetica', 'normal');
      doc.text(`Signed by: ${fullName}`, 20, y);
      y += 8;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);

      // Generate filename: LASTNAME_FIRSTNAME_contract.pdf
      const nameParts = fullName.trim().split(' ');
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : nameParts[0].toUpperCase();
      const firstName = nameParts[0].toUpperCase();
      const filename = `${lastName}_${firstName}_contract.pdf`;

      doc.save(filename);

      toast({
        title: 'Contract generated!',
        description: `Downloaded as ${filename}`,
      });

      onContractGenerated();
      setShowForm(false);
      setPosition('');
      setStartDate('');
      setSignatureData(null);
    } catch (error: any) {
      toast({
        title: 'Error generating PDF',
        description: error.message,
        variant: 'destructive',
      });
    }

    setIsGenerating(false);
  };

  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Contract Signing
          </CardTitle>
          <CardDescription>
            Fill out and sign your employment contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <FileSignature className="w-4 h-4 mr-2" />
            Fill & Sign Contract
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="w-5 h-5" />
          Contract Signing
        </CardTitle>
        <CardDescription>
          Complete all fields and sign below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              placeholder="e.g., Software Engineer"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>E-Signature (draw with mouse or finger)</Label>
          <SignatureCanvas onSignatureChange={setSignatureData} />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={generatePDF}
            disabled={isGenerating || !signatureData || !position || !startDate}
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
