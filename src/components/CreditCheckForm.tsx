import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

interface CreditCheckFormProps {
  fullName: string;
  mobileNumber: string;
  pan: string;
  dob: string;           // display format e.g., DD/MM/YYYY
  address: string;
  dateOfConsent: string; // display format
  onSubmit: () => Promise<void> | void;
  isSubmitting?: boolean;
}

const CreditCheckForm: React.FC<CreditCheckFormProps> = ({
  fullName,
  mobileNumber,
  pan,
  dob,
  address,
  dateOfConsent,
  onSubmit,
  isSubmitting = false,
}) => {
  const { toast } = useToast();
  const [consentAccepted, setConsentAccepted] = useState(false);

  const consentContent = `In connection with submission of the application for my credit information ("Consumer Credit Information") offered by CRIF High Mark Credit Information Services Pvt. Ltd. ("CIC") through Oka Housing Technologies Private Limited (operating as Nivasa Finance) (referred to as the "Company") and delivery of the Consumer Credit Information to the Company, I hereby acknowledge and agree to the following:

A. The Company is my lawfully appointed agent, and it has agreed to be my agent to obtain my Credit Information Report and Credit Score from CRIF High Mark Credit Information Services Pvt. Ltd (CRIF High Mark) for the purpose of assessing my creditworthiness for a housing loan and not for any other purposes.

B. This consent shall be valid for a maximum period of 6 months or till such time the credit information is required to be retained to satisfy the purpose for which it was intended, or I withdraw my consent at any time, by informing the same to the Company, at their registered office address, website, assigned email id or mobile application, whichever is earlier.

C. I further authorize the Company to share with CICs, my personal information/details to procure my Credit Information on a monthly frequency and use the same to provide me with the said service ("Purpose").

D. I confirm that this consent is given by my free will and not due to any solicitation by any person/entity.

E. I hereby expressly grant unconditional consent to, and direct, CIC to deliver and / or transfer my Consumer Credit Information to the Company on my behalf.

F. I shall not hold CIC responsible or liable for any loss, claim, liability, or damage of any kind resulting from, arising out of, or in any way related to: (a) delivery of my Consumer Credit Information to the Company; (b) any use, modification or disclosure by the Company of the contents, in whole or in part, of my Consumer Credit Information, wherever authorized by me; (c) any breach of confidentiality or privacy in relation to delivery of my Consumer Credit Information to the Company;

G. I acknowledge and accept that: (a) CIC has not made any promises or representations to me in order to induce me to provide my Consumer Credit Information or seek any consent or authorization in this regard; and (b) the implementation of the Agreement between CIC and the Company is solely the responsibility of the Company.

H. I agree that I may be required to record my consent / provide instructions electronically or physically as the case may be, and in all such cases I understand that by clicking on the "I Accept" button below or signing this Consent physically, I am providing "written instructions" to the Company authorizing Company to obtain my Consumer Credit Information from my personal credit profile from CRIF High Mark. I further authorize the Company to obtain such information solely to confirm my identity and display my Consumer Credit Information to me. Further in all such cases by checking this box and clicking on the Authorize button or signing this Consent physically, I agree to the terms and conditions, acknowledge receipt of CIC privacy policy and agree to its terms, and confirm my authorization for Company to obtain my Consumer Credit Information.

I. I understand that in order to deliver the product to me, I hereby authorize the Company to obtain my Consumer Credit Information from CIC.

J. By submitting this registration form, I understand that I am providing express written instructions for the Company to request and receive a copy of my consumer credit report and score from CIC.

K. I understand that the product is provided on an "as-is", "as available" basis and CIC expressly disclaims all warranties, including the warranties of merchantability, fitness for a particular purpose, and non-infringement.

L. I shall not sue or otherwise make or present any demand or claim, and I irrevocably, unconditionally and entirely release, waive and forever discharge CIC, its officers, directors, employees, agents, licensees, affiliates, successors and assigns, jointly and individually (hereinafter "Releasee"), from any and all manner of liabilities, claims, demands, losses, claims, suits, costs and expenses (including court costs and reasonable attorney fees) ("Losses"), whatsoever, in law or equity, whether known or unknown, which I ever had, now have, or in the future may have against the Releasee with respect to the submission of my Consumer Credit Information and / or my decision to provide CIC with the authority to deliver my Consumer Credit Information to the Company. I agree to defend, indemnify, and hold harmless the Releasee from and against any and all losses resulting from claims made against CIC by third parties arising from and in connection with this letter.

M. I agree that the terms of this confirmation letter shall be governed by the laws of India and shall be subject to the exclusive jurisdiction of the courts located in Mumbai in regard to any dispute arising hereof.`;

  const handleSubmit = async () => {
    if (!consentAccepted) {
      toast({
        title: 'Consent Required',
        description: 'Please accept the consent to proceed.',
        variant: 'destructive',
      });
      return;
    }
    await onSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      {/* Header */}
      <div className="text-center py-6 px-4">
        <div className="flex justify-center mb-4">
          <img src="/nivasa-logo.png" alt="Nivasa Finance Logo" className="h-12 w-auto" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Customer Consent for Credit Report Access</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-32">
        <div className="container mx-auto max-w-3xl">
          <Card className="shadow-lg border-0 animate-fade-in" style={{ boxShadow: 'var(--shadow-form)' }}>
            {/* Customer Details Section */}
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">Full Name:</span>
                  <p className="font-medium text-foreground">{fullName}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Mobile Number:</span>
                  <p className="font-medium text-foreground">{mobileNumber}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">PAN:</span>
                  <p className="font-medium text-foreground">{pan}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Date of Birth:</span>
                  <p className="font-medium text-foreground">{dob}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-muted-foreground">Address:</span>
                  <p className="font-medium text-foreground">{address}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Date of Consent:</span>
                  <p className="font-medium text-foreground">{dateOfConsent}</p>
                </div>
              </div>
            </CardContent>

            {/* Consent Content */}
            <CardContent className="px-6 pb-6">
              <ScrollArea className="h-[50vh] pr-4">
                <div className="text-sm leading-relaxed bg-muted/20 p-4 rounded-lg border">
                  <div className="font-bold text-base mb-4">CRIF High Mark - Credit Score Terms of Use</div>
                  <div className="whitespace-pre-wrap">{consentContent}</div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start space-x-3">
              <Checkbox id="consent" checked={consentAccepted} onCheckedChange={checked => setConsentAccepted(Boolean(checked))} className="mt-1" />
              <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">By clicking/proceeding 'Show me my Credit Score' / 'I agree/accept' / you voluntarily agree to provide your personal details, and you authorize 'Oka Housing Technologies Private Limited (operating as Nivasa Finance)' (name of agent company) to obtain your credit profile/score from CRIF Highmark. You also agree to the following <a href="https://www.nivasafinance.com/crif-terms-of-use" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Terms & Conditions</a>.</label>
            </div>

            <Button onClick={handleSubmit} className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${consentAccepted ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`} disabled={!consentAccepted || isSubmitting}>
              <CheckCircle className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCheckForm;