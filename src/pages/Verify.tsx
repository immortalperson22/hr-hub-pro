import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function Verify() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus('confirmed');
        setMessage('Email confirmed! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } else {
        setStatus('error');
        setMessage('Verification failed. Please try again or contact support.');
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin" />
              <CardTitle className="mt-4">Verifying Email</CardTitle>
            </>
          )}
          {status === 'confirmed' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <CardTitle className="mt-4 text-green-600">Email Confirmed!</CardTitle>
            </>
          )}
          {status === 'error' && (
            <>
              <CardTitle className="mt-4 text-red-600">Verification Failed</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">{message}</p>
          {status === 'error' && (
            <Button onClick={() => navigate('/auth')}>
              Go to Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
