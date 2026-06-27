// ── Tour ────────────────────────────────────────────────────────
export interface Tour {
  id: string;
  artistId: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "completed" | "cancelled";
  budgetPlanned: number;
  budgetActual: number;
  createdAt: string;
}

// ── Settlement Sheet ────────────────────────────────────────────
export interface SettlementSheet {
  id: string;
  tourId: string;
  dateId?: string;
  venueName: string;
  city?: string;
  date: string;
  grossIncome: number;
  venueExpenses: number;
  merchIncome: number;
  crewTips: number;
  otherExpenses: number;
  netIncome: number;
  notes?: string;
  promoterSigned: boolean;
  tmSigned: boolean;
  signedAt?: string;
  createdAt?: string;
}

export interface SettlementFormData {
  venueName: string;
  city: string;
  date: string;
  grossIncome: string;
  venueExpenses: string;
  merchIncome: string;
  crewTips: string;
  otherExpenses: string;
  notes: string;
}

// ── Budget Item ─────────────────────────────────────────────────
export type BudgetCategory =
  | "transport"
  | "accommodation"
  | "crew"
  | "production"
  | "hospitality"
  | "other";

export interface TourBudgetItem {
  id: string;
  tourId: string;
  category: BudgetCategory;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  date?: string;
}

export interface BudgetFormData {
  category: BudgetCategory;
  description: string;
  plannedAmount: string;
  actualAmount: string;
  date: string;
}

export const BUDGET_CATEGORIES: { value: BudgetCategory; label: string }[] = [
  { value: "transport", label: "Trasporti" },
  { value: "accommodation", label: "Alloggio" },
  { value: "crew", label: "Crew" },
  { value: "production", label: "Produzione" },
  { value: "hospitality", label: "Hospitality" },
  { value: "other", label: "Altro" },
];

// ── User ────────────────────────────────────────────────────────
export interface TourManagerUser {
  id: number;
  role: "tour_manager";
  name: string;
  email: string;
  [key: string]: unknown;
}