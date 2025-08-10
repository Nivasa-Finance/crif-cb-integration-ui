import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface SecurityDetail {
  "SECURITY-TYPE": string;
  "OWNER-NAME": string;
  "SECURITY-VALUATION": string;
  "DATE-OF-VALUATION": string;
  "PROPERTY-ADDRESS": string;
}

interface HomeLoan {
  "ACCT-NUMBER": string;
  "CREDIT-GRANTOR": string;
  "ACCT-TYPE": string;
  "ACCOUNT-STATUS": string;
  "DISBURSED-DT": string;
  "CURRENT-BAL": string;
  "SECURITY-DETAILS": SecurityDetail[];
}

interface HomeLoanSectionProps {
  tradelines: any[];
}

export const HomeLoanSection = ({ tradelines }: HomeLoanSectionProps) => {
  // Filter for home loans and LAP
  const homeLoans = tradelines.filter(tradeline => 
    tradeline["ACCT-TYPE"]?.toLowerCase().includes("home") || 
    tradeline["ACCT-TYPE"]?.toLowerCase().includes("housing") ||
    tradeline["ACCT-TYPE"]?.toLowerCase().includes("property") ||
    tradeline["ACCT-TYPE"]?.toLowerCase().includes("awas")
  );

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
  } = usePagination({ data: homeLoans, itemsPerPage: 10 });

  if (homeLoans.length === 0) {
    return (
      <SectionCard title="Home Loans / Loan Against Property (0)">
        <div className="text-center py-8 text-muted-foreground">
          No home loans or loan against property found
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={`Home Loans / Loan Against Property (${totalItems})`}>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Lender Name</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Open Date</TableHead>
                <TableHead>Current Balance</TableHead>
                <TableHead>Security Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((loan, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{loan["ACCT-NUMBER"]}</TableCell>
                  <TableCell className="font-medium">{loan["CREDIT-GRANTOR"]}</TableCell>
                  <TableCell className="text-xs">{loan["ACCT-TYPE"]}</TableCell>
                  <TableCell>
                    <Badge variant={loan["ACCOUNT-STATUS"] === "Active" ? "default" : "secondary"}>
                      {loan["ACCOUNT-STATUS"]}
                    </Badge>
                  </TableCell>
                  <TableCell>{loan["DISBURSED-DT"]}</TableCell>
                  <TableCell className="font-medium">₹{loan["CURRENT-BAL"]}</TableCell>
                  <TableCell className="max-w-48">
                    {loan["SECURITY-DETAILS"]?.map((security: SecurityDetail, sIndex: number) => (
                      <div key={sIndex} className="text-xs mb-2 p-2 bg-accent/10 rounded">
                        {security["SECURITY-TYPE"] && (
                          <div><span className="font-medium">Type:</span> {security["SECURITY-TYPE"]}</div>
                        )}
                        {security["SECURITY-VALUATION"] && (
                          <div><span className="font-medium">Valuation:</span> ₹{security["SECURITY-VALUATION"]}</div>
                        )}
                        {security["PROPERTY-ADDRESS"] && (
                          <div><span className="font-medium">Address:</span> {security["PROPERTY-ADDRESS"]}</div>
                        )}
                        {security["DATE-OF-VALUATION"] && (
                          <div><span className="font-medium">Valuation Date:</span> {security["DATE-OF-VALUATION"]}</div>
                        )}
                      </div>
                    ))}
                  </TableCell>
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