import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";

interface Address {
  TYPE: string;
  ADDRESSTEXT: string;
  CITY: string;
  STATE: string;
  PIN: string;
  COUNTRY: string;
  "REPORTED-DT"?: string;
  "FIRST-REPORTED-DT"?: string;
}

interface AddressSectionProps {
  addresses: Address[];
}

export const AddressSection = ({ addresses }: AddressSectionProps) => {
  return (
    <SectionCard title="Address Variations">
      <div className="space-y-3">
        {addresses.map((address, index) => (
          <div key={index} className="border border-border rounded-lg p-4 bg-accent/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium text-foreground">{address.ADDRESSTEXT}</p>
                <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                  {address.CITY && <span>City: {address.CITY}</span>}
                  {address.STATE && <span>State: {address.STATE}</span>}
                  {address.PIN && <span>PIN: {address.PIN}</span>}
                </div>
              </div>
              <Badge variant="secondary">{address.TYPE}</Badge>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              {address["REPORTED-DT"] && (
                <span>Last Reported: {address["REPORTED-DT"]}</span>
              )}
              {address["FIRST-REPORTED-DT"] && (
                <span>First Reported: {address["FIRST-REPORTED-DT"]}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};