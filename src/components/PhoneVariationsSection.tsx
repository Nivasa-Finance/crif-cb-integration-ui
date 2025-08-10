import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface PhoneVariation {
  VALUE: string;
  "REPORTED-DT": string;
  "FIRST-REPORTED-DT": string;
  "LOAN-TYPE-ASSOC": string;
  "SOURCE-INDICATOR": string;
}

interface PhoneVariationsSectionProps {
  variations: PhoneVariation[];
}

export const PhoneVariationsSection = ({ variations }: PhoneVariationsSectionProps) => {
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
  } = usePagination({ data: variations, itemsPerPage: 10 });

  if (variations.length === 0) {
    return (
      <SectionCard title="Phone Number Variations (0)">
        <div className="text-center py-8 text-muted-foreground">
          No phone number variations found
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={`Phone Number Variations (${totalItems})`}>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>First Reported</TableHead>
                <TableHead>Last Reported</TableHead>
                <TableHead>Associated Loan Type</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((variation, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono font-medium">{variation.VALUE}</TableCell>
                  <TableCell>{variation["FIRST-REPORTED-DT"]}</TableCell>
                  <TableCell>{variation["REPORTED-DT"]}</TableCell>
                  <TableCell>{variation["LOAN-TYPE-ASSOC"]}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{variation["SOURCE-INDICATOR"]}</Badge>
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