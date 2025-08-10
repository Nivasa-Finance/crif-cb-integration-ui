import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, BarChart3, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LeadDashboard from '@/components/LeadDashboard';
import LeadDetails from '@/components/LeadDetails';
import CreditBureauReport from '@/components/CreditBureauReport';
import PersonManagement from '@/components/PersonManagement';

type ViewMode = 'dashboard' | 'lead-details' | 'new-inquiry' | 'credit-report' | 'person-management';

interface Lead {
  id: string;
  customerName: string;
  customerId: string;
  mobileNumber: string;
  createdDate: string;
  reportGenerated?: boolean;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  panNumber?: string;
  dateOfBirth?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  loanAmount: string;
  productType: 'Home Loan' | 'LAP' | 'Balance Transfer';
  freshsalesId?: string;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    const view = (searchParams.get('view') as ViewMode) || undefined;
    const leadId = searchParams.get('leadId') || undefined;
    if (view) {
      setCurrentView(view);
      if (leadId) {
        // restore selected lead from session
        try {
          const storedLead = sessionStorage.getItem('selectedLead');
          if (storedLead) setSelectedLead(JSON.parse(storedLead));
        } catch {}
      }
      return;
    }
    // Fallback: restore last view/lead when coming back from external route
    const stored = sessionStorage.getItem('returnTo');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { view?: ViewMode; lead?: Partial<Lead> };
        if (parsed.view) setCurrentView(parsed.view);
        if (parsed.lead) setSelectedLead(parsed.lead as Lead);
      } catch {}
      sessionStorage.removeItem('returnTo');
    } else {
      setCurrentView('dashboard');
      setSelectedLead(null);
    }
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    try { sessionStorage.setItem('selectedLead', JSON.stringify(lead)); } catch {}
    setSearchParams({ view: 'person-management', leadId: lead.id });
  };

  const handleNewInquiry = () => {
    setSelectedLead(null);
    setSearchParams({ view: 'new-inquiry' });
  };

  const handleViewReport = (lead: Lead) => {
    setSelectedLead(lead);
    setSearchParams({ view: 'credit-report' });
  };

  const handleBackToDashboard = () => {
    setSelectedLead(null);
    setSearchParams({});
  };

  const handleSaveLead = (leadData: any) => {
    console.log('Saving lead data:', leadData);
    handleBackToDashboard();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation and logout */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                  <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {currentView !== 'dashboard' && (
              <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="h-8 w-8 rounded-full border hover:bg-accent">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Link to="/dashboard" aria-label="Go to dashboard" onClick={handleBackToDashboard}>
              <img src="/nivasa-logo.png" alt="Nivasa Finance" className="h-8 w-auto cursor-pointer" />
            </Link>
            <h1 className="text-xl font-semibold">
              {currentView === 'dashboard' ? 'Dashboard' : currentView === 'person-management' ? 'Person Management' : currentView === 'new-inquiry' ? 'New Inquiry' : currentView === 'credit-report' ? 'Credit Report' : 'Dashboard'}
            </h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 pt-20 sm:pt-8">
        {currentView === 'dashboard' && (
          <LeadDashboard
            onViewLead={handleViewLead}
            onNewInquiry={handleNewInquiry}
            onViewReport={handleViewReport}
          />
        )}

        {currentView === 'lead-details' && selectedLead && (
          <LeadDetails
            lead={selectedLead}
            onBack={handleBackToDashboard}
            onSave={handleSaveLead}
            isNewLead={false}
          />
        )}

        {currentView === 'new-inquiry' && (
          <LeadDetails
            onBack={handleBackToDashboard}
            onSave={handleSaveLead}
            isNewLead={true}
          />
        )}

        {currentView === 'credit-report' && selectedLead && (
          <CreditBureauReport
            lead={selectedLead}
            onBack={handleBackToDashboard}
          />
        )}

        {currentView === 'person-management' && selectedLead && (
          <PersonManagement
            lead={selectedLead}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
