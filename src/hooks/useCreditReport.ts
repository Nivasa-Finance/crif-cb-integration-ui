import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/services/httpClient';

interface CreditReportData {
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
    };
    "REPORT-DATA": any;
  };
}

interface UseCreditReportOptions {
  apiUrl?: string;
  reportId?: string;
}

export const useCreditReport = (options: UseCreditReportOptions = {}) => {
  const [data, setData] = useState<CreditReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiUrl, reportId } = options;

  const fetchCreditReport = useCallback(async (url: string, id?: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = id ? `${url}/${id}` : url;
      const response = await apiFetch(endpoint, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result: CreditReportData = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching the credit report';
      setError(errorMessage);
      console.error('Error fetching credit report:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (apiUrl) fetchCreditReport(apiUrl, reportId);
  }, [apiUrl, reportId, fetchCreditReport]);

  useEffect(() => {
    if (apiUrl) {
      fetchCreditReport(apiUrl, reportId);
    }
  }, [apiUrl, reportId, fetchCreditReport]);

  return { data, loading, error, refetch, fetchCreditReport };
};