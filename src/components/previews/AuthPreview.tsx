import { useState } from 'react';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function AuthPreview() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="auth-page-container">
      <div className="dark-mode-toggle-auth">
        <DarkModeToggle />
      </div>
      
      <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Create Account</h1>
            <span>use your email for registration</span>
            <input type="text" placeholder="Full Name" defaultValue="John Doe" />
            <input type="email" placeholder="Email" defaultValue="preview@example.com" />
            <input type="tel" placeholder="Phone Number (optional)" defaultValue="+1-555-0123" />
            <input type="password" placeholder="Password" defaultValue="••••••••" />
            <button type="button" disabled>Sign Up (Preview)</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Sign in</h1>
            <span>use your account</span>
            <input type="email" placeholder="Email" defaultValue="user@example.com" />
            <input type="password" placeholder="Password" defaultValue="••••••••" />
            <a href="#">Forgot your password?</a>
            <button type="button" disabled>Sign In (Preview)</button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={() => setIsSignUp(false)}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" onClick={() => setIsSignUp(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
