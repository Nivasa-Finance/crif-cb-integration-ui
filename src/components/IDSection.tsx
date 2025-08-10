import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";

interface IDVariation {
  VALUE: string;
  "REPORTED-DT": string;
  "FIRST-REPORTED-DT": string;
  "LOAN-TYPE-ASSOC": string;
  "SOURCE-INDICATOR": string;
}

interface IDSectionProps {
  variations: { TYPE: string; VARIATION: IDVariation[] }[];
}

export const IDSection = ({ variations }: IDSectionProps) => {
  return (
    <SectionCard title="ID Variations">
      <div className="space-y-4">
        {variations.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
              {section.TYPE.replace('-', ' ')}
            </h4>
            <div className="space-y-2">
              {section.VARIATION.map((variation, index) => (
                <div key={index} className="border border-border rounded-lg p-3 bg-accent/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-foreground font-medium">{variation.VALUE}</span>
                    <Badge variant="outline">{variation["SOURCE-INDICATOR"]}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>First Reported: {variation["FIRST-REPORTED-DT"]}</div>
                    <div>Last Reported: {variation["REPORTED-DT"]}</div>
                    <div className="col-span-2">Associated: {variation["LOAN-TYPE-ASSOC"]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};