import { useOperation } from '../context/OperationContext';
import { useState } from 'react';
import { Users, Percent, DollarSign, TrendingUp, Edit3, Check } from 'lucide-react';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function ProfitShare() {
  const { filteredRevenue, filteredExpenses, partners, setPartners, operations, selectedOperationId } = useOperation();
  const [taxRate, setTaxRate] = useState(15);
  const [editingPartner, setEditingPartner] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editShare, setEditShare] = useState(0);

  // ─── Calculations ──────────────────────────────────────
  const totalRevenue = filteredRevenue.reduce((s, r) => s + r.amount, 0);
  const totalPlatformFees = filteredRevenue.reduce((s, r) => s + r.platformFee, 0);
  const totalAdSpend = filteredExpenses.filter((e) => e.type === 'meta_ads').reduce((s, e) => s + e.amount, 0);
  const totalOperational = filteredExpenses.filter((e) => e.type === 'operational').reduce((s, e) => s + e.amount, 0);
  const totalGateway = filteredExpenses.filter((e) => e.type === 'gateway').reduce((s, e) => s + e.amount, 0);

  const revenueAfterFees = totalRevenue - totalPlatformFees;
  const totalExpenses = totalAdSpend + totalOperational + totalGateway;
  const profitBeforeTax = revenueAfterFees - totalExpenses;
  const taxAmount = Math.max(0, profitBeforeTax * (taxRate / 100));
  const distributableProfit = Math.max(0, profitBeforeTax - taxAmount);

  const totalShares = partners.reduce((s, p) => s + p.sharePercentage, 0);

  const startEdit = (partner: typeof partners[0]) => {
    setEditingPartner(partner.id);
    setEditName(partner.name);
    setEditShare(partner.sharePercentage);
  };

  const saveEdit = () => {
    if (!editingPartner) return;
    setPartners(partners.map((p) =>
      p.id === editingPartner ? { ...p, name: editName, sharePercentage: editShare } : p
    ));
    setEditingPartner(null);
  };

  // Breakdown items
  const breakdownItems = [
    { label: 'Faturamento Bruto', value: totalRevenue, color: 'var(--accent-emerald)', sign: '' },
    { label: 'Taxas de Plataforma', value: -totalPlatformFees, color: 'var(--accent-amber)', sign: '-' },
    { label: 'Gasto Meta Ads', value: -totalAdSpend, color: 'var(--accent-rose)', sign: '-' },
    { label: 'Custos Operacionais', value: -totalOperational, color: 'var(--accent-rose)', sign: '-' },
    { label: 'Taxas de Gateway (Auto)', value: -totalGateway, color: 'var(--accent-violet)', sign: '-' },
    { label: `Impostos (${taxRate}%)`, value: -taxAmount, color: 'var(--accent-amber)', sign: '-' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} style={{ color: 'var(--accent-violet)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Divisão de Lucros</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {selectedOperationId === 'all' ? 'Todas as operações' : operations.find(o => o.id === selectedOperationId)?.name}
            </p>
          </div>
        </div>

        {/* Tax Rate Config */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <Percent size={14} style={{ color: 'var(--accent-amber)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Taxa de Impostos:</span>
          <input
            className="input-dark"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            style={{ width: 70, padding: '6px 10px', fontSize: 13, fontWeight: 600, textAlign: 'center' }}
            min={0}
            max={100}
          />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>%</span>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="glass-card animate-fade-in-up" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
          Demonstrativo Financeiro
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {breakdownItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>
                {item.sign} {formatCurrency(Math.abs(item.value))}
              </span>
            </div>
          ))}

          {/* Distributable Profit */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0 8px',
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
              💎 Lucro Distribuível
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                background: distributableProfit > 0 ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #f43f5e, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatCurrency(distributableProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Partner Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {partners.map((partner) => {
          const partnerAmount = (partner.sharePercentage / (totalShares || 1)) * distributableProfit;
          const effectiveShare = totalShares > 0 ? (partner.sharePercentage / totalShares) * 100 : 0;
          const isEditing = editingPartner === partner.id;

          return (
            <div key={partner.id} className="glass-card glow-violet animate-fade-in-up" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
              {/* Background accent */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(30px)' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
                    {partner.name.charAt(0)}
                  </div>
                  {isEditing ? (
                    <input
                      className="input-dark"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ width: 120, padding: '6px 10px', fontSize: 14 }}
                    />
                  ) : (
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{partner.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sócio</p>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <button onClick={saveEdit} style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer' }}>
                    <Check size={18} />
                  </button>
                ) : (
                  <button onClick={() => startEdit(partner)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Edit3 size={14} />
                  </button>
                )}
              </div>

              {/* Share percentage */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Participação</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        className="input-dark"
                        type="number"
                        value={editShare}
                        onChange={(e) => setEditShare(Number(e.target.value))}
                        style={{ width: 60, padding: '4px 8px', fontSize: 12, textAlign: 'center' }}
                        min={0}
                        max={100}
                      />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>%</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-violet)' }}>{effectiveShare.toFixed(0)}%</span>
                  )}
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--bg-primary)' }}>
                  <div
                    style={{
                      width: `${effectiveShare}%`,
                      height: '100%',
                      borderRadius: 3,
                      background: 'var(--gradient-brand)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>

              {/* Payout Value */}
              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Valor a Receber
                </p>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    background: partnerAmount > 0 ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {formatCurrency(partnerAmount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning if shares don't add up */}
      {totalShares !== 100 && (
        <div className="glass-card" style={{ padding: 16, borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
          <p style={{ fontSize: 12, color: 'var(--accent-amber)', fontWeight: 600 }}>
            ⚠️ A soma das participações é {totalShares}%. Ajuste para totalizar 100%.
          </p>
        </div>
      )}
    </div>
  );
}
