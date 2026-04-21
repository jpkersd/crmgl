import { useState } from 'react';
import { useOperation } from '../context/OperationContext';
import { Plus, Trash2, Download, Filter, TrendingDown, Receipt } from 'lucide-react';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function Financeiro() {
  const { filteredExpenses, addExpense, deleteExpense, operations, selectedOperationId, gatewaySettings, setGatewaySettings } = useOperation();
  const [showForm, setShowForm] = useState(false);
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'meta_ads' | 'operational' | 'gateway'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [form, setForm] = useState({
    operationId: selectedOperationId === 'all' ? operations[0]?.id || '' : selectedOperationId,
    type: 'meta_ads' as 'meta_ads' | 'operational' | 'gateway',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    addExpense({
      operationId: form.operationId,
      type: form.type,
      amount: Number(form.amount),
      date: form.date,
      description: form.description,
    });
    setForm({ ...form, amount: '', description: '' });
    setShowForm(false);
  };

  // Filter & Sort
  let expenses = [...filteredExpenses];
  if (filterType !== 'all') {
    expenses = expenses.filter((e) => e.type === filterType);
  }
  expenses.sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'date') return mul * (a.date.localeCompare(b.date));
    return mul * (a.amount - b.amount);
  });

  const totalAds = filteredExpenses.filter((e) => e.type === 'meta_ads').reduce((s, e) => s + e.amount, 0);
  const totalOps = filteredExpenses.filter((e) => e.type === 'operational').reduce((s, e) => s + e.amount, 0);
  const totalGateway = filteredExpenses.filter((e) => e.type === 'gateway').reduce((s, e) => s + e.amount, 0);

  // CSV Export
  const exportCSV = () => {
    const header = 'Data,Tipo,Descrição,Valor\n';
    const rows = expenses.map((e) =>
      `${e.date},${e.type === 'meta_ads' ? 'Meta Ads' : e.type === 'operational' ? 'Operacional' : 'Gateway'},"${e.description}",${e.amount}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crmgl_despesas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="kpi-card animate-fade-in-up" style={{ '--kpi-accent': '#E11D48' } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={20} style={{ color: '#E11D48' }} />
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Gasto Meta Ads</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#E11D48', fontFamily: "'Manrope', sans-serif" }}>{formatCurrency(totalAds)}</p>
        </div>
        <div className="kpi-card animate-fade-in-up" style={{ '--kpi-accent': '#D97706' } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={20} style={{ color: '#D97706' }} />
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Custos Operacionais</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#D97706', fontFamily: "'Manrope', sans-serif" }}>{formatCurrency(totalOps)}</p>
        </div>
        <div className="kpi-card animate-fade-in-up" style={{ '--kpi-accent': '#1560BD' } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Filter size={20} style={{ color: '#1560BD' }} />
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Total Despesas</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#1560BD', fontFamily: "'Manrope', sans-serif" }}>{formatCurrency(totalAds + totalOps + totalGateway)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Inclui {formatCurrency(totalGateway)} de Gateway</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select
            className="select-dark"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{ width: 160, fontSize: 13, padding: '10px 12px' }}
          >
            <option value="all">Todos os tipos</option>
            <option value="meta_ads">Meta Ads</option>
            <option value="operational">Operacional</option>
            <option value="gateway">Gateway</option>
          </select>
          <select
            className="select-dark"
            value={`${sortField}-${sortDir}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split('-');
              setSortField(f as any);
              setSortDir(d as any);
            }}
            style={{ width: 160, fontSize: 13, padding: '10px 12px' }}
          >
            <option value="date-desc">Data (recente)</option>
            <option value="date-asc">Data (antigo)</option>
            <option value="amount-desc">Valor (maior)</option>
            <option value="amount-asc">Valor (menor)</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => setShowGatewayConfig(!showGatewayConfig)}>
            Config. Gateway
          </button>
          <button className="btn-secondary" onClick={exportCSV}>
            <Download size={16} />
            Exportar
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} strokeWidth={2.5} />
            Novo Gasto
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="glass-card animate-fade-in-up" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "'Manrope', sans-serif" }}>Lançar Despesa</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Operação</label>
              <select className="select-dark" value={form.operationId} onChange={(e) => setForm({ ...form, operationId: e.target.value })} style={{ fontSize: 13 }}>
                {operations.map((op) => (
                  <option key={op.id} value={op.id}>{op.icon} {op.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Tipo</label>
              <select className="select-dark" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} style={{ fontSize: 13 }}>
                <option value="meta_ads">Meta Ads</option>
                <option value="operational">Operacional</option>
                <option value="gateway">Gateway (Auto)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Data</label>
              <input className="input-dark" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Valor (R$)</label>
              <input className="input-dark" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" required style={{ fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Descrição</label>
              <input className="input-dark" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição..." required style={{ fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Salvar</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Gateway Config Panel */}
      {showGatewayConfig && (
        <div className="glass-card animate-fade-in-up" style={{ padding: 24, background: 'var(--bg-primary)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "'Manrope', sans-serif" }}>Taxas de Gateway (Automáticas)</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Estes valores são debitados automaticamente como despesa de "Gateway" quando um lead é marcado como Pago.</p>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Custo Fixo (R$)</label>
              <input 
                className="input-dark" 
                type="number" 
                step="0.01" 
                value={gatewaySettings.fixedFee} 
                onChange={(e) => setGatewaySettings({ ...gatewaySettings, fixedFee: Number(e.target.value) })} 
                style={{ width: 140, fontSize: 13 }} 
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Custo Variável (%)</label>
              <div style={{ position: 'relative', width: 140 }}>
                <input 
                  className="input-dark" 
                  type="number" 
                  step="0.01" 
                  value={gatewaySettings.percentageFee} 
                  onChange={(e) => setGatewaySettings({ ...gatewaySettings, percentageFee: Number(e.target.value) })} 
                  style={{ width: '100%', fontSize: 13, paddingRight: 28 }} 
                />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
              </div>
            </div>
            <button className="btn-secondary" onClick={() => setShowGatewayConfig(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-dark">
            <thead>
              <tr>
                <th>Data</th>
                <th>Operação</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {expenses.slice(0, 50).map((exp) => {
                const op = operations.find((o) => o.id === exp.operationId);
                return (
                  <tr key={exp.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{exp.date}</td>
                    <td>
                      {op && (
                        <span className="op-badge" style={{ background: `${op.color}15`, color: op.color, border: `1px solid ${op.color}30` }}>
                          {op.icon} {op.name}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${exp.type === 'meta_ads' ? 'badge-danger' : exp.type === 'operational' ? 'badge-warning' : 'badge-info'}`}>
                        {exp.type === 'meta_ads' ? 'Meta Ads' : exp.type === 'operational' ? 'Operacional' : 'Gateway'}
                      </span>
                    </td>
                    <td>{exp.description}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(exp.amount)}</td>
                    <td>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-danger)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
