
export interface CropData {
  id: string;
  name: string;
  yield: number;
  profit: number;
  revenue: number;
  costBreakdown: {
    seeds: number;
    sowing: number;
    fertilizer: number;
    labor: number;
    irrigation: number;
    pestControl: number;
    harvest: number; // Added
    transport: number; // Added
    preserve: number; // Added
    other: number;
  };
  totalCost: number;
  status?: string; 
  type?: string;   
  startDate?: string; // Added to support calculations in dashboard
  [key: string]: any;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  DASHBOARD = 'DASHBOARD',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  summary: string;
  recommendations: string[];
  profitabilityScore: number;
}

export interface KNNPrediction {
  predictedProfit: number;
  neighbors: CropData[];
  confidenceScore: number; 
}

// --- New Types for Manual Entry ---

export type TransactionType = 'EXPENSE' | 'INCOME';

// Added 'harvest', 'transport', 'preserve'
export type ExpenseCategory = 'seeds' | 'sowing' | 'fertilizer' | 'labor' | 'irrigation' | 'pestControl' | 'harvest' | 'transport' | 'preserve' | 'other';

// Added 'own_use' for income
export type IncomeCategory = 'sale' | 'own_use';

export type CropStatus = 'ACTIVE' | 'COMPLETED';

export type CropType = 'SEASONAL' | 'PERENNIAL';

export interface CropProfile {
  id: string;
  name: string; // Display Name (Combined)
  masterCrop: string; // e.g., "Maize"
  batchName?: string;  // Optional/Legacy. Now derived from dates.
  status: CropStatus; 
  type: CropType;     // Seasonal vs Perennial (Continuous)
  startDate: string;  // ISO Date String (YYYY-MM-DD)
  endDate?: string | null; // Set when completed
}

export interface Transaction {
  id: string;
  date: string;
  cropId: string;
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory; // Updated union type
  amount: number;
  description?: string;
}