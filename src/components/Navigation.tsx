import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  FileText, 
  ClipboardCheck, 
  LogOut,
  Home
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    {
      title: "Dashboard",
      description: "Lead management and credit bureau reports",
      icon: Home,
      path: "/dashboard",
      color: "bg-blue-500"
    },
    {
      title: "Credit Report",
      description: "Detailed credit score analysis",
      icon: BarChart3,
      path: "/score-report",
      color: "bg-green-500"
    },
    {
      title: "Consent Form",
      description: "Credit check consent and withdrawal",
      icon: ClipboardCheck,
      path: "/consent-form",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" aria-label="Go to dashboard">
              <img src="/nivasa-logo.png" alt="Nivasa Finance" className="h-12 w-auto cursor-pointer" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CRIF CB Integration</h1>
              <p className="text-gray-600">Unified Credit Bureau Management System</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link key={item.path} to={item.path}>
                <Card className={`h-full transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {isActive ? 'Currently viewing' : 'Click to access'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Current Page Indicator */}
        {location.pathname !== "/" && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600">
              Current page: <span className="font-medium">{location.pathname}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation; 