import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
interface ApplicantData {
  "FIRST-NAME": string;
  "MIDDLE-NAME": string;
  "LAST-NAME": string;
  GENDER: string;
  DOB: {
    "DOB-DT": string;
    AGE: string;
    "AGE-AS-ON": string;
  };
  IDS: {
    TYPE: string;
    VALUE: string;
  }[];
  ADDRESSES: {
    TYPE: string;
    ADDRESSTEXT: string;
    CITY: string;
    STATE: string;
    PIN: string;
    COUNTRY: string;
  }[];
  PHONES: {
    TYPE: string;
    VALUE: string;
  }[];
  EMAILS: {
    EMAIL: string;
  }[];
}
interface ApplicantInfoSectionProps {
  applicantData: ApplicantData;
}
export const ApplicantInfoSection = ({
  applicantData
}: ApplicantInfoSectionProps) => {
  const fullName = `${applicantData["FIRST-NAME"]} ${applicantData["MIDDLE-NAME"]} ${applicantData["LAST-NAME"]}`.trim();
  return <SectionCard title="Applicant Information">
      <div className="space-y-6">
        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Full Name</div>
            <div className="font-semibold text-lg">{fullName}</div>
          </div>
          <div className="bg-accent/20 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Date of Birth</div>
            <div className="font-medium">{applicantData.DOB["DOB-DT"]}</div>
          </div>
          <div className="bg-accent/20 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Age</div>
            <div className="font-medium">{applicantData.DOB.AGE} years</div>
          </div>
          {applicantData.GENDER && <div className="bg-accent/20 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Gender</div>
              <div className="font-medium">{applicantData.GENDER}</div>
            </div>}
        </div>

      </div>
    </SectionCard>;
};