// Backend JSON is camelCase. AI results are snake_case (they come straight from the AI service).

export type Profile = {
  email: string;
  displayName?: string | null;
  language: string;
  monthlyObligations: number | null;
  dailySpend: number | null;
  currentBalance: number | null;
};

export type ProfileUpdate = Partial<{
  displayName: string;
  language: string;
  monthlyObligations: number;
  dailySpend: number;
  currentBalance: number;
}>;

export type IncomeResult = {
  id: string;
  receivedOn: string; // YYYY-MM-DD
  amount: number;
  spendNow: number;
  bills: number;
  savings: number; // shown to the user as "Keep"
  newBalance: number;
};

export type Forecast = {
  daysCovered: number;
  coveredUntil: string;
  expectedNextIncome: string | null;
  expectedNextAmount: number | null;
  projectedShortfall: string | null; // null = show green
  daysUntilShortfall: number | null;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  message?: string; // English only
};

export type Likelihood = 'low' | 'medium' | 'high';

export type AiResult = {
  document_type?: string;
  summary?: string;
  total_cost?: {
    principal?: number | null;
    total_repayment?: number | null;
    extra_cost?: number | null;
    effective_monthly_rate_percent?: number | null;
    assumptions?: string | null;
  } | null;
  red_flags?: string[] | null;
  scam_likelihood?: Likelihood | string;
  advice?: string[] | null;
  ai_assisted?: boolean;
  disclaimer?: string;
  extracted_text?: string; // never store or log this
};

// Shape of quote and cost is not fixed in the handover, so they are rendered generically.
export type OfferResult = {
  risk?: string;
  flags?: string[] | null;
  quote?: unknown;
  cost?: unknown;
  explanation?: string | null;
};
