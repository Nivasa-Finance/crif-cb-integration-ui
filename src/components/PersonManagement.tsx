import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { ArrowLeft, User, Phone, MapPin, CreditCard, MessageCircle, FileText, Eye, Edit, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG, buildHeaders } from '@/config/apiConfig';

// Map API consent_status to UI enum
const mapConsentStatus = (raw: any): Person['consentStatus'] => {
  const val = typeof raw === 'string' ? raw.toUpperCase() : String(raw).toUpperCase();
  if (val.includes('RECEIVED') || val === 'TRUE') return 'CONSENT_RECEIVED';
  if (val.includes('WITHDRAW')) return 'CONSENT_WITHDRAWN';
  if (val.includes('EXPIRE')) return 'CONSENT_EXPIRED';
  if (val.includes('PENDING')) return 'CONSENT_PENDING';
  if (val.includes('NOT_SENT') || val.includes('NO_CONSENT') || val === 'FALSE') return 'CONSENT_NOT_SENT';
  return 'CONSENT_NOT_SENT';
};

// Smoothly update one person's consent status in state and clear caches if needed
const applyConsentStatusToPerson = (personId: string, newStatus: Person['consentStatus'], setPersonsFn: React.Dispatch<React.SetStateAction<Person[]>>) => {
  setPersonsFn(prev => prev.map(p => {
    if (p.id !== personId) return p;
    const updated: Person = { ...p, consentStatus: newStatus } as Person;
    if (newStatus === 'CONSENT_WITHDRAWN') {
      updated.creditBureauStatus = undefined;
      updated.enquiryUuid = undefined;
      try {
        localStorage.removeItem(`creditReport_${personId}`);
        localStorage.removeItem(`creditBureau_${personId}`);
      } catch {}
    }
    if (newStatus === 'CONSENT_RECEIVED') {
      // Preserve any persisted credit bureau status; only clear if nothing is persisted
      let hasSavedReport = false;
      let persistedStatus: string | undefined;
      try {
        hasSavedReport = Boolean(localStorage.getItem(`creditReport_${personId}`));
        const persisted = localStorage.getItem(`creditBureau_${personId}`);
        if (persisted) persistedStatus = (JSON.parse(persisted) || {}).status;
      } catch {}
      if (persistedStatus) {
        updated.creditBureauStatus = persistedStatus as Person['creditBureauStatus'];
      } else if (!hasSavedReport) {
        updated.creditBureauStatus = undefined;
        // keep enquiryUuid as-is; it will be set on next trigger
      }
    }
    return updated;
  }));
};

interface Lead {
  id: string;
  customerName: string;
  customerId: string;
  mobileNumber: string;
  createdDate: string;
  loanAmount: string;
  productType: 'Home Loan' | 'LAP' | 'Balance Transfer';
  freshsalesId?: string;
}

interface Person {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  primaryNumber: string;
  whatsappNumber?: string;
  alternateNumber?: string;
  addressLine1: string;
  district: string;
  state: string;
  pincode: string;
  panNumber: string;
  consentStatus: 'CONSENT_NOT_SENT' | 'CONSENT_PENDING' | 'CONSENT_RECEIVED' | 'CONSENT_WITHDRAWN' | 'CONSENT_EXPIRED';
  creditBureauStatus?: 'Success' | 'Failed' | 'Processing';
  leadId: string;
  enquiryUuid?: string;
}

interface PersonManagementProps {
  lead: Lead;
  onBack: () => void;
}

// Helper to extract meaningful error messages from API responses
const parseApiErrorMessage = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    const candidates: Array<string | undefined> = [];
    if (typeof data === 'string') candidates.push(data);
    if (data?.message) candidates.push(String(data.message));
    if (data?.error) candidates.push(String(data.error));
    if (data?.detail) candidates.push(String(data.detail));
    if (Array.isArray(data?.errors)) {
      const list = data.errors
        .map((e: any) => e?.msg || e?.message || e?.detail || (typeof e === 'string' ? e : undefined))
        .filter(Boolean)
        .join(', ');
      if (list) candidates.push(list);
    }
    const joined = candidates.filter(Boolean).join(' - ');
    return joined || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
};

