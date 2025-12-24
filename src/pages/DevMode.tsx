import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DarkModeToggle from '@/components/DarkModeToggle';
import { User, Shield, Briefcase, Eye } from 'lucide-react';

// Preview versions of dashboards (no database calls)
import ApplicantDashboardPreview from '@/components/previews/ApplicantDashboardPreview';
import EmployeeDashboardPreview from '@/components/previews/EmployeeDashboardPreview';
import AdminDashboardPreview from '@/components/previews/AdminDashboardPreview';
import AuthPreview from '@/components/previews/AuthPreview';

export default function DevMode() {
  const [activeTab, setActiveTab] = useState('login');

  // Set dark mode as default for dev mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Dev Mode Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
              <Eye className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-warning">Developer Preview Mode</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <span className="text-xs text-muted-foreground hidden sm:block">
              No data is saved in this mode
            </span>
          </div>
        </div>
      </header>

      {/* Page Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Login Page
            </TabsTrigger>
            <TabsTrigger value="applicant" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Applicant
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Employee
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <AuthPreview />
          </TabsContent>

          <TabsContent value="applicant" className="mt-0">
            <div className="border-b border-border bg-card mb-6">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-heading font-bold text-foreground">HR Portal</h1>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-warning/10 text-warning border-warning/20">
                    <User className="w-4 h-4" />
                    applicant
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">preview@example.com</span>
                  <Button variant="outline" size="sm" disabled>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
            <ApplicantDashboardPreview />
          </TabsContent>

          <TabsContent value="employee" className="mt-0">
            <div className="border-b border-border bg-card mb-6">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-heading font-bold text-foreground">HR Portal</h1>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/20">
                    <Briefcase className="w-4 h-4" />
                    employee
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">employee@example.com</span>
                  <Button variant="outline" size="sm" disabled>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
            <EmployeeDashboardPreview />
          </TabsContent>

          <TabsContent value="admin" className="mt-0">
            <div className="border-b border-border bg-card mb-6">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-heading font-bold text-foreground">HR Portal</h1>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-destructive/10 text-destructive border-destructive/20">
                    <Shield className="w-4 h-4" />
                    admin
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">admin@example.com</span>
                  <Button variant="outline" size="sm" disabled>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
            <AdminDashboardPreview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
