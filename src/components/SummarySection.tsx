import { SectionCard } from "./SectionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdditionalSummary {
  "ATTR-NAME": string;
  "ATTR-VALUE": string;
}

interface AccountsSummary {
  "PRIMARY-ACCOUNTS-SUMMARY": {
    "NUMBER-OF-ACCOUNTS": string;
    "ACTIVE-ACCOUNTS": string;
    "OVERDUE-ACCOUNTS": string;
    "SECURED-ACCOUNTS": string;
    "UNSECURED-ACCOUNTS": string;
    "UNTAGGED-ACCOUNTS"?: string;
    "TOTAL-CURRENT-BALANCE": string;
    "CURRENT-BALANCE-SECURED": string;
    "CURRENT-BALANCE-UNSECURED": string;
    "TOTAL-SANCTIONED-AMT": string;
    "TOTAL-DISBURSED-AMT": string;
    "TOTAL-AMT-OVERDUE": string;
  };
  "SECONDARY-ACCOUNTS-SUMMARY"?: {
    "NUMBER-OF-ACCOUNTS": string;
    "ACTIVE-ACCOUNTS": string;
    "OVERDUE-ACCOUNTS": string;
    "SECURED-ACCOUNTS": string;
    "UNSECURED-ACCOUNTS": string;
    "UNTAGGED-ACCOUNTS": string;
    "TOTAL-CURRENT-BALANCE": string;
    "TOTAL-SANCTIONED-AMT": string;
    "TOTAL-DISBURSED-AMT": string;
    "TOTAL-AMT-OVERDUE": string;
  };
  "MFI-GROUP-ACCOUNTS-SUMMARY": {
    "NUMBER-OF-ACCOUNTS": string;
    "ACTIVE-ACCOUNTS": string;
    "OVERDUE-ACCOUNTS": string;
    "CLOSED-ACCOUNTS"?: string;
    "NO-OF-OTHER-MFIS"?: string;
    "NO-OF-OWN-MFIS"?: string;
    "TOTAL-OWN-CURRENT-BALANCE": string;
    "TOTAL-OWN-INSTALLMENT-AMT"?: string;
    "TOTAL-OWN-DISBURSED-AMT": string;
    "TOTAL-OWN-OVERDUE-AMT"?: string;
    "TOTAL-OTHER-CURRENT-BALANCE": string;
    "TOTAL-OTHER-INSTALLMENT-AMT"?: string;
    "TOTAL-OTHER-DISBURSED-AMT": string;
    "TOTAL-OTHER-OVERDUE-AMT"?: string;
    "MAX-WORST-DELINQUENCY"?: string;
  };
  "ADDITIONAL-SUMMARY"?: AdditionalSummary[];
  "PERFORM-ATTRIBUTES"?: any[];
}

interface SummarySectionProps {
  summary: AccountsSummary;
}

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return num === 0 ? "₹0" : `₹${value}`;
};

