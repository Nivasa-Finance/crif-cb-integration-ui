import { SectionCard } from "./SectionCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useMemo } from "react";

interface Tradeline {
  "ACCT-NUMBER": string;
  "CREDIT-GRANTOR": string;
  HISTORY: { NAME: string; DATES: string; VALUES: string }[];
}

interface RepaymentHistorySectionProps {
  tradelines: Tradeline[];
}

export const RepaymentHistorySection = ({ tradelines }: RepaymentHistorySectionProps) => {
  const repaymentData = useMemo(() => {
    // Extract all unique dates and create a sorted list
    const allDates = new Set<string>();
    const accountHistories: Record<string, Record<string, string>> = {};

    tradelines.forEach((tradeline) => {
      const paymentHistory = tradeline.HISTORY.find(h => h.NAME === "COMBINED-PAYMENT-HISTORY");
      if (paymentHistory) {
        const dates = paymentHistory.DATES.split('|').filter(Boolean);
        const values = paymentHistory.VALUES.split('|').filter(Boolean);
        
        dates.forEach(date => allDates.add(date));
        
        accountHistories[tradeline["ACCT-NUMBER"]] = {};
        dates.forEach((date, index) => {
          accountHistories[tradeline["ACCT-NUMBER"]][date] = values[index] || '';
        });
      }
    });

    // Sort dates in descending order (most recent first)
    const sortedDates = Array.from(allDates).sort((a, b) => {
      const [monthA, yearA] = a.replace(':', ' ').split(' ');
      const [monthB, yearB] = b.replace(':', ' ').split(' ');
      
      if (yearA !== yearB) {
        return parseInt(yearB) - parseInt(yearA);
      }
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(monthB) - months.indexOf(monthA);
    });

    const tableData = tradelines.map(tradeline => ({
      accountNumber: tradeline["ACCT-NUMBER"],
      lender: tradeline["CREDIT-GRANTOR"],
      history: accountHistories[tradeline["ACCT-NUMBER"]] || {}
    }));

    return { sortedDates, tableData };
  }, [tradelines]);

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNext,
    goToPrevious,
    hasNext,
    hasPrevious,
    totalItems,
  } = usePagination({ data: repaymentData.tableData, itemsPerPage: 10 });

  if (tradelines.length === 0) {
    return (
      <SectionCard title="Repayment History (0)">
        <div className="text-center py-8 text-muted-foreground">
          No repayment history found
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={`Repayment History (${totalItems} accounts)`}>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-32">Account Number</TableHead>
                <TableHead className="min-w-40">Lender</TableHead>
                {repaymentData.sortedDates.map((date) => (
                  <TableHead key={date} className="min-w-20 text-center">
                    {date.replace(':', ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{row.accountNumber}</TableCell>
                  <TableCell className="font-medium text-sm">{row.lender}</TableCell>
                  {repaymentData.sortedDates.map((date) => (
                    <TableCell key={date} className="text-center text-xs">
                      {row.history[date] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={hasPrevious ? goToPrevious : undefined}
                  className={!hasPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => goToPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={hasNext ? goToNext : undefined}
                  className={!hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </SectionCard>
  );
};