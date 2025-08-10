// API Configuration and Service
import { API_CONFIG, getCreditReportUrl, getCreditReportByIdUrl, buildHeaders } from '@/config/apiConfig';

export const CREDIT_REPORT_API = {
  BASE_URL: API_CONFIG.BASE_URL,
  ENDPOINTS: {
    GET_REPORT: '/credit-report',
    GET_REPORT_BY_ID: (id: string) => `/credit-report/${id}`,
  },
  HEADERS: API_CONFIG.HEADERS
};

// Example usage in your component:
// const { data, loading, error } = useCreditReport({
//   useSampleData: false,
//   apiUrl: getCreditReportUrl(),
//   reportId: "your-report-id"
// });

export interface CreditReportApiResponse {
  "B2C-REPORT": {
    "HEADER-SEGMENT": {
      "DATE-OF-REQUEST": string;
      "PREPARED-FOR": string;
      "PREPARED-FOR-ID": string;
      "DATE-OF-ISSUE": string;
      "REPORT-ID": string;
      "BATCH-ID": string;
      "STATUS": string;
      "PRODUCT-TYPE": string;
      "PRODUCT-VER": string;
    };
    "REQUEST-DATA": {
      "APPLICANT-SEGMENT": {
        "FIRST-NAME": string;
        "MIDDLE-NAME": string;
        "LAST-NAME": string;
        "GENDER": string;
        "APPLICANT-ID": string;
        "DOB": {
          "DOB-DT": string;
          "AGE": string;
          "AGE-AS-ON": string;
        };
        "IDS": Array<{
          "TYPE": string;
          "VALUE": string;
        }>;
        "ADDRESSES": Array<{
          "TYPE": string;
          "ADDRESSTEXT": string;
          "CITY": string;
          "LOCALITY"?: string;
          "STATE": string;
          "PIN": string;
          "COUNTRY": string;
        }>;
        "PHONES": Array<{
          "TYPE": string;
          "VALUE": string;
        }>;
        "EMAILS": Array<{
          "EMAIL": string;
        }>;
        "ACCOUNT-NUMBER"?: string;
      };
      "APPLICATION-SEGMENT"?: {
        "INQUIRY-UNIQUE-REF-NO": string;
        "CREDIT-RPT-ID": string | null;
        "CREDIT-RPT-TRN-DT-TM": string;
        "CREDIT-INQ-PURPS-TYPE": string | null;
        "CREDIT-INQUIRY-STAGE": string | null;
        "CLIENT-CONTRIBUTOR-ID": string;
        "BRANCH-ID": string | null;
        "APPLICATION-ID": string | null;
        "ACNT-OPEN-DT": string | null;
        "LOAN-AMT": string | null;
        "LTV": string;
        "TERM": string;
        "LOAN-TYPE": string;
      };
      "COMM-SCORE"?: any;
    };
    "REPORT-DATA": {
      "STANDARD-DATA": {
        "DEMOGS": {
          "VARIATIONS": Array<{
            "TYPE": string;
            "VARIATION": Array<{
              "VALUE": string;
              "REPORTED-DT": string;
              "FIRST-REPORTED-DT": string;
              "LOAN-TYPE-ASSOC": string;
              "SOURCE-INDICATOR": string;
            }>;
          }>;
        };
        "EMPLOYMENT-DETAILS": any[];
        "TRADELINES": Array<{
          "ACCT-NUMBER": string;
          "CREDIT-GRANTOR": string;
          "CREDIT-GRANTOR-GROUP": string;
          "CREDIT-GRANTOR-TYPE": string;
          "ACCT-TYPE": string;
          "REPORTED-DT": string;
          "OWNERSHIP-TYPE": string | null;
          "ACCOUNT-STATUS": string;
          "CLOSED-DT": string | null;
          "DISBURSED-AMT": string;
          "DISBURSED-DT": string;
          "INSTALLMENT-AMT": string | null;
          "CREDIT-LIMIT": string | null;
          "CASH-LIMIT": string | null;
          "CURRENT-BAL": string;
          "INSTALLMENT-FREQUENCY": string;
          "ORIGINAL-TERM": number;
          "TERM-TO-MATURITY": number;
          "REPAYMENT-TENURE": string | null;
          "INTEREST-RATE": string;
          "ACTUAL-PAYMENT": string | null;
          "LAST-PAYMENT-DT": string | null;
          "OVERDUE-AMT": string;
          "WRITE-OFF-AMT": string;
          "PRINCIPAL-WRITE-OFF-AMT": string | null;
          "SETTLEMENT-AMT": string | null;
          "OBLIGATION": string | null;
          "HISTORY": Array<{
            "NAME": string;
            "DATES": string;
            "VALUES": string;
          }>;
          [key: string]: any; // For additional fields
        }>;
        "INQUIRY-HISTORY": Array<{
          "LENDER-NAME": string;
          "LENDER-TYPE": string;
          "INQUIRY-DT": string;
          "OWNERSHIP-TYPE": string;
          "CREDIT-INQ-PURPS-TYPE": string;
          "CREDIT-INQUIRY-STAGE": string;
          "AMOUNT": string;
          "REMARK": string;
          "LOAN-TYPE": string;
        }>;
        "SCORE": Array<{
          "NAME": string;
          "VERSION": string | null;
          "VALUE": string;
          "DESCRIPTION": string | null;
          "FACTORS": Array<{
            "TYPE": string;
            "DESC": string;
          }>;
        }>;
      };
      "REQUESTED-SERVICES"?: any;
      "ACCOUNTS-SUMMARY": {
        "PRIMARY-ACCOUNTS-SUMMARY": {
          "NUMBER-OF-ACCOUNTS": string;
          "ACTIVE-ACCOUNTS": string;
          "OVERDUE-ACCOUNTS": string;
          "SECURED-ACCOUNTS": string;
          "UNSECURED-ACCOUNTS": string;
          "UNTAGGED-ACCOUNTS": string;
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
          "CLOSED-ACCOUNTS": string;
          "NO-OF-OTHER-MFIS": string;
          "NO-OF-OWN-MFIS": string;
          "TOTAL-OWN-CURRENT-BALANCE": string;
          "TOTAL-OWN-INSTALLMENT-AMT": string;
          "TOTAL-OWN-DISBURSED-AMT": string;
          "TOTAL-OWN-OVERDUE-AMT": string;
          "TOTAL-OTHER-CURRENT-BALANCE": string;
          "TOTAL-OTHER-INSTALLMENT-AMT": string;
          "TOTAL-OTHER-DISBURSED-AMT": string;
          "TOTAL-OTHER-OVERDUE-AMT": string;
          "MAX-WORST-DELINQUENCY": string;
        };
        "ADDITIONAL-SUMMARY"?: Array<{
          "ATTR-NAME": string;
          "ATTR-VALUE": string;
        }>;
        "PERFORM-ATTRIBUTES"?: any[];
      };
      "TRENDS"?: {
        "NAME": string;
        "DATES": string;
        "VALUES": string;
        "RESERVED1": string;
        "RESERVED2": string;
        "RESERVED3": string;
        "DESCRIPTION": string;
      };
      "ALERTS"?: any[];
    };
  };
}