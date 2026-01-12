import { supabase } from '@/integrations/supabase/client';

// OTP Generation
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Console logging for free testing
export const sendSMSOTP = async (phone: string, code: string): Promise<boolean> => {
  console.log(`📱 FREE TEST MODE: SMS sent to ${phone}`);
  console.log(`📱 Your verification code is: ${code}`);
  console.log(`📱 This would normally be sent via SMS service`);
  return true;
};

export const sendEmailOTP = async (email: string, code: string): Promise<boolean> => {
  console.log(`📧 FREE TEST MODE: Email sent to ${email}`);
  console.log(`📧 Your verification code is: ${code}`);
  console.log(`📧 This would normally be sent via email service`);
  return true;
};

export const sendVoiceOTP = async (phone: string, code: string): Promise<boolean> => {
  console.log(`📞 FREE TEST MODE: Voice call to ${phone}`);
  console.log(`📞 Your verification code is: ${code}`);
  console.log(`📞 This would normally be read by automated voice`);
  return true;
};

// MFA State Management
export interface MFAData {
  enabled: boolean;
  preferredMethod: 'email' | 'sms';
  phoneVerified: boolean;
  emailVerified: boolean;
  backupCodesGenerated: boolean;
}

export const getUserMFAStatus = async (userId: string): Promise<MFAData | null> => {
  // For now, return mock data - will integrate with database later
  console.log(`🔍 Checking MFA status for user: ${userId}`);
  return {
    enabled: false, // Will be enabled after setup
    preferredMethod: 'email',
    phoneVerified: false,
    emailVerified: false,
    backupCodesGenerated: false
  };
};

export const enableUserMFA = async (
  userId: string,
  method: 'email' | 'sms',
  phone?: string
): Promise<boolean> => {
  console.log(`✅ Enabling MFA for user: ${userId}`);
  console.log(`📱 Method: ${method}`);
  if (phone) console.log(`📞 Phone: ${phone}`);

  // In real implementation, this would update the database
  return true;
};