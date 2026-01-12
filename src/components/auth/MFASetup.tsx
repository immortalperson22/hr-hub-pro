import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail, Phone } from 'lucide-react';
import { sendSMSOTP, sendEmailOTP, generateOTP, enableUserMFA } from '@/lib/mfa';

interface MFASetupProps {
  onComplete: () => void;
}

export default function MFASetup({ onComplete }: MFASetupProps) {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms'>('email');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [step, setStep] = useState<'choose' | 'verify'>('choose');

  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!user || !profile) return;

    setIsVerifying(true);
    const code = generateOTP();
    setExpectedCode(code);

    try {
      let success = false;

      if (selectedMethod === 'email') {
        success = await sendEmailOTP(user.email || '', code);
      } else {
        if (!profile.phone) {
          toast({
            title: 'Phone required',
            description: 'Please add a phone number to your profile for SMS verification.',
            variant: 'destructive',
          });
          setIsVerifying(false);
          return;
        }
        success = await sendSMSOTP(profile.phone, code);
      }

      if (success) {
        setStep('verify');
        toast({
          title: 'Code sent!',
          description: `Check your ${selectedMethod === 'email' ? 'email' : 'phone'} for the verification code.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      });
    }

    setIsVerifying(false);
  };

  const handleVerifyCode = async () => {
    if (otpCode !== expectedCode) {
      toast({
        title: 'Invalid code',
        description: 'The code you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) return;

    try {
      const success = await enableUserMFA(
        user.id,
        selectedMethod,
        profile?.phone
      );

      if (success) {
        toast({
          title: 'MFA Enabled!',
          description: 'Your account is now protected with two-factor authentication.',
        });
        onComplete();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enable MFA. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verify Your Code
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your {selectedMethod === 'email' ? 'email' : 'phone'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <input
              id="otp"
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-3 py-2 border rounded-md"
              maxLength={6}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setStep('choose')}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleVerifyCode}
              disabled={otpCode.length !== 6}
              className="flex-1"
            >
              Verify & Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account. Choose how you'd like to receive verification codes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'email' | 'sms')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
              <Mail className="w-4 h-4" />
              Email verification (recommended - always available)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sms" id="sms" />
            <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
              <Phone className="w-4 h-4" />
              SMS verification (needs phone number)
            </Label>
          </div>
        </RadioGroup>

        {selectedMethod === 'sms' && !profile?.phone && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              You need to add a phone number to your profile for SMS verification.
            </p>
          </div>
        )}

        <Button
          onClick={handleSendCode}
          disabled={isVerifying || (selectedMethod === 'sms' && !profile?.phone)}
          className="w-full"
        >
          {isVerifying ? 'Sending Code...' : 'Send Verification Code'}
        </Button>
      </CardContent>
    </Card>
  );
}