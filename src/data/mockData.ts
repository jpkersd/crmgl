import type { Operation, Lead, Expense, Revenue, Partner } from '../types';

// ─── Operations ────────────────────────────────────────────
export const mockOperations: Operation[] = [
  { id: 'op-alpha', name: 'Operação Alpha', color: '#6366f1', icon: '🚀' },
  { id: 'op-beta', name: 'Operação Beta', color: '#f59e0b', icon: '⚡' },
];

// ─── Partners ──────────────────────────────────────────────
export const mockPartners: Partner[] = [
  { id: 'p1', name: 'Guilherme', sharePercentage: 50 },
  { id: 'p2', name: 'Lucas', sharePercentage: 50 },
];

// ─── Helper: generate dates ────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// ─── Leads ─────────────────────────────────────────────────
const firstNames = ['Lucas', 'Ana', 'Pedro', 'Maria', 'João', 'Carla', 'Rafael', 'Juliana', 'Bruno', 'Fernanda', 'Diego', 'Isabela', 'Thiago', 'Camila', 'Marcos', 'Letícia', 'André', 'Patrícia', 'Gabriel', 'Amanda'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Ferreira', 'Almeida', 'Rodrigues'];
const statuses: Array<'pending' | 'paid' | 'recovery'> = ['pending', 'paid', 'recovery'];

export const mockLeads: Lead[] = Array.from({ length: 24 }, (_, i) => {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[i % lastNames.length];
  const opId = i % 3 === 0 ? 'op-beta' : 'op-alpha';
  return {
    id: `lead-${i + 1}`,
    name: `${first} ${last}`,
    phone: `(11) 9${String(Math.floor(Math.random() * 90000000 + 10000000))}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@email.com`,
    status: statuses[i % 3],
    operationId: opId,
    value: [97, 197, 497, 997, 1497][i % 5],
    notes: i % 3 === 0 ? 'Lead vindo do Instagram Ads' : i % 3 === 1 ? 'Origem: tráfego orgânico' : 'Indicação de aluno',
    createdAt: daysAgo(Math.floor(Math.random() * 25)),
  };
});

// ─── Expenses ──────────────────────────────────────────────
export const mockExpenses: Expense[] = [];
for (let day = 0; day < 30; day++) {
  // Alpha daily ad spend
  mockExpenses.push({
    id: `exp-alpha-ads-${day}`,
    operationId: 'op-alpha',
    type: 'meta_ads',
    amount: randomBetween(120, 450),
    date: daysAgo(day),
    description: `Meta Ads - Campanha Alpha D${day + 1}`,
  });
  // Beta daily ad spend (lower budget)
  mockExpenses.push({
    id: `exp-beta-ads-${day}`,
    operationId: 'op-beta',
    type: 'meta_ads',
    amount: randomBetween(80, 280),
    date: daysAgo(day),
    description: `Meta Ads - Campanha Beta D${day + 1}`,
  });
  // Operational costs every 7 days
  if (day % 7 === 0) {
    mockExpenses.push({
      id: `exp-alpha-op-${day}`,
      operationId: 'op-alpha',
      type: 'operational',
      amount: randomBetween(200, 500),
      date: daysAgo(day),
      description: 'Ferramenta + Suporte',
    });
    mockExpenses.push({
      id: `exp-beta-op-${day}`,
      operationId: 'op-beta',
      type: 'operational',
      amount: randomBetween(150, 350),
      date: daysAgo(day),
      description: 'Hospedagem + Plataforma',
    });
  }
}

// ─── Revenue ───────────────────────────────────────────────
export const mockRevenue: Revenue[] = [];
for (let day = 0; day < 30; day++) {
  const alphaDaily = randomBetween(500, 2200);
  const betaDaily = randomBetween(300, 1400);
  mockRevenue.push({
    id: `rev-alpha-${day}`,
    operationId: 'op-alpha',
    amount: alphaDaily,
    platformFee: Math.round(alphaDaily * 0.0899 * 100) / 100, // ~9% Hotmart/Kiwify
    date: daysAgo(day),
    source: day % 2 === 0 ? 'Hotmart' : 'Kiwify',
  });
  mockRevenue.push({
    id: `rev-beta-${day}`,
    operationId: 'op-beta',
    amount: betaDaily,
    platformFee: Math.round(betaDaily * 0.0899 * 100) / 100,
    date: daysAgo(day),
    source: 'Hotmart',
  });
}