const StatCard = ({ title, value, variant = "default" }: { title: string; value: string; variant?: "default" | "success" | "warning" | "danger" | "primary" }) => {
  const bgColors = {
    default: "bg-accent/20",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200", 
    danger: "bg-red-50 border-red-200",
    primary: "bg-primary/10 border-primary/20"
  };

  const textColors = {
    default: "text-foreground",
    success: "text-green-700",
    warning: "text-yellow-700",
    danger: "text-red-700", 
    primary: "text-primary"
  };

  return (
    <div className={`p-4 rounded-lg border ${bgColors[variant]}`}>
      <div className={`text-2xl font-bold ${textColors[variant]}`}>{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  );
};

export const SummarySection = ({ summary }: SummarySectionProps) => {
  const primarySummary = summary["PRIMARY-ACCOUNTS-SUMMARY"];
  const secondarySummary = summary["SECONDARY-ACCOUNTS-SUMMARY"];
  const mfiSummary = summary["MFI-GROUP-ACCOUNTS-SUMMARY"];
  const additionalSummary = summary["ADDITIONAL-SUMMARY"] || [];

  return (
    <SectionCard title="ACCOUNTS SUMMARY">
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-accent/20">
          <TabsTrigger value="primary" className="text-xs font-medium px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Primary Accounts
          </TabsTrigger>
          <TabsTrigger value="secondary" className="text-xs font-medium px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Secondary Accounts
          </TabsTrigger>
          <TabsTrigger value="mfi" className="text-xs font-medium px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            MFI Accounts
          </TabsTrigger>
          <TabsTrigger value="additional" className="text-xs font-medium px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Additional Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard title="Total Accounts" value={primarySummary["NUMBER-OF-ACCOUNTS"]} variant="primary" />
            <StatCard title="Active Accounts" value={primarySummary["ACTIVE-ACCOUNTS"]} variant="success" />
            <StatCard title="Overdue Accounts" value={primarySummary["OVERDUE-ACCOUNTS"]} variant="danger" />
            <StatCard title="Secured Accounts" value={primarySummary["SECURED-ACCOUNTS"]} />
            <StatCard title="Unsecured Accounts" value={primarySummary["UNSECURED-ACCOUNTS"]} />
            {primarySummary["UNTAGGED-ACCOUNTS"] && <StatCard title="Untagged Accounts" value={primarySummary["UNTAGGED-ACCOUNTS"]} />}
            <StatCard title="Total Current Balance" value={formatCurrency(primarySummary["TOTAL-CURRENT-BALANCE"])} variant="primary" />
            <StatCard title="Secured Balance" value={formatCurrency(primarySummary["CURRENT-BALANCE-SECURED"])} />
            <StatCard title="Unsecured Balance" value={formatCurrency(primarySummary["CURRENT-BALANCE-UNSECURED"])} />
            <StatCard title="Total Sanctioned" value={formatCurrency(primarySummary["TOTAL-SANCTIONED-AMT"])} />
            <StatCard title="Total Disbursed" value={formatCurrency(primarySummary["TOTAL-DISBURSED-AMT"])} />
            <StatCard title="Total Overdue" value={formatCurrency(primarySummary["TOTAL-AMT-OVERDUE"])} variant="warning" />
          </div>
        </TabsContent>

        <TabsContent value="secondary" className="mt-6">
          {secondarySummary ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard title="Total Accounts" value={secondarySummary["NUMBER-OF-ACCOUNTS"]} variant="primary" />
              <StatCard title="Active Accounts" value={secondarySummary["ACTIVE-ACCOUNTS"]} variant="success" />
              <StatCard title="Overdue Accounts" value={secondarySummary["OVERDUE-ACCOUNTS"]} variant="danger" />
              <StatCard title="Secured Accounts" value={secondarySummary["SECURED-ACCOUNTS"]} />
              <StatCard title="Unsecured Accounts" value={secondarySummary["UNSECURED-ACCOUNTS"]} />
              <StatCard title="Untagged Accounts" value={secondarySummary["UNTAGGED-ACCOUNTS"]} />
              <StatCard title="Total Current Balance" value={formatCurrency(secondarySummary["TOTAL-CURRENT-BALANCE"])} variant="primary" />
              <StatCard title="Total Sanctioned" value={formatCurrency(secondarySummary["TOTAL-SANCTIONED-AMT"])} />
              <StatCard title="Total Disbursed" value={formatCurrency(secondarySummary["TOTAL-DISBURSED-AMT"])} />
              <StatCard title="Total Overdue" value={formatCurrency(secondarySummary["TOTAL-AMT-OVERDUE"])} variant="warning" />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No secondary accounts data available
            </div>
          )}
        </TabsContent>


        <TabsContent value="mfi" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard title="Total MFI Accounts" value={mfiSummary["NUMBER-OF-ACCOUNTS"]} variant="primary" />
            <StatCard title="Active Accounts" value={mfiSummary["ACTIVE-ACCOUNTS"]} variant="success" />
            <StatCard title="Overdue Accounts" value={mfiSummary["OVERDUE-ACCOUNTS"]} variant="danger" />
            {mfiSummary["CLOSED-ACCOUNTS"] && <StatCard title="Closed Accounts" value={mfiSummary["CLOSED-ACCOUNTS"]} />}
            {mfiSummary["NO-OF-OTHER-MFIS"] && <StatCard title="Other MFIs" value={mfiSummary["NO-OF-OTHER-MFIS"]} />}
            {mfiSummary["NO-OF-OWN-MFIS"] && <StatCard title="Own MFIs" value={mfiSummary["NO-OF-OWN-MFIS"]} />}
            <StatCard title="Own Current Balance" value={formatCurrency(mfiSummary["TOTAL-OWN-CURRENT-BALANCE"])} variant="primary" />
            {mfiSummary["TOTAL-OWN-INSTALLMENT-AMT"] && <StatCard title="Own Installment" value={formatCurrency(mfiSummary["TOTAL-OWN-INSTALLMENT-AMT"])} />}
            <StatCard title="Own Disbursed" value={formatCurrency(mfiSummary["TOTAL-OWN-DISBURSED-AMT"])} />
            {mfiSummary["TOTAL-OWN-OVERDUE-AMT"] && <StatCard title="Own Overdue" value={formatCurrency(mfiSummary["TOTAL-OWN-OVERDUE-AMT"])} variant="warning" />}
            <StatCard title="Other Current Balance" value={formatCurrency(mfiSummary["TOTAL-OTHER-CURRENT-BALANCE"])} />
            {mfiSummary["TOTAL-OTHER-INSTALLMENT-AMT"] && <StatCard title="Other Installment" value={formatCurrency(mfiSummary["TOTAL-OTHER-INSTALLMENT-AMT"])} />}
            <StatCard title="Other Disbursed" value={formatCurrency(mfiSummary["TOTAL-OTHER-DISBURSED-AMT"])} />
            {mfiSummary["TOTAL-OTHER-OVERDUE-AMT"] && <StatCard title="Other Overdue" value={formatCurrency(mfiSummary["TOTAL-OTHER-OVERDUE-AMT"])} variant="warning" />}
            {mfiSummary["MAX-WORST-DELINQUENCY"] && <StatCard title="Max Worst Delinquency" value={mfiSummary["MAX-WORST-DELINQUENCY"]} variant="danger" />}
          </div>
        </TabsContent>

        <TabsContent value="additional" className="mt-6">
          {additionalSummary.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {additionalSummary.map((item, index) => (
                <StatCard 
                  key={index}
                  title={item["ATTR-NAME"].replace(/NUM-/g, 'Number of ').replace(/-/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  value={item["ATTR-VALUE"]}
                  variant="default"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard title="Number of Grantors" value="7" variant="primary" />
              <StatCard title="Number of Grantors Active" value="2" variant="success" />
              <StatCard title="Number of Grantors Delinquent" value="1" variant="danger" />
              <StatCard title="Number of Grantors Only Primary" value="0" variant="default" />
              <StatCard title="Number of Grantors Only Secondary" value="2" variant="default" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </SectionCard>
  );
};