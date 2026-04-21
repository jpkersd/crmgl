import { useState } from 'react';
import { useOperation } from '../context/OperationContext';
import { Plus, Trash2, Download, Filter, Receipt, TrendingDown } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="glass-card glow-rose animate-fade-in-up" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={16} style={{ color: 'var(--accent-rose)' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gasto Meta Ads</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-rose)' }}>{formatCurrency(totalAds)}</p>
        </div>
        <div className="glass-card glow-amber animate-fade-in-up" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={16} style={{ color: 'var(--accent-amber)' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custos Operacionais</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-amber)' }}>{formatCurrency(totalOps)}</p>
        </div>
        <div className="glass-card animate-fade-in-up" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Despesas</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(totalAds + totalOps + totalGateway)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Inclui {formatCurrency(totalGateway)} de Gateway
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            className="select-dark"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{ width: 160, fontSize: 12, padding: '8px 12px' }}
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
            style={{ width: 160, fontSize: 12, padding: '8px 12px' }}
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
            <Download size={14} />
            Exportar
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} strokeWidth={2.5} />
            Novo Gasto
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="glass-card animate-fade-in-up" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Lançar Despesa</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operação</label>
              <select className="select-dark" value={form.operationId} onChange={(e) => setForm({ ...form, operationId: e.target.value })} style={{ fontSize: 12 }}>
                {operations.map((op) => (
                  <option key={op.id} value={op.id}>{op.icon} {op.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo</label>
              <select className="select-dark" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} style={{ fontSize: 12 }}>
                <option value="meta_ads">Meta Ads</option>
                <option value="operational">Operacional</option>
                <option value="gateway">Gateway (Auto)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data</label>
              <input className="input-dark" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor (R$)</label>
              <input className="input-dark" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" required style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descrição</label>
              <input className="input-dark" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição..." required style={{ fontSize: 12 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Salvar</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>×</button>
            </div>
          </form>
        </div>
      )}

      {/* Gateway Config Panel */}
      {showGatewayConfig && (
        <div className="glass-card animate-fade-in-up" style={{ padding: 20, background: 'var(--bg-primary)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Taxas de Gateway (Automáticas)</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Estes valores são debitados automaticamente como despesa de "Gateway" quando um lead é marcado como Pago.</p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custo Fixo (R$)</label>
              <input 
                className="input-dark" 
                type="number" 
                step="0.01" 
                value={gatewaySettings.fixedFee} 
                onChange={(e) => setGatewaySettings({ ...gatewaySettings, fixedFee: Number(e.target.value) })} 
                style={{ width: 120, fontSize: 12 }} 
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custo Variável (%)</label>
              <div style={{ position: 'relative', width: 120 }}>
                <input 
                  className="input-dark" 
                  type="number" 
                  step="0.01" 
                  value={gatewaySettings.percentageFee} 
                  onChange={(e) => setGatewaySettings({ ...gatewaySettings, percentageFee: Number(e.target.value) })} 
                  style={{ width: '100%', fontSize: 12, paddingRight: 24 }} 
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <button className="btn-secondary" onClick={() => setShowGatewayConfig(false)}>Fechar</button>
            </div>
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
                        <span className="op-badge" style={{ background: `${op.color}12`, color: op.color, border: `1px solid ${op.color}25` }}>
                          {op.icon} {op.name}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: exp.type === 'meta_ads' ? 'rgba(244,63,94,0.1)' : exp.type === 'operational' ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)',
                        color: exp.type === 'meta_ads' ? 'var(--accent-rose)' : exp.type === 'operational' ? 'var(--accent-amber)' : 'var(--accent-violet)',
                      }}>
                        {exp.type === 'meta_ads' ? 'Meta Ads' : exp.type === 'operational' ? 'Operacional' : 'Gateway'}
                      </span>
                    </td>
                    <td>{exp.description}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(exp.amount)}</td>
                    <td>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
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
