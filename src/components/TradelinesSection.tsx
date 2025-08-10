import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Tradeline {
  "ACCT-NUMBER": string;
  "CREDIT-GRANTOR": string;
  "ACCT-TYPE": string;
  "ACCOUNT-STATUS": string;
  "DISBURSED-AMT": string;
  "DISBURSED-DT": string;
  "CURRENT-BAL": string;
  "REPORTED-DT": string;
  "INSTALLMENT-AMT": string;
  "OVERDUE-AMT": string;
  "INTEREST-RATE": string;
  "SECURITY-STATUS"?: string;
  HISTORY: { NAME: string; DATES: string; VALUES: string }[];
}

interface MonthlyData {
  month: string;
  dpd: string;
  balance: string;
  amountPaid: string;
}

interface TradelinesSectionProps {
  tradelines: Tradeline[];
}

export const TradelinesSection = ({ tradelines }: TradelinesSectionProps) => {
  // Sort tradelines by disbursed date in descending order
  const sortedTradelines = useMemo(() => {
    return [...tradelines].sort((a, b) => {
      const dateA = new Date(a["DISBURSED-DT"]).getTime();
      const dateB = new Date(b["DISBURSED-DT"]).getTime();
      return dateB - dateA; // Descending order
    });
  }, [tradelines]);

  // Extract and process monthly data
  const { monthlyDataByAccount, allMonths } = useMemo(() => {
    const monthlyData: { [accountNumber: string]: { [month: string]: MonthlyData } } = {};
    const monthSet = new Set<string>();

    sortedTradelines.forEach(tradeline => {
      const accountNumber = tradeline["ACCT-NUMBER"];
      monthlyData[accountNumber] = {};

      // Get history data
      const paymentHistory = tradeline.HISTORY.find(h => h.NAME === "COMBINED-PAYMENT-HISTORY");
      const balanceHistory = tradeline.HISTORY.find(h => h.NAME === "CURRENT-BALANCE-HISTORY");
      const amountPaidHistory = tradeline.HISTORY.find(h => h.NAME === "AMT-PAID-HISTORY");

      if (paymentHistory) {
        const dates = paymentHistory.DATES.split('|').filter(d => d.trim());
        const values = paymentHistory.VALUES.split('|').filter(v => v.trim());
        const balances = balanceHistory ? balanceHistory.VALUES.split('|').filter(v => v.trim()) : [];
        const amountsPaid = amountPaidHistory ? amountPaidHistory.VALUES.split('|').filter(v => v.trim()) : [];

        dates.forEach((date, index) => {
          if (date.trim()) {
            monthSet.add(date.trim());
            const dpd = values[index]?.split('/')[0] || '-';
            const balance = balances[index] || '-';
            const amountPaid = amountsPaid[index] || '-';

            monthlyData[accountNumber][date.trim()] = {
              month: date.trim(),
              dpd,
              balance,
              amountPaid
            };
          }
        });
      }
    });

    // Sort months chronologically (most recent first)
    const sortedMonths = Array.from(monthSet).sort((a, b) => {
      const [monthA, yearA] = a.split(':');
      const [monthB, yearB] = b.split(':');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateB.getTime() - dateA.getTime();
    });

    return { monthlyDataByAccount: monthlyData, allMonths: sortedMonths };
  }, [sortedTradelines]);

  // Show all tradelines (no pagination)
  const paginatedData = sortedTradelines;
  const totalItems = sortedTradelines.length;

  const getStatusBadge = (status: string) => {
    const variant = status === "Active" ? "default" : status === "Closed" ? "secondary" : "destructive";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getDpdBadgeColor = (dpd: string) => {
    if (dpd === "000" || dpd === "-") return "text-green-600 bg-green-50 border-green-200";
    if (dpd === "030" || dpd === "027") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (dpd === "XXX") return "text-gray-500 bg-gray-50 border-gray-200";
    const numericDpd = parseInt(dpd);
    if (!isNaN(numericDpd) && numericDpd >= 60) return "text-red-600 bg-red-50 border-red-200";
    if (!isNaN(numericDpd) && numericDpd > 0) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-gray-500 bg-gray-50 border-gray-200";
  };

  // Calculate grid dimensions for performance
  const gridHeight = Math.min(600, (paginatedData.length + 1) * 60); // +1 for header, 60px per row
  const gridWidth = Math.min(1200, 300 + (allMonths.length * 140)); // 300px for account column, 140px per month

  return (
    <SectionCard title={`Tradelines with Monthly Payment History (${totalItems} accounts)`} className="col-span-full">
      <div className="space-y-6">
        {/* Account Summary Table with All Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Account Summary (Complete Details)</h3>
          <div className="border rounded-lg bg-background">
            <div className="w-full h-80 overflow-scroll" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
              <div className="relative" style={{ width: '2800px', minHeight: '100%' }}>
                {/* Fixed Header */}
                <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b shadow-sm">
                  <div className="flex">
                    {/* Fixed Account Column Header */}
                    <div className="sticky left-0 z-30 bg-background/95 backdrop-blur-sm border-r shadow-lg">
                      <div className="w-80 px-4 py-3 font-semibold text-sm bg-muted/90">
                        Account Details
                      </div>
                    </div>
                    {/* Scrollable Headers */}
                    <div className="flex">
                      <div className="w-32 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Grantor Group</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Grantor Type</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Reported Date</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Ownership</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Closed Date</div>
                      <div className="w-32 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Installment</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Credit Limit</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Cash Limit</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Frequency</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Original Term</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Term to Maturity</div>
                      <div className="w-32 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Repayment Tenure</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Actual Payment</div>
                      <div className="w-32 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Last Payment</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Write Off</div>
                      <div className="w-32 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Principal Write Off</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Settlement</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Obligation</div>
                      <div className="w-32 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Remarks</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">In Dispute</div>
                      <div className="w-32 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Suit Filed Status</div>
                      <div className="w-32 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Written Off Status</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Write Off Date</div>
                      <div className="w-32 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Linked Accounts</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Suit Filed Date</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Last Paid Amount</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Occupation</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Income Freq</div>
                      <div className="w-28 px-2 py-3 text-center font-semibold text-xs border-r bg-muted/90">Income Amount</div>
                      <div className="w-48 px-2 py-3 text-center font-semibold text-xs bg-muted/90">Security Details</div>
                    </div>
                  </div>
                </div>

                {/* Data Rows */}
                <div className="relative">
                  {paginatedData.map((account, index) => {
                    return (
                      <div key={account["ACCT-NUMBER"]} className="flex border-b hover:bg-muted/20 transition-colors">
                        {/* Fixed Account Column */}
                        <div className="sticky left-0 z-10 bg-background/95 backdrop-blur-sm border-r shadow-lg">
                          <div className="w-80 px-4 py-3 space-y-1">
                            <div className="font-mono text-xs font-medium">{account["ACCT-NUMBER"]}</div>
                            <div className="text-sm font-medium">{account["CREDIT-GRANTOR"]}</div>
                            <div className="text-xs text-muted-foreground">{account["ACCT-TYPE"]}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(account["ACCOUNT-STATUS"])}
                              <span className="text-xs">₹{account["CURRENT-BAL"]}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Disbursed: ₹{account["DISBURSED-AMT"]} ({account["DISBURSED-DT"]})
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rate: {account["INTEREST-RATE"] || 'N/A'}% | Overdue: ₹{account["OVERDUE-AMT"] || '0'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Scrollable Columns */}
                        <div className="flex">
                          <div className="w-32 px-2 py-3 text-xs border-r">{account["CREDIT-GRANTOR-GROUP"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["CREDIT-GRANTOR-TYPE"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["REPORTED-DT"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["OWNERSHIP-TYPE"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["CLOSED-DT"] || 'N/A'}</div>
                          <div className="w-32 px-2 py-3 text-xs border-r">{account["INSTALLMENT-AMT"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["CREDIT-LIMIT"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["CASH-LIMIT"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["INSTALLMENT-FREQUENCY"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["ORIGINAL-TERM"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["TERM-TO-MATURITY"] || 'N/A'}</div>
                          <div className="w-32 px-2 py-3 text-xs border-r">{account["REPAYMENT-TENURE"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["ACTUAL-PAYMENT"] || 'N/A'}</div>
                          <div className="w-32 px-2 py-3 text-xs border-r">{account["LAST-PAYMENT-DT"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">₹{account["WRITE-OFF-AMT"] || '0'}</div>
                          <div className="w-32 px-2 py-3 text-xs border-r">₹{account["PRINCIPAL-WRITE-OFF-AMT"] || '0'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["SETTLEMENT-AMT"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["OBLIGATION"] || 'N/A'}</div>
                          <div className="w-32 px-2 py-3 text-xs border-r">{account["ACCOUNT-REMARKS"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["ACCT-IN-DISPUTE"] || 'N/A'}</div>
                          <div className="w-32 px-2 py-3 text-xs border-r">{account["SUIT-FILED-WILFUL-DEFAULT-STATUS"] || 'N/A'}</div>
                          <div className="w-32 px-2 py-3 text-xs border-r">{account["WRITTEN-OFF-SETTLED-STATUS"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["WRITE-OFF-DT"] || 'N/A'}</div>
                          <div className="w-32 px-2 py-3 text-xs border-r">
                            {account["LINKED-ACCOUNTS"] && account["LINKED-ACCOUNTS"].length > 0 
                              ? account["LINKED-ACCOUNTS"].join(', ') 
                              : 'None'
                            }
                          </div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["SUIT-FILED-DT"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["LAST-PAID-AMOUNT"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["OCCUPATION"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["INCOME-FREQUENCY"] || 'N/A'}</div>
                          <div className="w-28 px-2 py-3 text-xs border-r">{account["INCOME-AMOUNT"] || 'N/A'}</div>
                          <div className="w-48 px-2 py-3 text-xs border-r">
                            <div className="space-y-1 text-foreground">
                              {account["SECURITY-DETAILS"] && account["SECURITY-DETAILS"].length > 0 ? (
                                account["SECURITY-DETAILS"].map((security, idx) => {
                                  const nonNullEntries = Object.entries(security)
                                    .filter(([key, value]) => value !== null && value !== '' && value !== undefined);
                                  
                                  if (nonNullEntries.length === 0) return null;
                                  
                                  return (
                                    <div key={idx} className="bg-muted/50 p-1 rounded text-xs">
                                      {nonNullEntries.map(([key, value], entryIdx) => (
                                        <div key={entryIdx} className="text-foreground">
                                          <span className="font-medium">{key}:</span> <span className="text-muted-foreground">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-muted-foreground">No details</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Monthly Payment History Data Grid */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Monthly Payment History Data Grid</h3>
          <div className="border rounded-lg bg-background">
            {/* Grid Container with fixed height and forced scrollbars */}
            <div className="w-full h-96 overflow-scroll" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
              <div className="relative" style={{ width: `${320 + (allMonths.length * 140)}px`, minWidth: '1600px', minHeight: '100%' }}>
                {/* Fixed Header Row */}
                <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b shadow-sm">
                  <div className="flex">
                    {/* Fixed Account Column Header */}
                    <div className="sticky left-0 z-30 bg-background/95 backdrop-blur-sm border-r shadow-lg">
                      <div className="w-80 px-4 py-3 font-semibold text-sm bg-muted/90">
                        Account Details
                      </div>
                    </div>
                    
                    {/* Scrollable Month Headers */}
                    <div className="flex">
                      {allMonths.map((month) => (
                        <div 
                          key={month} 
                          className="w-36 px-3 py-3 text-center font-semibold text-sm border-r bg-muted/90 flex-shrink-0"
                        >
                          <div className="text-xs font-medium">{month}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Data Rows */}
                <div className="relative">
                  {paginatedData.map((account, accountIndex) => (
                    <div key={account["ACCT-NUMBER"]} className="flex border-b hover:bg-muted/20 transition-colors">
                      {/* Fixed Account Information Column */}
                      <div className="sticky left-0 z-10 bg-background/95 backdrop-blur-sm border-r shadow-lg">
                        <div className="w-80 px-4 py-4 space-y-1">
                          <div className="font-mono text-xs font-medium">{account["ACCT-NUMBER"]}</div>
                          <div className="text-sm font-medium text-foreground">{account["CREDIT-GRANTOR"]}</div>
                          <div className="text-xs text-muted-foreground">{account["ACCT-TYPE"]}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(account["ACCOUNT-STATUS"])}
                            <span className="text-xs text-muted-foreground">
                              ₹{account["CURRENT-BAL"]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Monthly Data Columns */}
                      <div className="flex">
                        {allMonths.map((month) => {
                          const data = monthlyDataByAccount[account["ACCT-NUMBER"]]?.[month];
                          return (
                            <div 
                              key={`${account["ACCT-NUMBER"]}-${month}`} 
                              className="w-36 px-3 py-4 border-r flex-shrink-0"
                            >
                              {data ? (
                                <div className="space-y-1.5">
                                  <div className={cn(
                                    "text-xs px-2 py-1 rounded-md font-medium border text-center",
                                    getDpdBadgeColor(data.dpd)
                                  )}>
                                    DPD: {data.dpd}
                                  </div>
                                  <div className="text-xs text-muted-foreground text-center">
                                    <div>Bal: {data.balance !== '-' && data.balance !== '' ? `₹${data.balance}` : '-'}</div>
                                  </div>
                                  <div className="text-xs text-muted-foreground text-center">
                                    <div>Paid: {data.amountPaid !== '-' && data.amountPaid !== '' ? `₹${data.amountPaid}` : '-'}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground text-center py-2">-</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};