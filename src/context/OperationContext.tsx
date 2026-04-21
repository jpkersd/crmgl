import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { mockOperations, mockLeads, mockExpenses, mockRevenue, mockPartners } from '../data/mockData';
import type { Operation, Lead, Expense, Revenue, Partner, KanbanStatus, GatewaySettings } from '../types';

interface OperationContextType {
  operations: Operation[];
  selectedOperationId: string; // 'all' or specific id
  setSelectedOperationId: (id: string) => void;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  revenue: Revenue[];
  setRevenue: React.Dispatch<React.SetStateAction<Revenue[]>>;
  partners: Partner[];
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  // Filtered data based on selected operation
  filteredLeads: Lead[];
  filteredExpenses: Expense[];
  filteredRevenue: Revenue[];
  gatewaySettings: GatewaySettings;
  setGatewaySettings: React.Dispatch<React.SetStateAction<GatewaySettings>>;
  // Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLeadStatus: (leadId: string, status: KanbanStatus) => void;
  deleteLead: (leadId: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (expenseId: string) => void;
  addOperation: (op: Omit<Operation, 'id'>) => void;
  renameOperation: (opId: string, newName: string) => void;
  deleteOperation: (opId: string) => void;
}

const OperationContext = createContext<OperationContextType | undefined>(undefined);

export function OperationProvider({ children }: { children: ReactNode }) {
  const [operations, setOperations] = useLocalStorage<Operation[]>('crmgl-operations', mockOperations);
  const [selectedOperationId, setSelectedOperationId] = useLocalStorage<string>('crmgl-selected-op', 'all');
  const [leads, setLeads] = useLocalStorage<Lead[]>('crmgl-leads', mockLeads);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('crmgl-expenses', mockExpenses);
  const [revenue, setRevenue] = useLocalStorage<Revenue[]>('crmgl-revenue', mockRevenue);
  const [partners, setPartners] = useLocalStorage<Partner[]>('crmgl-partners', mockPartners);
  const [gatewaySettings, setGatewaySettings] = useLocalStorage<GatewaySettings>('crmgl-gateway-settings', { fixedFee: 1.69, percentageFee: 4 });

  const filterByOp = <T extends { operationId: string }>(items: T[]): T[] => {
    if (selectedOperationId === 'all') return items;
    return items.filter(i => i.operationId === selectedOperationId);
  };

  const filteredLeads = filterByOp(leads);
  const filteredExpenses = filterByOp(expenses);
  const filteredRevenue = filterByOp(revenue);

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    if (newLead.status === 'paid') {
      const newRevenue: Revenue = {
        id: `rev-auto-${Date.now()}`,
        operationId: newLead.operationId,
        amount: newLead.value,
        platformFee: 0,
        date: new Date().toISOString().slice(0, 10),
        source: 'Automático'
      };
      setRevenue(r => [newRevenue, ...r]);

      const expenseAmount = gatewaySettings.fixedFee + (newLead.value * (gatewaySettings.percentageFee / 100));
      const newExpense: Expense = {
        id: `exp-auto-${Date.now()}`,
        operationId: newLead.operationId,
        type: 'gateway',
        amount: expenseAmount,
        date: new Date().toISOString().slice(0, 10),
        description: `Taxa Gateway - ${newLead.name}`
      };
      setExpenses(e => [newExpense, ...e]);
    }

    setLeads(prev => [newLead, ...prev]);
  };

  const updateLeadStatus = (leadId: string, status: KanbanStatus) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (lead.status !== 'paid' && status === 'paid') {
      const newRevenue: Revenue = {
        id: `rev-auto-${Date.now()}`,
        operationId: lead.operationId,
        amount: lead.value,
        platformFee: 0,
        date: new Date().toISOString().slice(0, 10),
        source: 'Automático'
      };
      setRevenue(r => [newRevenue, ...r]);

      const expenseAmount = gatewaySettings.fixedFee + (lead.value * (gatewaySettings.percentageFee / 100));
      const newExpense: Expense = {
        id: `exp-auto-${Date.now()}`,
        operationId: lead.operationId,
        type: 'gateway',
        amount: expenseAmount,
        date: new Date().toISOString().slice(0, 10),
        description: `Taxa Gateway - ${lead.name}`
      };
      setExpenses(e => [newExpense, ...e]);
    }

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const deleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = { ...expData, id: `exp-${Date.now()}` };
    setExpenses(prev => [newExp, ...prev]);
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const addOperation = (opData: Omit<Operation, 'id'>) => {
    const newOp: Operation = { ...opData, id: `op-${Date.now()}` };
    setOperations(prev => [...prev, newOp]);
  };

  const renameOperation = (opId: string, newName: string) => {
    setOperations(prev => prev.map(op => op.id === opId ? { ...op, name: newName } : op));
  };

  const deleteOperation = (opId: string) => {
    setOperations(prev => prev.filter(op => op.id !== opId));
    // Reset selection if the deleted operation was selected
    if (selectedOperationId === opId) {
      setSelectedOperationId('all');
    }
    // Also remove all data associated with the deleted operation
    setLeads(prev => prev.filter(l => l.operationId !== opId));
    setExpenses(prev => prev.filter(e => e.operationId !== opId));
    setRevenue(prev => prev.filter(r => r.operationId !== opId));
  };

  return (
    <OperationContext.Provider value={{
      operations,
      selectedOperationId,
      setSelectedOperationId,
      leads, setLeads,
      expenses, setExpenses,
      revenue, setRevenue,
      partners, setPartners,
      gatewaySettings, setGatewaySettings,
      filteredLeads,
      filteredExpenses,
      filteredRevenue,
      addLead,
      updateLeadStatus,
      deleteLead,
      addExpense,
      deleteExpense,
      addOperation,
      renameOperation,
      deleteOperation,
    }}>
      {children}
    </OperationContext.Provider>
  );
}

export function useOperation() {
  const ctx = useContext(OperationContext);
  if (!ctx) throw new Error('useOperation must be used inside OperationProvider');
  return ctx;
}
