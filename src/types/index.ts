export type KanbanStatus = 'pending' | 'paid' | 'recovery';

export interface Operation {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: KanbanStatus;
  operationId: string;
  value: number;
  notes: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  operationId: string;
  type: 'meta_ads' | 'operational' | 'gateway';
  amount: number;
  date: string;
  description: string;
}

export interface GatewaySettings {
  fixedFee: number;       // R$ per transaction (default 1.69)
  percentageFee: number;  // % per transaction (default 4)
}

export interface Revenue {
  id: string;
  operationId: string;
  amount: number;
  platformFee: number;
  date: string;
  source: string;
}

export interface Partner {
  id: string;
  name: string;
  sharePercentage: number;
}

export interface DailyMetric {
  date: string;
  adSpend: number;
  revenue: number;
  operationId: string;
}
