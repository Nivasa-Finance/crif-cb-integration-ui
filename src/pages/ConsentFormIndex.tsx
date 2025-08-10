import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import CreditCheckForm from '@/components/CreditCheckForm';
import { API_CONFIG, buildHeaders } from '@/config/apiConfig';
import { apiFetch } from '@/services/httpClient';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConsentFormIndex: React.FC = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const personId = params.personId as string | undefined;
  const token = searchParams.get('consent_token') || searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [person, setPerson] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string>('');
  const [view, setView] = useState<'form' | 'success' | 'expired' | 'error'>('form');

  useEffect(() => {
    const fetchPerson = async () => {
      if (!personId) return;
      try {
        setLoading(true);
        setError(null);
        const url = `${API_CONFIG.BASE_URL}/api/v1/persons/${encodeURIComponent(personId)}?decrypt_pii=false`;
        const res = await apiFetch(url, { headers: buildHeaders('GET', false, undefined, true) }, { skipAuth: true });
        if (!res.ok) throw new Error('Failed to load person');
        const data = await res.json();
        setPerson(data.person || data);
        setView('form');
      } catch (e: any) {
        setError(e.message || 'Error loading person');
        setView('error');
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
  }, [personId]);

  const expiredCopy = 'Consent link has expired , Please contact us to generate new link';

  const handleSubmit = async () => {
    if (!personId || !token) {
      setSubmitMsg(expiredCopy);
      setView('expired');
      return;
    }
    try {
      setSubmitting(true);
      const res = await apiFetch(`${API_CONFIG.BASE_URL}/api/v1/consent/submit/${encodeURIComponent(personId)}?consent_token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: buildHeaders('POST', true, undefined, true),
        body: JSON.stringify({ consent_given: true }),
      }, { skipAuth: true });
      const data = await res.json().catch(() => ({}));
      const msg = (data?.message || '').toString();
      if (res.ok) {
        setSubmitMsg(msg || 'Consent submitted successfully.');
        setView('success');
      } else {
        // Show customer-friendly expired message for any failure (incl. 500)
        setSubmitMsg(expiredCopy);
        setView('expired');
      }
    } catch (e: any) {
      setSubmitMsg(expiredCopy);
      setView('expired');
    } finally {
      setSubmitting(false);
    }
  };

  if (!personId) return null;

  if (loading) return <div className="container mx-auto p-4 pt-8">Loading…</div>;
  if (view === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4"><img src="/nivasa-logo.png" className="h-10" /></div>
          <div className="bg-card border rounded-lg p-8 shadow">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <h2 className="text-xl font-semibold mb-2">Consent Submitted</h2>
            <p className="text-sm text-muted-foreground">{submitMsg || 'Thank you. Your consent has been recorded.'}</p>
          </div>
        </div>
      </div>
    );
  }
  if (view === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4"><img src="/nivasa-logo.png" className="h-10" /></div>
          <div className="bg-card border rounded-lg p-8 shadow">
            <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <h2 className="text-xl font-semibold mb-2">Unable to submit consent</h2>
            <p className="text-sm text-muted-foreground">{expiredCopy}</p>
          </div>
        </div>
      </div>
    );
  }
  if (view === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4"><img src="/nivasa-logo.png" className="h-10" /></div>
          <div className="bg-card border rounded-lg p-8 shadow">
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
            <h2 className="text-xl font-semibold mb-2 text-destructive">Unable to submit consent</h2>
            <p className="text-sm text-muted-foreground mb-4">{submitMsg || error || 'Something went wrong. Please try again.'}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!person) return null;

  // Format fields for display
  const fullName = `${person.first_name || ''} ${person.middle_name || ''} ${person.last_name || ''}`.replace(/\s+/g, ' ').trim();
  const mobileNumber = person.primary_number || '';
  const pan = person.pan_card_number || '';
  const dob = (person.date_of_birth || '').split('-').reverse().join('/');
  const address = person.address_line1 || '';
  const dateOfConsent = new Date().toLocaleDateString('en-IN');

  return (
    <>
      <CreditCheckForm
        fullName={fullName}
        mobileNumber={mobileNumber}
        pan={pan}
        dob={dob}
        address={address}
        dateOfConsent={dateOfConsent}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
      {submitMsg && view === 'form' && (
        <div className="container mx-auto max-w-3xl px-4 -mt-6 pb-6 text-sm text-muted-foreground">{submitMsg}</div>
      )}
    </>
  );
};

export default ConsentFormIndex;
