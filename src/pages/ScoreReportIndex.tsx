import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ApplicantInfoSection } from "@/components/ApplicantInfoSection";
import { PersonalInformationSection } from "@/components/PersonalInformationSection";
import { TradelinesSection } from "@/components/TradelinesSection";
import { ScoreSection } from "@/components/ScoreSection";
import { InquirySection } from "@/components/InquirySection";
import { SummarySection } from "@/components/SummarySection";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import { API_CONFIG, buildHeaders } from "@/config/apiConfig";
import { apiFetch } from '@/services/httpClient';

const Index = () => {
  const rememberPersonManagement = () => {
    try {
      const lead = sessionStorage.getItem('selectedLead');
      sessionStorage.setItem('returnTo', JSON.stringify({ view: 'person-management', lead: lead ? JSON.parse(lead) : undefined }));
    } catch {}
  };

  const [activeSection, setActiveSection] = useState("applicant");
  const [report, setReport] = useState<any | null>(null);
  const [headerData, setHeaderData] = useState<any>(null);
  const [standardData, setStandardData] = useState<any>(null);
  const [applicantData, setApplicantData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawn, setWithdrawn] = useState<{ active: boolean; message?: string }>({ active: false });
  const [expired, setExpired] = useState<{ active: boolean; message?: string }>({ active: false });
  const [resultInfo, setResultInfo] = useState<{ type: 'NO_HIT' | 'DATA_MISMATCH' | null; message?: string }>({ type: null });

  useEffect(() => {
    const loadReport = async () => {
      setError(null);
      setWithdrawn({ active: false });
      setExpired({ active: false });
      setResultInfo({ type: null });
      try {
        const params = new URLSearchParams(window.location.search);
        const consentStatus = params.get('consent_status');
        const resultParam = (params.get('result') || '').toUpperCase();
        
        // Handle consent status first
        if (consentStatus === 'EXPIRED') {
          setExpired({ active: true, message: 'Your consent has expired. Please contact us to generate a new consent link to access your credit report.' });
          return;
        }
        
        if (consentStatus === 'WITHDRAWN') {
          setWithdrawn({ active: true, message: 'Consent has been withdrawn and credit data has been deleted.' });
          return;
        }
        if (resultParam === 'NO_HIT' || resultParam === 'DATA_MISMATCH') {
          setResultInfo({
            type: resultParam as 'NO_HIT' | 'DATA_MISMATCH',
            message: resultParam === 'NO_HIT'
              ? 'No credit data found for the customer. Please update details and try again.'
              : 'Provided data matched more than one individual. Please update details and trigger the bureau again.'
          });
          return;
        }
        let enquiryUuid = params.get('enquiry_uuid');

        let parsed: any | null = null;
        if (enquiryUuid) {
          const url = `${API_CONFIG.BASE_URL}/api/v1/credit-bureau/enquiry/${encodeURIComponent(enquiryUuid)}/complete-report?_=${Date.now()}`;
          const res = await apiFetch(url, { headers: buildHeaders('GET', false) });
          if (!res.ok) {
            let msg = '';
            try { const j = await res.json(); msg = (j && (j.message || j.error)) ? (j.message || j.error) : ''; } catch {}
            const combined = `${res.status} ${msg}`.toLowerCase();
            if (res.status === 404 || res.status === 410 || combined.includes('deleted') || combined.includes('not found') || combined.includes('consent')) {
              if (combined.includes('expire') || combined.includes('expired')) {
                setExpired({ active: true, message: 'Your consent has expired. Please contact us to generate a new consent link to access your credit report.' });
              } else {
                setWithdrawn({ active: true, message: 'Consent is withdrawn and credit data has been deleted.' });
              }
              const selectedPerson = sessionStorage.getItem('selectedPersonId');
              if (selectedPerson) {
                try { localStorage.removeItem(`creditReport_${selectedPerson}`); } catch {}
              }
              return;
            }
            throw new Error(msg || 'Failed to load report');
          }
          parsed = await res.json().catch(() => ({}));

          // Detect special statuses even if response_json is null
          const statusUpper = String(parsed?.status || '').toUpperCase();
          if (statusUpper === 'NO_HIT' || statusUpper === 'DATA_MISMATCH') {
            setResultInfo({
              type: statusUpper as 'NO_HIT' | 'DATA_MISMATCH',
              message: statusUpper === 'NO_HIT'
                ? 'No credit data found for the customer. Please update details and try again.'
                : 'Provided data matched more than one individual. Please update details and trigger the bureau again.'
            });
            return;
          }
        } else {
          setError("enquiry_uuid parameter not found in the URL.");
          return;
        }

        const effective = parsed?.response_json || parsed;
        const b2c = effective?.["B2C-REPORT"];
        const reportData = b2c?.["REPORT-DATA"];
        if (!b2c || !reportData) {
          // Check if consent is expired vs withdrawn
          const params = new URLSearchParams(window.location.search);
          const consentStatus = params.get('consent_status');
          if (consentStatus === 'EXPIRED') {
            setExpired({ active: true, message: 'Your consent has expired. Please contact us to generate a new consent link to access your credit report.' });
          } else {
            setWithdrawn({ active: true, message: 'Consent is withdrawn and credit data has been deleted.' });
          }
          const selectedPerson = sessionStorage.getItem('selectedPersonId');
          if (selectedPerson) {
            try { localStorage.removeItem(`creditReport_${selectedPerson}`); } catch {}
          }
          return;
        }

        setReport(effective);
        setStandardData(reportData["STANDARD-DATA"]);
        setApplicantData(effective["B2C-REPORT"]["REQUEST-DATA"]["APPLICANT-SEGMENT"]);
        setHeaderData(effective["B2C-REPORT"]["HEADER-SEGMENT"]);
      } catch (e: any) {
        setError(e?.message || 'Unable to load credit report');
      }
    };
    loadReport();
  }, []);

  const sections = [
    { id: "applicant", title: "Applicant Info" },
    { id: "score", title: "Bureau Score", count: standardData?.SCORE?.length || 0 },
    { id: "personal-info", title: "Personal Information" },
    { id: "summary", title: "Account Summary" },
    { id: "tradelines", title: "Tradelines", count: standardData?.TRADELINES?.length || 0 },
    { id: "inquiries", title: "Credit Inquiries", count: standardData?.["INQUIRY-HISTORY"]?.length || 0 },
  ];

  useEffect(() => {
    const observers = sections.map(section => {
      const element = document.getElementById(section.id);
      if (!element) return null;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveSection(section.id);
      }, { threshold: 0.3, rootMargin: "-100px 0px -100px 0px" });
      observer.observe(element);
      return observer;
    });
    return () => { observers.forEach(o => o?.disconnect()); };
  }, [standardData]);

  if (resultInfo.type) {
    const heading = resultInfo.type === 'NO_HIT' ? 'No Credit Data Found' : 'Data Mismatch Detected';
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4"><img src="/nivasa-logo.png" className="h-10" /></div>
          <div className="bg-card border rounded-lg p-8 shadow">
            <h2 className="text-xl font-semibold mb-2">{heading}</h2>
            <p className="text-sm text-muted-foreground">{resultInfo.message}</p>
            <div className="mt-6">
              <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (expired.active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4"><img src="/nivasa-logo.png" className="h-10" /></div>
          <div className="bg-card border rounded-lg p-8 shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-amber-800">Consent Expired</h2>
            <p className="text-sm text-muted-foreground mb-6">{expired.message}</p>
            <div className="space-y-3">
              <Button variant="outline" onClick={() => window.history.back()} className="w-full">
                Go Back
              </Button>
              <p className="text-xs text-muted-foreground">
                Contact support to generate a new consent link
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (withdrawn.active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4"><img src="/nivasa-logo.png" className="h-10" /></div>
          <div className="bg-card border rounded-lg p-8 shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-800">Consent Withdrawn</h2>
            <p className="text-sm text-muted-foreground mb-6">{withdrawn.message || 'Consent is withdrawn and credit data has been deleted.'}</p>
            <div className="mt-6">
              <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="container mx-auto p-6 pt-10 text-destructive">{error}</div>;
  if (!standardData || !applicantData || !headerData) return null;

  // Sanitize arrays from API (avoid ghost sample values)
  const safeScores = Array.isArray(standardData.SCORE) ? standardData.SCORE : [];
  const safeVariations = Array.isArray(standardData?.DEMOGS?.VARIATIONS) ? standardData.DEMOGS.VARIATIONS : [];
  const safeEmployment = Array.isArray(standardData["EMPLOYMENT-DETAILS"]) ? standardData["EMPLOYMENT-DETAILS"] : [];
  const safeTradelines = Array.isArray(standardData.TRADELINES) ? standardData.TRADELINES : [];
  const safeInquiries = Array.isArray(standardData["INQUIRY-HISTORY"]) ? standardData["INQUIRY-HISTORY"] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="h-8 w-8 rounded-full border hover:bg-accent">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Link to="/dashboard" aria-label="Go to dashboard" onClick={rememberPersonManagement}>
                <img src="/nivasa-logo.png" alt="Nivasa Finance" className="h-8 w-auto cursor-pointer" />
              </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Credit Report Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                {applicantData["FIRST-NAME"]} {applicantData["LAST-NAME"]} • {headerData["REPORT-ID"]}
              </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Generated on</div>
              <div className="font-semibold text-sm">{headerData["DATE-OF-ISSUE"]}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="flex-1 px-6 py-8 md:pr-0">
          <div className="space-y-8 max-w-none">
            <div id="applicant">
              <ApplicantInfoSection applicantData={applicantData} />
            </div>
            <div id="score">
              <ScoreSection scores={safeScores} />
            </div>
            <div id="personal-info">
              <PersonalInformationSection variations={safeVariations} employmentDetails={safeEmployment} />
            </div>
            <div id="summary">
              <SummarySection summary={report["B2C-REPORT"]["REPORT-DATA"]["ACCOUNTS-SUMMARY"]} />
            </div>
            <div id="tradelines">
              <TradelinesSection tradelines={safeTradelines} />
            </div>
            <div id="inquiries">
              <InquirySection inquiries={safeInquiries} />
            </div>
          </div>
        </div>
        <NavigationSidebar sections={sections} activeSection={activeSection} onSectionClick={setActiveSection} />
      </div>
    </div>
  );
};

export default Index;
