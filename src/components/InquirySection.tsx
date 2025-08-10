import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Inquiry {
  "LENDER-NAME": string;
  "LENDER-TYPE": string;
  "INQUIRY-DT": string;
  "OWNERSHIP-TYPE": string;
  "CREDIT-INQ-PURPS-TYPE": string;
  "CREDIT-INQUIRY-STAGE": string;
  AMOUNT: string;
  REMARK: string;
  "LOAN-TYPE": string;
}

interface InquirySectionProps {
  inquiries: Inquiry[];
}

export const InquirySection = ({ inquiries }: InquirySectionProps) => {

  return (
    <SectionCard title="INQUIRY HISTORY" className="flex flex-col">
      <div className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground font-medium bg-muted/50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>Total Inquiries: <span className="font-bold text-foreground">{inquiries.length}</span></span>
          </div>
        </div>
        
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="h-[320px] overflow-auto"> {/* Fixed height for approximately 5 rows */}
            <Table>
              <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-sm z-10 border-b">
                <TableRow>
                  <TableHead className="min-w-[180px] text-xs font-bold uppercase tracking-wide border-r">Lender Name</TableHead>
                  <TableHead className="min-w-[80px] text-xs font-bold uppercase tracking-wide border-r">Type</TableHead>
                  <TableHead className="min-w-[90px] text-xs font-bold uppercase tracking-wide border-r">Date</TableHead>
                  <TableHead className="min-w-[140px] text-xs font-bold uppercase tracking-wide border-r">Purpose</TableHead>
                  <TableHead className="min-w-[90px] text-xs font-bold uppercase tracking-wide border-r">Amount</TableHead>
                  <TableHead className="min-w-[80px] text-xs font-bold uppercase tracking-wide border-r">Owner</TableHead>
                  <TableHead className="min-w-[80px] text-xs font-bold uppercase tracking-wide border-r">Stage</TableHead>
                  <TableHead className="min-w-[90px] text-xs font-bold uppercase tracking-wide border-r">Loan Type</TableHead>
                  <TableHead className="min-w-[100px] text-xs font-bold uppercase tracking-wide">Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry, index) => (
                <TableRow key={index} className="hover:bg-muted/30 transition-colors border-b">
                  <TableCell className="font-medium text-sm border-r p-3">{inquiry["LENDER-NAME"]}</TableCell>
                  <TableCell className="border-r p-3">
                    {inquiry["LENDER-TYPE"] ? (
                      <Badge variant="outline" className="text-xs font-medium">{inquiry["LENDER-TYPE"]}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-sm border-r p-3">{inquiry["INQUIRY-DT"]}</TableCell>
                  <TableCell className="border-r p-3">
                    <Badge variant="secondary" className="text-xs font-medium whitespace-nowrap">
                      {inquiry["CREDIT-INQ-PURPS-TYPE"]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-sm border-r p-3">
                    {inquiry.AMOUNT && inquiry.AMOUNT !== "0" ? `₹${inquiry.AMOUNT}` : "-"}
                  </TableCell>
                  <TableCell className="border-r p-3">
                    <Badge variant="outline" className="text-xs font-medium">{inquiry["OWNERSHIP-TYPE"]}</Badge>
                  </TableCell>
                  <TableCell className="border-r p-3">
                    {inquiry["CREDIT-INQUIRY-STAGE"] ? (
                      <Badge variant="outline" className="text-xs font-medium">{inquiry["CREDIT-INQUIRY-STAGE"]}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="border-r p-3">
                    {inquiry["LOAN-TYPE"] ? (
                      <Badge variant="outline" className="text-xs font-medium">{inquiry["LOAN-TYPE"]}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="p-3">
                    {inquiry.REMARK ? (
                      <span className="text-sm">{inquiry.REMARK}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};