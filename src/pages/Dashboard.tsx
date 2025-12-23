import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import ApplicantDashboard from '@/components/ApplicantDashboard';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import AdminDashboard from '@/components/AdminDashboard';

export default function Dashboard() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {role === 'applicant' && <ApplicantDashboard />}
      {role === 'employee' && <EmployeeDashboard />}
      {role === 'admin' && <AdminDashboard />}
      {!role && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No role assigned. Please contact an administrator.</p>
        </div>
      )}
    </Layout>
  );
}
