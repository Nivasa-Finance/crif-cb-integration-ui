import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Variation {
  VALUE: string;
  "REPORTED-DT": string;
  "FIRST-REPORTED-DT": string;
  "LOAN-TYPE-ASSOC": string;
  "SOURCE-INDICATOR": string;
}

interface VariationSection {
  TYPE: string;
  VARIATION: Variation[];
}

interface Employment { [key: string]: any }

interface PersonalInformationSectionProps {
  variations: VariationSection[];
  employmentDetails: Employment[];
}

const VariationItem = ({ variation }: { variation: Variation }) => (
  <div className="border border-border rounded-lg p-3 bg-accent/10 mb-3">
    <div className="flex items-center justify-between mb-2">
      <span className="font-mono text-foreground font-medium text-sm">{variation.VALUE}</span>
      <Badge variant="outline" className="text-xs">{variation["SOURCE-INDICATOR"]}</Badge>
    </div>
    <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
      <div>First Reported: {variation["FIRST-REPORTED-DT"]}</div>
      <div>Last Reported: {variation["REPORTED-DT"]}</div>
      <div>Associated: {variation["LOAN-TYPE-ASSOC"]}</div>
    </div>
  </div>
);

export const PersonalInformationSection = ({ variations, employmentDetails }: PersonalInformationSectionProps) => {
  const safeVariations: VariationSection[] = Array.isArray(variations) ? variations : [];

  // If API provides a separate employmentDetails array but not inside variations, compose a section
  const hasEmploymentInVariations = safeVariations.some(v => v.TYPE === 'EMPLOYMENT-DETAILS');
  const composed: VariationSection[] = [...safeVariations];
  if (!hasEmploymentInVariations && Array.isArray(employmentDetails) && employmentDetails.length > 0) {
    const mapped: Variation[] = employmentDetails.map((e: any) => {
      const d = e["EMPLOYMENT-DETAIL"] || e;
      return {
        VALUE: d["EMPLOYER-NAME"] || d["OCCUPATION"] || d["VALUE"] || '',
        "REPORTED-DT": d["LAST-REPORTED-DT"] || d["REPORTED-DT"] || '',
        "FIRST-REPORTED-DT": d["FIRST-REPORTED-DT"] || '',
        "LOAN-TYPE-ASSOC": d["ACCT-TYPE"] || d["LOAN-TYPE-ASSOC"] || '',
        "SOURCE-INDICATOR": d["SOURCE-INDICATOR"] || '',
      };
    });
    composed.push({ TYPE: 'EMPLOYMENT-DETAILS', VARIATION: mapped });
  }

  if (composed.length === 0) return (
    <SectionCard title="PERSONAL INFORMATION">
      <div className="p-4 text-sm text-muted-foreground">No personal information available.</div>
    </SectionCard>
  );

  return (
    <SectionCard title="PERSONAL INFORMATION">
      <Tabs defaultValue={composed[0].TYPE} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-accent/20">
          {composed.map(section => (
            <TabsTrigger key={section.TYPE} value={section.TYPE} className={`text-xs font-medium px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap`}>
              {section.TYPE.replace('-VARIATIONS', '').replace('-', ' ')}
              <span className="ml-1 text-xs text-muted-foreground">({section.VARIATION.length})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {composed.map(section => (
          <TabsContent key={section.TYPE} value={section.TYPE} className="mt-6">
            <div className="border border-border rounded-lg bg-accent/5">
              <div className="px-4 py-3 border-b border-border bg-accent/10">
                <h4 className="font-semibold text-sm text-foreground">
                  {section.TYPE.replace('-', ' ')} ({section.VARIATION.length})
                </h4>
              </div>
              <div className="p-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-0 pr-4">
                    {section.VARIATION.map((variation, index) => (
                      <VariationItem key={index} variation={variation} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </SectionCard>
  );
};