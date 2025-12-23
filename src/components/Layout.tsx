import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, User, FileText, Users } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-primary text-primary-foreground';
      case 'employee':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-semibold text-foreground">HR Portal</h1>
              <p className="text-xs text-muted-foreground">Human Resources Management</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {role === 'applicant' && (
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <FileText className="w-4 h-4" />
                My Documents
              </button>
            )}
            {role === 'admin' && (
              <>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <FileText className="w-4 h-4" />
                  Pending Uploads
                </button>
                <button 
                  onClick={() => navigate('/users')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Users className="w-4 h-4" />
                  Manage Users
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full capitalize ${getRoleBadgeColor()}`}>
                  {role}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
