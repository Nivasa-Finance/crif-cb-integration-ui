import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useParams } from 'react-router-dom';
import { API_CONFIG, buildHeaders } from '@/config/apiConfig';
import { apiFetch } from '@/services/httpClient';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const WithdrawalForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<'form' | 'success' | 'expired' | 'error'>('form');
  const [message, setMessage] = useState<string>('');
  const { toast } = useToast();
  const { personId } = useParams();

  const expiredCopy = 'Your withdrawal has already been processed. we no longer have your Credit Information';

  const handleWithdraw = async () => {
    if (!personId) return;
    try {
      setIsSubmitting(true);
      const res = await apiFetch(`${API_CONFIG.BASE_URL}/api/v1/consent/withdraw/${encodeURIComponent(personId)}`, {
        method: 'DELETE',
        headers: buildHeaders('DELETE', true, undefined, true),
      }, { skipAuth: true });
      const data = await res.json().catch(() => ({}));
      const msg = data?.message || '';
      if (res.ok) {
        setMessage(msg || 'Your consent has been successfully withdrawn.');
        setView('success');
      } else {
        setMessage(expiredCopy);
        setView('expired');
      }
    } catch (err: any) {
      setMessage(expiredCopy);
      setView('expired');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
          <div className="flex justify-center mb-6">
            <img src="/nivasa-logo.png" alt="Nivasa Finance Logo" className="h-16 w-auto object-contain" />
          </div>
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground mb-2">Consent Withdrawn</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (view === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
          <div className="flex justify-center mb-6">
            <img src="/nivasa-logo.png" alt="Nivasa Finance Logo" className="h-16 w-auto object-contain" />
          </div>
          <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground mb-2">Unable to withdraw consent</h1>
          <p className="text-sm text-muted-foreground">{message || expiredCopy}</p>
        </div>
      </div>
    );
  }

  if (view === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
          <div className="flex justify-center mb-6">
            <img src="/nivasa-logo.png" alt="Nivasa Finance Logo" className="h-16 w-auto object-contain" />
          </div>
          <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground mb-2">Unable to withdraw consent</h1>
          <p className="text-sm text-muted-foreground mb-4">{message || 'Please try again.'}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/nivasa-logo.png" alt="Nivasa Finance Logo" className="h-16 w-auto object-contain" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Withdraw Consent</h1>
          <p className="text-muted-foreground text-sm">Credit Score Consent Withdrawal</p>
        </div>

        {/* Details */}
        <div className="mb-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              By withdrawing your consent, you are revoking the authorization previously given to 
              Oka Housing Technologies Private Limited (operating as Nivasa Finance) to access 
              your credit profile/score from CRIF Highmark.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button onClick={handleWithdraw} disabled={isSubmitting || !personId} className="w-full py-3 text-lg font-semibold">
          {isSubmitting ? "Processing..." : "Withdraw Consent"}
        </Button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            For any queries, please contact our support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalForm;