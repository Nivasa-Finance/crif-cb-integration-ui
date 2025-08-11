import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { API_CONFIG, buildHeaders } from '@/config/apiConfig';
import { apiFetch } from '@/services/httpClient';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Lead {
  id: string;
  customerName: string;
  customerId: string;
  mobileNumber: string;
  createdDate: string;
  freshsalesId?: string;
  loanAmount: string;
  productType: 'Home Loan' | 'LAP' | 'Balance Transfer' | string;
}

interface LeadDashboardProps {
  onViewLead: (lead: Lead) => void;
  onNewInquiry: () => void;
  onViewReport: (lead: Lead) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const LeadDashboard: React.FC<LeadDashboardProps> = ({ onViewLead, onNewInquiry, onViewReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedCount, setLastFetchedCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Create Lead modal state (lead-only, no person creation here)
  const [createOpen, setCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Lead fields
  const [leadName, setLeadName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [freshsalesId, setFreshsalesId] = useState('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [productType, setProductType] = useState<string>('Home Loan');

  const resetCreateState = () => {
    setIsSaving(false);
    setSaveError(null);
    setLeadName('');
    setMobileNumber('');
    setFreshsalesId('');
    setLoanAmount('');
    setProductType('Home Loan');
  };

  const createLead = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const body = {
        lead_name: leadName,
        mobile_number: mobileNumber,
        freshsales_id: freshsalesId,
        loan_amount: Number(loanAmount),
        product_type: productType,
      };
      const res = await apiFetch(`${API_CONFIG.BASE_URL}/api/v1/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create lead');
      try { await res.json(); } catch { /* ignore empty */ }

      // Success: close modal, reset form, and refresh list
      setCreateOpen(false);
      resetCreateState();
      fetchLeads(limit, offset);
    } catch (e: any) {
      setSaveError(e.message || 'Error creating lead');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchLeads = async (lmt: number, off: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_CONFIG.BASE_URL}/api/v1/leads?limit=${lmt}&offset=${off}`;
      const res = await apiFetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to fetch leads');

      const data = await res.json().catch(() => ({}));
      const normalized = (data.leads || data.results || data.items || data.data || []).map((d: any) => ({
        id: d.uuid || d.id,
        customerName: d.lead_name || d.customerName || d.name,
        customerId: d.freshsales_id || d.customerId,
        mobileNumber: d.mobile_number || d.mobileNumber,
        createdDate: d.created_at || d.createdDate,
        loanAmount: String(d.loan_amount ?? d.loanAmount ?? ''),
        productType: d.product_type || d.productType || '',
        freshsalesId: d.freshsales_id || d.customerId,
      }));
      setLeads(normalized);
      setLastFetchedCount(normalized.length);

      // Sync UI paging with backend-acknowledged values (if backend enforces a different limit/offset)
      const respLimit = Number(data.limit);
      const respOffset = Number(data.offset);
      if (Number.isFinite(respLimit) && respLimit > 0 && respLimit !== limit) {
        setLimit(respLimit);
      }
      if (Number.isFinite(respOffset) && respOffset >= 0 && respOffset !== offset) {
        setOffset(respOffset);
      }

      // Prefer API total_count/totalCount
      const totalCandidate = data.total_count ?? data.totalCount ?? undefined;
      const parsedTotal = Number(totalCandidate);
      if (Number.isFinite(parsedTotal) && parsedTotal > 0) {
        setTotalCount(parsedTotal);
        setHasMore(off + normalized.length < parsedTotal);
      } else {
        // Fallback heuristic: if we received a full page, assume there may be more
        setHasMore(normalized.length === lmt);
        // Keep a non-zero totalCount so UI shows something sensible
        const guess = Math.max(totalCount, off + normalized.length + (normalized.length === lmt ? 1 : 0));
        setTotalCount(guess);
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(limit, offset);
  }, [limit, offset]);

  const filteredAndSortedLeads = useMemo(() => {
    const filtered = leads.filter(lead => {
      const matchesSearch =
        lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.customerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.mobileNumber || '').includes(searchTerm);
      return matchesSearch;
    });
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof Lead] as string;
      let bValue = b[sortField as keyof Lead] as string;
      if (sortField === 'createdDate') {
        aValue = new Date(a.createdDate).toISOString();
        bValue = new Date(b.createdDate).toISOString();
      }
      if (sortOrder === 'asc') return aValue.localeCompare(bValue);
      return bValue.localeCompare(aValue);
    });
    return filtered;
  }, [leads, searchTerm, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(Math.max(totalCount, 1) / Math.max(limit, 1)));
  const currentPage = Math.floor(offset / limit) + 1;
  const canGoPrev = offset > 0;
  const canGoNext = (offset + lastFetchedCount) < totalCount || hasMore;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const gotoPage = (page: number) => {
    if (page > currentPage) {
      if (canGoNext) setOffset(prev => prev + limit);
      return;
    }
    if (page < currentPage) {
      if (canGoPrev) setOffset(prev => Math.max(0, prev - limit));
      return;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, customer ID, or mobile number..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label>Per page</Label>
              <Select value={String(limit)} onValueChange={v => { setLimit(Number(v)); setOffset(0); }}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Leads</CardTitle>
              <Badge variant="secondary" className="px-3 py-1">{totalCount}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
              <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetCreateState(); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Lead</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Lead</DialogTitle>
                  </DialogHeader>

                  {saveError && <div className="text-sm text-destructive mb-2">{saveError}</div>}

                  <div className="space-y-3">
                    <div>
                      <Label>Lead Name</Label>
                      <Input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="ACHYUT SAIKIA" />
                    </div>
                    <div>
                      <Label>Mobile Number</Label>
                      <Input value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="6655478942" />
                    </div>
                    <div>
                      <Label>Freshsales ID</Label>
                      <Input value={freshsalesId} onChange={e => setFreshsalesId(e.target.value)} placeholder="FS123456" />
                    </div>
                    <div>
                      <Label>Loan Amount</Label>
                      <Input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="5000000" />
                    </div>
                    <div>
                      <Label>Product Type</Label>
                      <Select value={productType} onValueChange={v => setProductType(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home Loan">Home Loan</SelectItem>
                          <SelectItem value="LAP">LAP</SelectItem>
                          <SelectItem value="Balance Transfer">Balance Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button onClick={createLead} disabled={isSaving || !leadName || !mobileNumber || !loanAmount}>Create Lead</Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && <div className="p-4 text-sm text-destructive">{error}</div>}
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('customerName')}>
                      <div className="flex items-center gap-2 font-semibold">
                        Customer Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Freshsales ID</TableHead>
                    <TableHead className="font-semibold">Mobile Number</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('createdDate')}>
                      <div className="flex items-center gap-2 font-semibold">
                        Created Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Loan Amount</TableHead>
                    <TableHead className="font-semibold">Product Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedLeads.map(lead => (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/30 transition-colors border-b" onClick={() => onViewLead(lead)}>
                      <TableCell className="font-medium text-foreground">{lead.customerName}</TableCell>
                      <TableCell className="text-primary-blue font-mono text-sm">{lead.freshsalesId}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.mobileNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(lead.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                      <TableCell className="text-muted-foreground font-semibold">{lead.loanAmount}</TableCell>
                      <TableCell><Badge variant="outline" className="bg-primary-blue/10 text-primary-blue border-primary-blue/20">{lead.productType}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedLeads.length} of {totalCount}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => gotoPage(currentPage - 1)} disabled={!canGoPrev}>Prev</Button>
          <div className="text-sm">{currentPage}</div>
          <Button variant="outline" size="sm" onClick={() => gotoPage(currentPage + 1)} disabled={!canGoNext}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default LeadDashboard;