import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, CheckCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Employee Dashboard</h2>
        <p className="text-muted-foreground">Welcome to the HR Portal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Employment Status
          </CardTitle>
          <CardDescription>Your current employment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
            <CheckCircle className="w-6 h-6 text-success" />
            <div>
              <p className="font-medium text-foreground">Active Employee</p>
              <p className="text-sm text-muted-foreground">
                Your employment is confirmed and active.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Additional employee features coming soon. Contact HR for any inquiries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