const PersonManagement = ({ lead, onBack }: PersonManagementProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoadingPersons, setIsLoadingPersons] = useState(false);
  const [personsError, setPersonsError] = useState<string | null>(null);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isSavingRemote, setIsSavingRemote] = useState(false);
  const [checkingConsentId, setCheckingConsentId] = useState<string | null>(null);
  const [sendingConsentId, setSendingConsentId] = useState<string | null>(null);
  const [triggeringBureauId, setTriggeringBureauId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    day: '',
    month: '',
    year: '',
    primaryNumber: '',
    whatsappNumber: '',
    alternateNumber: '',
    addressLine1: '',
    district: '',
    state: '',
    pincode: '',
    panNumber: ''
  });

  // API-based pincode lookup service
  const fetchLocationByPincode = async (pincode: string): Promise<{ district: string; state: string } | null> => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const firstPostOffice = data[0].PostOffice[0];
        return {
          district: firstPostOffice.District,
          state: firstPostOffice.State
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching pincode data:', error);
      return null;
    }
  };

  const validatePAN = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateIndianMobile = (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  // Real-time validation states
  const getInputValidationState = (field: string, value: string) => {
    if (!value) return '';
    
    switch (field) {
      case 'primaryNumber':
      case 'whatsappNumber':
      case 'alternateNumber':
        return validateIndianMobile(value) ? 'valid' : 'invalid';
      case 'panNumber':
        return validatePAN(value) ? 'valid' : 'invalid';
      case 'pincode':
        return /^\d{6}$/.test(value) ? 'valid' : 'invalid';
      case 'firstName':
      case 'lastName':
      case 'addressLine1':
        return value.trim().length >= 2 ? 'valid' : 'invalid';
      default:
        return '';
    }
  };

  const getInputClassName = (field: string, value: string) => {
    const state = getInputValidationState(field, value);
    if (state === 'valid') return 'input-valid';
    if (state === 'invalid') return 'input-invalid';
    return '';
  };

  const handleInputChange = async (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-populate WhatsApp number same as primary number
      if (field === 'primaryNumber' && validateIndianMobile(value)) {
        updated.whatsappNumber = value;
      }
      
      return updated;
    });

    // Handle pincode lookup separately for async operation
    if (field === 'pincode' && /^\d{6}$/.test(value)) {
      try {
        const location = await fetchLocationByPincode(value);
        if (location) {
          setFormData(prev => ({
            ...prev,
            district: location.district,
            state: location.state
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            district: 'Not found',
            state: 'Not found'
          }));
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        setFormData(prev => ({
          ...prev,
          district: 'Error fetching data',
          state: 'Error fetching data'
        }));
      }
    } else if (field === 'pincode' && value.length < 6) {
      // Clear district and state if pincode is incomplete
      setFormData(prev => ({
        ...prev,
        district: '',
        state: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      day: '',
      month: '',
      year: '',
      primaryNumber: '',
      whatsappNumber: '',
      alternateNumber: '',
      addressLine1: '',
      district: '',
      state: '',
      pincode: '',
      panNumber: ''
    });
    setIsAddingPerson(false);
    setEditingPerson(null);
  };

  const normalizeDobParts = (yearStr: string, monthStr: string, dayStr: string) => {
    const normMonth = monthStr ? String(Number(monthStr)) : '';
    const normDay = dayStr ? String(Number(dayStr)) : '';
    return { year: yearStr || '', month: normMonth, day: normDay };
  };

  const loadPersonForEdit = async (person: Person) => {
    try {
      // Fetch latest person details from backend and fill the form
      const url = `${API_CONFIG.BASE_URL}/api/v1/persons/${encodeURIComponent(person.id)}?decrypt_pii=false`;
      const res = await fetch(url, { headers: buildHeaders('GET', false) });
      if (!res.ok) throw new Error('Failed to fetch person details');
      const data = await res.json();
      const p = data.person || {};
      const [y = '', m = '', d = ''] = String(p.date_of_birth || '').split('-');
      const norm = normalizeDobParts(y, m, d);
    setFormData({
        firstName: p.first_name ?? person.firstName ?? '',
        middleName: p.middle_name ?? person.middleName ?? '',
        lastName: p.last_name ?? person.lastName ?? '',
        day: norm.day || person.dateOfBirth.day || '',
        month: norm.month || person.dateOfBirth.month || '',
        year: norm.year || person.dateOfBirth.year || '',
        primaryNumber: p.primary_number ?? person.primaryNumber ?? '',
        whatsappNumber: p.whatsapp_number ?? person.whatsappNumber ?? '',
        alternateNumber: p.alternate_number ?? person.alternateNumber ?? '',
        addressLine1: p.address_line1 ?? person.addressLine1 ?? '',
        district: p.district ?? person.district ?? '',
        state: p.state ?? person.state ?? '',
        pincode: p.pincode ?? person.pincode ?? '',
        panNumber: p.pan_card_number ?? person.panNumber ?? ''
    });
    setEditingPerson(person);
    setIsAddingPerson(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load person', variant: 'destructive' });
    }
  };

  const handleSavePerson = async () => {
    if (!formData.firstName || !formData.lastName || !formData.primaryNumber || !formData.panNumber || 
        !formData.addressLine1 || !formData.pincode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!validateIndianMobile(formData.primaryNumber)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit Indian mobile number (starting with 6-9)",
        variant: "destructive"
      });
      return;
    }

    if (formData.whatsappNumber && !validateIndianMobile(formData.whatsappNumber)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid WhatsApp number",
        variant: "destructive"
      });
      return;
    }

    if (formData.alternateNumber && !validateIndianMobile(formData.alternateNumber)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid alternate number",
        variant: "destructive"
      });
      return;
    }

    if (!validatePAN(formData.panNumber)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid PAN number (e.g., ABCDE1234F)",
        variant: "destructive"
      });
      return;
    }

    if (formData.pincode.length !== 6 || !/^\d{6}$/.test(formData.pincode)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive"
      });
      return;
    }
    // Compose YYYY-MM-DD date
    const pad2 = (s: string) => s.toString().padStart(2, '0');
    const dob = `${formData.year}-${pad2(formData.month)}-${pad2(formData.day)}`;

    try {
      setIsSavingRemote(true);
      if (editingPerson) {
        // Update existing person via PUT
        const updatePayload = {
          first_name: formData.firstName,
          middle_name: formData.middleName || '',
          last_name: formData.lastName,
          date_of_birth: dob,
          whatsapp_number: formData.whatsappNumber || '',
          alternate_number: formData.alternateNumber || '',
          address_line1: formData.addressLine1,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
        };
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/v1/persons/${encodeURIComponent(editingPerson.id)}`, {
          method: 'PUT',
          headers: buildHeaders('PUT', true),
          body: JSON.stringify(updatePayload),
        });
        if (!res.ok) {
          const msg = await parseApiErrorMessage(res);
          throw new Error(msg || 'Failed to update person');
        }
        const result = await res.json().catch(() => ({}));
        toast({ title: 'Person updated', description: result.message || 'Person updated successfully' });
    } else {
        // Create new person
        const payload = {
          lead_uuid: lead.id,
          first_name: formData.firstName,
          middle_name: formData.middleName || '',
          last_name: formData.lastName,
          date_of_birth: dob,
          primary_number: formData.primaryNumber,
          whatsapp_number: formData.whatsappNumber || undefined,
          alternate_number: formData.alternateNumber || undefined,
          pan_card_number: formData.panNumber,
          address_line1: formData.addressLine1,
          district: formData.district || undefined,
          state: formData.state || undefined,
          pincode: formData.pincode,
        };
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/v1/persons`, {
          method: 'POST',
          headers: buildHeaders('POST', true),
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const msg = await parseApiErrorMessage(res);
          throw new Error(msg || 'Failed to create person');
        }
        const result = await res.json().catch(() => ({}));
        toast({ title: 'Person created', description: result.message || 'Person created successfully' });
      }
      // Reload persons and reset form
      await fetchPersonsForLead();
    resetForm();
       
    } catch (err: any) {
      const desc = typeof err?.message === 'string' && err.message.trim().length > 0 ? err.message : 'Failed to save person';
      toast({ title: 'Error', description: desc, variant: 'destructive' });
    } finally {
      setIsSavingRemote(false);
    }
  };

  const handleSendConsent = async (personId: string) => {
    try {
      setSendingConsentId(personId);
      const url = `${API_CONFIG.BASE_URL}/api/v1/consent/generate-link/${encodeURIComponent(personId)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: buildHeaders('POST', true),
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to generate consent link');
      const data = await res.json();
      toast({ title: 'Consent', description: data.message || 'Consent link generated' });
      // Mark pending so the button label flips to Resend until RECEIVED
      setPersons(prev => prev.map(p => p.id === personId ? { ...p, consentStatus: 'CONSENT_PENDING' } : p));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Unable to send consent', variant: 'destructive' });
    } finally {
      setSendingConsentId(null);
    }
  };

  const handleCheckConsent = async (personId: string) => {
    try {
      setCheckingConsentId(personId);
      const url = `${API_CONFIG.BASE_URL}/api/v1/consent/status/${encodeURIComponent(personId)}`;
      const res = await fetch(url, { headers: buildHeaders('GET', false) });
      if (!res.ok) throw new Error('Failed to fetch consent status');
      const data = await res.json();
      const apiStatus = String(data.consent_status || '').toUpperCase();
      const hasValid = Boolean(data.has_valid_consent);
      let mapped: Person['consentStatus'] = 'CONSENT_NOT_SENT';
      if (hasValid || apiStatus.includes('RECEIVED')) mapped = 'CONSENT_RECEIVED';
      else if (apiStatus.includes('EXPIRE')) mapped = 'CONSENT_EXPIRED';
      else if (apiStatus.includes('WITHDRAW')) mapped = 'CONSENT_WITHDRAWN';
      else if (!apiStatus.includes('NO_CONSENT')) mapped = 'CONSENT_PENDING';
      else mapped = 'CONSENT_NOT_SENT';

      // Update row + handle credit bureau state transitions
      setPersons(prev => prev.map(p => {
        if (p.id !== personId) return p;
        const updated: Person = { ...p, consentStatus: mapped } as Person;

        if (mapped === 'CONSENT_WITHDRAWN') {
          // Clear any persisted report/enquiry and allow re-trigger in future
          updated.creditBureauStatus = undefined;
          updated.enquiryUuid = undefined;
          try {
            localStorage.removeItem(`creditReport_${personId}`);
            localStorage.removeItem(`creditBureau_${personId}`);
          } catch {}
        }

        if (mapped === 'CONSENT_RECEIVED') {
          // If there is no saved report, enable trigger again by clearing status/enquiry
          let hasSavedReport = false;
          try { hasSavedReport = Boolean(localStorage.getItem(`creditReport_${personId}`)); } catch {}
          if (!hasSavedReport) {
            updated.creditBureauStatus = undefined;
            updated.enquiryUuid = undefined;
          }
        }
        return updated;
      }));

      toast({ title: 'Consent Status', description: data.message || apiStatus || String(hasValid) });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Unable to check consent status', variant: 'destructive' });
    } finally {
      setCheckingConsentId(null);
    }
  };

  const handleTriggerCreditBureau = async (personId: string) => {
    if (triggeringBureauId) return; // prevent double clicks while in-flight
    const person = persons.find(p => p.id === personId);
    if (!person) return;
    try {
      setTriggeringBureauId(personId);
      // Compose payload from person and lead
      // For CRIF, DOB must be dd-mm-yyyy
      const dd = person.dateOfBirth.day.padStart(2,'0');
      const mm = person.dateOfBirth.month.padStart(2,'0');
      const yyyy = person.dateOfBirth.year;
      const dobCrif = `${dd}-${mm}-${yyyy}`;
      const leadUuid = lead.id;
      const body = {
        person_uuid: person.id,
        lead_uuid: leadUuid,
        first_name: person.firstName,
        middle_name: person.middleName || '',
        last_name: person.lastName,
        date_of_birth: dobCrif,
        mobile_number: person.primaryNumber,
        pan: person.panNumber,
        address_line1: person.addressLine1,
        lead_name: lead.customerName,
        loan_amount: Number(lead.loanAmount || 0),
        product_type: lead.productType,
        pincode: person.pincode,
      } as any;

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/v1/credit-bureau/pull-report`, {
        method: 'POST',
        headers: buildHeaders('POST', true),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to trigger');

      const enquiryUuid = data.enquiry_uuid || data.enquiryUuid || data.uuid;
      setPersons(prev => prev.map(p => p.id === personId ? { ...p, creditBureauStatus: 'Processing', enquiryUuid } : p));
      try { localStorage.setItem(`creditBureau_${personId}`, JSON.stringify({ status: 'Processing', enquiryUuid })); } catch {}
      toast({ title: 'Credit Bureau Triggered', description: 'Report request submitted. Processing in background.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to trigger credit bureau', variant: 'destructive' });
    } finally {
      setTriggeringBureauId(null);
    }
  };

  const fetchCompleteReport = async (person: Person) => {
    if (!person.enquiryUuid) {
      toast({ title: 'No enquiry found', description: 'Please trigger credit bureau first.' });
      return;
    }
    try {
      const url = `${API_CONFIG.BASE_URL}/api/v1/credit-bureau/enquiry/${encodeURIComponent(person.enquiryUuid)}/complete-report`;
      const res = await fetch(url, { headers: buildHeaders('GET', false) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch report');

      // Handle special statuses from backend
      const statusUpper = String(data?.status || '').toUpperCase();
      if (statusUpper === 'NO_HIT' || statusUpper === 'DATA_MISMATCH') {
        // Persist explicit result and mark last pull as Failed, allow re-trigger
        try {
          localStorage.removeItem(`creditReport_${person.id}`);
          localStorage.setItem(`creditBureau_${person.id}`, JSON.stringify({ status: 'Failed' }));
          localStorage.setItem(`creditReportResult_${person.id}`, statusUpper);
        } catch {}
        setPersons(prev => prev.map(p => p.id === person.id ? { ...p, creditBureauStatus: 'Failed', enquiryUuid: undefined } : p));
        toast({ title: 'Credit Report', description: statusUpper === 'NO_HIT' ? 'No credit data found. Please update details and try again.' : 'Data mismatch. Please update details and trigger again.' });
        // Navigate to score page to show friendly message
        try { sessionStorage.setItem('selectedPersonId', person.id); } catch {}
        navigate(`/score-report?result=${encodeURIComponent(statusUpper)}`);
        return;
      }

      // Persist report locally for score page to consume
      try {
        localStorage.setItem(`creditReport_${person.id}`, JSON.stringify(data));
        localStorage.setItem(`creditBureau_${person.id}`, JSON.stringify({ status: 'Success', enquiryUuid: person.enquiryUuid }));
      } catch {}
      setPersons(prev => prev.map(p => p.id === person.id ? { ...p, creditBureauStatus: 'Success' } : p));
      toast({ title: 'Credit Report Ready', description: 'Report fetched successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Unable to fetch report', variant: 'destructive' });
    }
  };

  const getConsentStatusBadge = (status: Person['consentStatus']) => {
    const variants = {
      'CONSENT_NOT_SENT': 'secondary',
      'CONSENT_RECEIVED': 'default',
      'CONSENT_WITHDRAWN': 'destructive',
      'CONSENT_EXPIRED': 'outline',
      'CONSENT_PENDING': 'secondary'
    } as const;

    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getCreditBureauStatusBadge = (status?: Person['creditBureauStatus']) => {
    if (!status) return <span className="text-muted-foreground">-</span>;
    
    const variants = {
      'Success': 'default',
      'Failed': 'destructive',
      'Processing': 'secondary'
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 80 }, (_, i) => (new Date().getFullYear() - i).toString());

  const fetchPersonsForLead = async () => {
    setPersonsError(null);
    setIsLoadingPersons(true);
    try {
      const url = `${API_CONFIG.BASE_URL}/api/v1/persons?lead_uuid=${encodeURIComponent(lead.id)}&limit=50&offset=0`;
      const res = await fetch(url, { headers: buildHeaders('GET', false) });
      if (!res.ok) throw new Error('Failed to load persons');
      const data = await res.json();
      const items = data.persons || data.results || [];
      const mapped: Person[] = items.map((p: any) => {
        const dob = String(p.date_of_birth || '').split('-');
        const year = dob[0] || '';
        const month = dob[1] || '';
        const day = dob[2] || '';
        const norm = normalizeDobParts(year, month, day);
        const personMapped: Person = {
          id: p.uuid || p.id,
          firstName: p.first_name || '',
          middleName: p.middle_name || '',
          lastName: p.last_name || '',
          dateOfBirth: { day: norm.day, month: norm.month, year: norm.year },
          primaryNumber: p.primary_number || '',
          whatsappNumber: p.whatsapp_number || undefined,
          alternateNumber: p.alternate_number || undefined,
          addressLine1: p.address_line1 || '',
          district: p.district || '',
          state: p.state || '',
          pincode: p.pincode || '',
          panNumber: p.pan_card_number || '',
          consentStatus: mapConsentStatus(p.consent_status ?? p.consentStatus),
          creditBureauStatus: undefined,
          leadId: lead.id,
        };
        // Merge any locally persisted credit bureau status
        try {
          const persisted = localStorage.getItem(`creditBureau_${personMapped.id}`);
          if (persisted) {
            const saved = JSON.parse(persisted);
            if (saved?.status) personMapped.creditBureauStatus = saved.status;
            if (saved?.enquiryUuid) personMapped.enquiryUuid = saved.enquiryUuid;
          }
        } catch {}
        // If consent is withdrawn, clear any persisted report/enquiry and reset status so UI allows re-trigger
        if (personMapped.consentStatus === 'CONSENT_WITHDRAWN') {
          personMapped.creditBureauStatus = undefined;
          personMapped.enquiryUuid = undefined;
          try {
            localStorage.removeItem(`creditReport_${personMapped.id}`);
            localStorage.removeItem(`creditBureau_${personMapped.id}`);
          } catch {}
        }
        return personMapped;
      });
      setPersons(mapped);

      // Background refresh of consent statuses to avoid stale list data
      try {
        await Promise.allSettled(mapped.map(async (p) => {
          const statusUrl = `${API_CONFIG.BASE_URL}/api/v1/consent/status/${encodeURIComponent(p.id)}`;
          const statusRes = await fetch(statusUrl, { headers: buildHeaders('GET', false) });
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();
          const apiStatus = String(statusData.consent_status || '').toUpperCase();
          const hasValid = Boolean(statusData.has_valid_consent);
          let mappedStatus: Person['consentStatus'] = 'CONSENT_NOT_SENT';
          if (hasValid || apiStatus.includes('RECEIVED')) mappedStatus = 'CONSENT_RECEIVED';
          else if (apiStatus.includes('EXPIRE')) mappedStatus = 'CONSENT_EXPIRED';
          else if (apiStatus.includes('WITHDRAW')) mappedStatus = 'CONSENT_WITHDRAWN';
          else if (!apiStatus.includes('NO_CONSENT')) mappedStatus = 'CONSENT_PENDING';
          else mappedStatus = 'CONSENT_NOT_SENT';
          applyConsentStatusToPerson(p.id, mappedStatus, setPersons);
        }));
      } catch {}

    } catch (err: any) {
      setPersonsError(err.message || 'Error loading persons');
    } finally {
      setIsLoadingPersons(false);
    }
  };

  useEffect(() => {
    fetchPersonsForLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id]);

  return (
    <div className="min-h-screen bg-background">
              <div className="container mx-auto p-4 pt-8">
        {/* Header row: Add button + prominent lead summary */}
        <div className="flex items-center gap-4 mb-6">
        {!isAddingPerson && (
            <Button onClick={() => setIsAddingPerson(true)} className="shrink-0">
              <User className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          )}
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-semibold text-foreground truncate">
              {lead.customerName}
              <span className="text-muted-foreground font-normal"> ({lead.customerId}) • {lead.productType}</span>
            </div>
          </div>
        </div>

        {/* Add Person Form */}
        {isAddingPerson && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {editingPerson ? 'Edit Person Information' : 'Personal Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className={getInputClassName('firstName', formData.firstName)}
                  />
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    placeholder="Enter middle name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className={getInputClassName('lastName', formData.lastName)}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <Label>Date of Birth *</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Select value={formData.day} onValueChange={(value) => handleInputChange('day', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={formData.month} onValueChange={(value) => handleInputChange('month', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={month} value={(index + 1).toString()}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="primaryNumber">Primary Number *</Label>
                      <Input
                        id="primaryNumber"
                        value={formData.primaryNumber}
                        onChange={(e) => handleInputChange('primaryNumber', e.target.value)}
                        placeholder="10-digit primary number"
                        className={getInputClassName('primaryNumber', formData.primaryNumber)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                      <Input
                        id="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                        placeholder="10-digit WhatsApp number"
                        className={getInputClassName('whatsappNumber', formData.whatsappNumber)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="alternateNumber">Alternate Number</Label>
                      <Input
                        id="alternateNumber"
                        value={formData.alternateNumber}
                        onChange={(e) => handleInputChange('alternateNumber', e.target.value)}
                        placeholder="10-digit alternate number"
                        className={getInputClassName('alternateNumber', formData.alternateNumber)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        value={formData.addressLine1}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        placeholder="Enter address"
                        className={getInputClassName('addressLine1', formData.addressLine1)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                          className={getInputClassName('pincode', formData.pincode)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          value={formData.district}
                          readOnly
                          placeholder="Auto-filled from pincode"
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          readOnly
                          placeholder="Auto-filled from pincode"
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-4 w-4" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="panNumber">PAN Number *</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className={getInputClassName('panNumber', formData.panNumber)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSavePerson} disabled={isSavingRemote}>
                  {editingPerson ? 'Update Person' : 'Save Person'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {(personsError || isLoadingPersons) && (
          <div className="mb-4 text-sm">
            {isLoadingPersons ? 'Loading persons…' : <span className="text-destructive">{personsError}</span>}
          </div>
        )}

        {persons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Added Persons ({persons.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Primary Number</TableHead>
                    <TableHead>WhatsApp Number</TableHead>
                    <TableHead>PAN Number</TableHead>
                    <TableHead>Consent Status</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Credit Bureau Status</TableHead>
                    <TableHead>Report</TableHead>
                    <TableHead>Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {persons.map((person) => (
                    <TableRow key={person.id} className="cursor-pointer" onClick={() => loadPersonForEdit(person)}>
                      <TableCell className="font-medium">
                        {`${person.firstName} ${person.middleName ? person.middleName + ' ' : ''}${person.lastName}`}
                      </TableCell>
                      <TableCell>{person.primaryNumber}</TableCell>
                      <TableCell>{person.whatsappNumber || '-'}</TableCell>
                      <TableCell>{person.panNumber}</TableCell>
                      <TableCell>{getConsentStatusBadge(person.consentStatus)}</TableCell>
                       <TableCell>
                         <div className="flex gap-2">
                           {person.consentStatus !== 'CONSENT_RECEIVED' && (
                             <Button
                               size="sm"
                               variant="outline"
                                onClick={(e) => { e.stopPropagation(); handleSendConsent(person.id); }}
                                disabled={sendingConsentId === person.id}
                             >
                               <MessageCircle className="h-4 w-4 mr-1" />
                                {sendingConsentId === person.id ? 'Sending…' : (person.consentStatus === 'CONSENT_NOT_SENT' ? 'Send Consent' : 'Resend Consent')}
                             </Button>
                           )}
                           <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleCheckConsent(person.id); }} disabled={checkingConsentId === person.id}>
                             {checkingConsentId === person.id ? 'Checking…' : 'Check Status'}
                           </Button>
                           
                           {person.consentStatus === 'CONSENT_RECEIVED' && (
                             <Button
                               size="sm"
                            onClick={(e) => { e.stopPropagation(); handleTriggerCreditBureau(person.id); }}
                            disabled={triggeringBureauId === person.id}
                             >
                               <FileText className="h-4 w-4 mr-1" />
                            {triggeringBureauId === person.id ? 'Triggering…' : (person.creditBureauStatus ? 'Re-Trigger Credit Bureau' : 'Trigger Credit Bureau')}
                             </Button>
                           )}
                         </div>
                       </TableCell>
                      <TableCell>{getCreditBureauStatusBadge(person.creditBureauStatus)}</TableCell>
                      <TableCell>
                        {person.creditBureauStatus === 'Processing' && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); fetchCompleteReport(person); }}>Get Report</Button>
                        )}
                        {person.creditBureauStatus === 'Success' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              try { sessionStorage.setItem('selectedPersonId', person.id); } catch {}
                              const url = `/score-report?enquiry_uuid=${encodeURIComponent(person.enquiryUuid || '')}`;
                              navigate(url);
                            }}
                          >
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Credit Report
                          </Button>
                        )}
                        {person.creditBureauStatus === 'Failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              try { sessionStorage.setItem('selectedPersonId', person.id); } catch {}
                              let result = 'NO_HIT';
                              try {
                                const saved = localStorage.getItem(`creditReportResult_${person.id}`);
                                if (saved) result = saved;
                              } catch {}
                              navigate(`/score-report?result=${encodeURIComponent(result)}`);
                            }}
                          >
                            View Result
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); loadPersonForEdit(person); }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonManagement;