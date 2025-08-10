import { SectionCard } from "./SectionCard";

interface Employment {
  // Add employment fields as they become available in the data
  [key: string]: any;
}

interface EmploymentSectionProps {
  employmentDetails: Employment[];
}

export const EmploymentSection = ({ employmentDetails }: EmploymentSectionProps) => {
  if (employmentDetails.length === 0) {
    return (
      <SectionCard title="Employment Details (0)">
        <div className="text-center py-8 text-muted-foreground">
          No employment details found
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={`Employment Details (${employmentDetails.length})`}>
      <div className="space-y-4">
        {employmentDetails.map((employment, index) => (
          <div key={index} className="border border-border rounded-lg p-4 bg-accent/10">
            <div className="text-sm text-muted-foreground">
              Employment record #{index + 1}
            </div>
            <pre className="text-xs mt-2 text-foreground">
              {JSON.stringify(employment, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};