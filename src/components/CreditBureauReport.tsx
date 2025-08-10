import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
interface Lead {
  id: string;
  customerName: string;
  customerId: string;
  mobileNumber: string;
  email?: string;
  panNumber?: string;
  dateOfBirth?: string;
}
interface CreditBureauReportProps {
  lead: Lead;
  onBack: () => void;
}

// Mock data for credit report
const mockCreditData = {
  comprehensive: {
    summary: {
      overall_rating: "Excellent",
      credit_score: 750,
      total_accounts: 8,
      active_accounts: 5,
      total_enquiries: 3,
      credit_utilization: 25
    },
    account_wise_analysis: [{
      account_type: "Credit Card",
      bank_name: "HDFC Bank",
      account_status: "Active",
      credit_limit: 500000,
      current_balance: 125000,
      payment_history: "Good"
    }, {
      account_type: "Personal Loan",
      bank_name: "ICICI Bank",
      account_status: "Closed",
      loan_amount: 200000,
      outstanding: 0,
      payment_history: "Excellent"
    }],
    recommendations: ["Maintain low credit utilization ratio", "Continue timely payments", "Consider increasing credit limit"]
  },
  timelyPayments: {
    payment_score: 85,
    on_time_percentage: 92,
    late_payments_count: 2,
    payment_trend: "improving"
  },
  creditUtilization: {
    overall_utilization: 25,
    account_utilization: [{
      account: "HDFC Credit Card",
      utilization: 25,
      limit: 500000
    }, {
      account: "SBI Credit Card",
      utilization: 15,
      limit: 300000
    }]
  },
  creditAge: {
    oldest_account: {
      years: 5,
      months: 3
    },
    average_age: {
      years: 3,
      months: 2
    },
    credit_history_timeline: [{
      year: "2019",
      event: "First credit card opened"
    }, {
      year: "2021",
      event: "Personal loan taken"
    }, {
      year: "2023",
      event: "Additional credit card opened"
    }]
  },
  accountMix: {
    credit_cards: 3,
    loans: 2,
    secured_accounts: 1,
    unsecured_accounts: 4,
    diversity_score: "Good"
  },
  enquiryHistory: {
    recent_enquiries: [{
      date: "2024-12-15",
      type: "Credit Card",
      bank: "HDFC Bank"
    }, {
      date: "2024-11-20",
      type: "Personal Loan",
      bank: "ICICI Bank"
    }, {
      date: "2024-10-05",
      type: "Auto Loan",
      bank: "SBI"
    }],
    enquiry_impact: "Low"
  }
};
const CreditBureauReport: React.FC<CreditBureauReportProps> = ({
  lead,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const getCreditScoreColor = (score: number) => {
    if (score >= 720) return '#16a34a';
    if (score >= 690) return '#eab308';
    if (score >= 630) return '#ea580c';
    return '#dc2626';
  };
  const getScoreLabel = (score: number) => {
    if (score >= 720) return 'Excellent';
    if (score >= 690) return 'Good';
    if (score >= 630) return 'Fair';
    return 'Bad';
  };
  const refreshReport = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };
  const downloadReport = () => {
    // Simulate report download
    console.log('Downloading credit report for:', lead.customerId);
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          
          <button type="button" aria-label="Go to dashboard" onClick={onBack} className="p-0 bg-transparent border-none">
            <img src="/nivasa-logo.png" alt="Nivasa Finance" className="h-10 w-auto cursor-pointer" />
          </button>
          <div>
            
            <p className="text-muted-foreground">
              Customer ID: {lead.customerId} • Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          
          <Button onClick={downloadReport} className="bg-primary-blue hover:bg-primary-blue/90">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Customer Info Header */}
      <Card className="bg-gradient-to-r from-primary-blue/10 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <p className="font-semibold">{lead.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PAN Number</p>
              <p className="font-semibold font-mono">{lead.panNumber || 'ABCDE1234F'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="font-semibold">{lead.mobileNumber}</p>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Credit Score Overview - Professional Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-lg font-semibold text-gray-800">Credit Score</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-6 pt-2">
            <div className="relative">
              <svg width="340" height="200" viewBox="0 0 340 200" className="drop-shadow-lg">
                <defs>
                  {/* Smooth gradient for gauge */}
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="30%" stopColor="#ea580c" />
                    <stop offset="65%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                  
                  {/* Professional drop shadow filter */}
                  <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="rgba(0,0,0,0.25)" />
                  </filter>
                  
                  {/* Subtle inner shadow for depth */}
                  <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.1)" />
                  </filter>
                </defs>
                
                {/* Background track with subtle shadow */}
                <path d="M 50 170 A 120 120 0 0 1 290 170" fill="none" stroke="#f1f5f9" strokeWidth="40" strokeLinecap="round" opacity="0.4" filter="url(#innerShadow)" />
                
                {/* Main gauge arc with smooth gradient */}
                <path d="M 50 170 A 120 120 0 0 1 290 170" fill="none" stroke="url(#scoreGradient)" strokeWidth="35" strokeLinecap="round" filter="url(#dropshadow)" />
                
                {/* Center circle with score - enhanced with professional shadows */}
                <circle cx="170" cy="170" r="70" fill={getCreditScoreColor(mockCreditData.comprehensive.summary.credit_score)} stroke="white" strokeWidth="8" filter="url(#dropshadow)" />
                
                {/* Inner circle for depth */}
                <circle cx="170" cy="170" r="65" fill={getCreditScoreColor(mockCreditData.comprehensive.summary.credit_score)} opacity="0.9" filter="url(#innerShadow)" />
                
                {/* Score text - larger and bolder */}
                <text x="170" y="160" textAnchor="middle" className="fill-white text-5xl font-black tracking-tight">
                  {mockCreditData.comprehensive.summary.credit_score}
                </text>
                
                {/* Score label - refined typography */}
                <text x="170" y="185" textAnchor="middle" className="fill-white text-lg font-semibold">
                  {getScoreLabel(mockCreditData.comprehensive.summary.credit_score)}
                </text>
                
                {/* Longer score pointer/needle with professional styling */}
                <g transform={`rotate(${-90 + (mockCreditData.comprehensive.summary.credit_score - 300) / 550 * 180} 170 170)`}>
                  <line x1="170" y1="170" x2="170" y2="65" stroke="white" strokeWidth="6" strokeLinecap="round" filter="url(#dropshadow)" />
                  <line x1="170" y1="170" x2="170" y2="65" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="170" cy="170" r="10" fill="white" filter="url(#dropshadow)" />
                  <circle cx="170" cy="170" r="7" fill="#1f2937" />
                </g>
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Credit Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-blue">
              {mockCreditData.comprehensive.summary.credit_utilization}%
            </div>
            <Progress value={mockCreditData.comprehensive.summary.credit_utilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Overall utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mockCreditData.comprehensive.summary.total_accounts}
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-4 w-4 text-success mr-1" />
              <span className="text-xs text-muted-foreground">
                {mockCreditData.comprehensive.summary.active_accounts} active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {mockCreditData.comprehensive.summary.total_enquiries}
            </div>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-4 w-4 text-warning mr-1" />
              <span className="text-xs text-muted-foreground">Last 6 months</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Credit Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="comprehensive">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="utilization">Utilization</TabsTrigger>
              <TabsTrigger value="age">Credit Age</TabsTrigger>
              <TabsTrigger value="mix">Account Mix</TabsTrigger>
              <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
            </TabsList>

            <TabsContent value="comprehensive" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account Type</TableHead>
                          <TableHead>Bank</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockCreditData.comprehensive.account_wise_analysis.map((account, index) => <TableRow key={index}>
                            <TableCell className="font-medium">{account.account_type}</TableCell>
                            <TableCell>{account.bank_name}</TableCell>
                            <TableCell>
                              <Badge variant={account.account_status === 'Active' ? 'default' : 'secondary'}>
                                {account.account_status}
                              </Badge>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mockCreditData.comprehensive.recommendations.map((rec, index) => <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>)}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payment Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-success">
                      {mockCreditData.timelyPayments.payment_score}
                    </div>
                    <Progress value={mockCreditData.timelyPayments.payment_score} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">On-Time Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-blue">
                      {mockCreditData.timelyPayments.on_time_percentage}%
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-success mr-1" />
                      <span className="text-xs text-success">Improving</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Late Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-warning">
                      {mockCreditData.timelyPayments.late_payments_count}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">In last 12 months</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="utilization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Credit Utilization by Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCreditData.creditUtilization.account_utilization.map((account, index) => <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{account.account}</span>
                          <span>{account.utilization}%</span>
                        </div>
                        <Progress value={account.utilization} />
                        <p className="text-xs text-muted-foreground">
                          Limit: ₹{account.limit.toLocaleString()}
                        </p>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="age" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credit Age Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Oldest Account</p>
                      <p className="text-2xl font-bold text-primary-blue">
                        {mockCreditData.creditAge.oldest_account.years}y {mockCreditData.creditAge.oldest_account.months}m
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Age</p>
                      <p className="text-2xl font-bold text-success">
                        {mockCreditData.creditAge.average_age.years}y {mockCreditData.creditAge.average_age.months}m
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credit Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockCreditData.creditAge.credit_history_timeline.map((item, index) => <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary-blue rounded-full flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-sm">{item.year}</p>
                            <p className="text-xs text-muted-foreground">{item.event}</p>
                          </div>
                        </div>)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="mix" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Credit Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-blue">
                      {mockCreditData.accountMix.credit_cards}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Loans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-success">
                      {mockCreditData.accountMix.loans}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Secured</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-warning">
                      {mockCreditData.accountMix.secured_accounts}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Unsecured</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-info">
                      {mockCreditData.accountMix.unsecured_accounts}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Account Mix Diversity</p>
                    <p className="text-xl font-bold text-success">{mockCreditData.accountMix.diversity_score}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enquiries" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Recent Credit Enquiries
                    <Badge variant="outline">
                      Impact: {mockCreditData.enquiryHistory.enquiry_impact}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Bank/Institution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCreditData.enquiryHistory.recent_enquiries.map((enquiry, index) => <TableRow key={index}>
                          <TableCell>{new Date(enquiry.date).toLocaleDateString()}</TableCell>
                          <TableCell>{enquiry.type}</TableCell>
                          <TableCell>{enquiry.bank}</TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};
export default CreditBureauReport;