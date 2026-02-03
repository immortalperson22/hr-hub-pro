import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';
import MFASetup from '@/components/auth/MFASetup';
import MFAPrompt from '@/components/auth/MFAPrompt';

export default function Auth() {
  const [isActive, setIsActive] = useState(false);
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  
  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [showMFAPrompt, setShowMFAPrompt] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{email: string, password: string} | null>(null);
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form refs for resetting
  const signInFormRef = useRef<HTMLFormElement>(null);
  const signUpFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Reset functions
  const resetSignUp = () => {
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpName('');
    setSignUpPhone('');
    setShowSignUpPassword(false);
    signUpFormRef.current?.reset();
  };

  const resetSignIn = () => {
    setSignInEmail('');
    setSignInPassword('');
    setShowSignInPassword(false);
    signInFormRef.current?.reset();
  };

  // Toggle handlers
  const handleSwitchToSignIn = () => {
    resetSignUp();
    setIsActive(false);
  };

  const handleSwitchToSignUp = () => {
    resetSignIn();
    setIsActive(true);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn(signInEmail, signInPassword);
    if (result.error) {
      toast({
        title: 'Sign in failed',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      setPendingCredentials({ email: signInEmail, password: signInPassword });
      setShowMFAPrompt(true);
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    const result = await signUp(signUpEmail, signUpPassword, signUpName, signUpPhone || undefined);
    if (result.error) {
      toast({
        title: 'Sign up failed',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'Now set up two-factor authentication.',
      });
      setShowMFASetup(true);
      resetSignUp();
      setIsActive(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-page-body">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-[9999] w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* MFA Setup Modal */}
      {showMFASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <MFASetup
            onComplete={() => {
              setShowMFASetup(false);
              toast({
                title: 'MFA Setup Complete!',
                description: 'Your account is now secure with two-factor authentication.',
              });
            }}
          />
        </div>
      )}

      {/* MFA Login Prompt */}
      {showMFAPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <MFAPrompt
            onSuccess={() => {
              setShowMFAPrompt(false);
              setPendingCredentials(null);
              navigate('/dashboard');
            }}
            onCancel={() => {
              setShowMFAPrompt(false);
              setPendingCredentials(null);
            }}
          />
        </div>
      )}

      <div className={`auth-container ${isActive ? 'active' : ''}`} id="container">
        {/* Sign Up Form */}
        <div className="form-container sign-up">
          <form ref={signUpFormRef} onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            <span>use your email for registration</span>
            <input
              type="text"
              placeholder="Name"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={signUpPhone}
              onChange={(e) => setSignUpPhone(e.target.value)}
            />
            <div className="password-input-container">
              <input
                type={showSignUpPassword ? "text" : "password"}
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
              >
                {showSignUpPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form ref={signInFormRef} onSubmit={handleSignIn}>
            <h1>Sign In</h1>
            <span>use your email password</span>
            <input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
            />
            <div className="password-input-container">
              <input
                type={showSignInPassword ? "text" : "password"}
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
              >
                {showSignInPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Forgot password feature coming soon'); }}>Forget Your Password?</a>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button
                type="button"
                className="hidden-btn"
                onClick={handleSwitchToSignIn}
              >
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button
                type="button"
                className="hidden-btn"
                onClick={handleSwitchToSignUp}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle buttons */}
      <div className="md:hidden mt-4 text-center">
        {isActive ? (
          <button
            onClick={handleSwitchToSignIn}
            className="text-sm text-primary underline"
          >
            Already have an account? Sign In
          </button>
        ) : (
          <button
            onClick={handleSwitchToSignUp}
            className="text-sm text-primary underline"
          >
            Don't have an account? Sign Up
          </button>
        )}
      </div>
    </div>
  );
}
