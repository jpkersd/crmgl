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
    { label: 'Faturamento Bruto', value: totalRevenue, color: '#10B981', sign: '' },
    { label: 'Taxas de Plataforma', value: -totalPlatformFees, color: '#D97706', sign: '-' },
    { label: 'Gasto Meta Ads', value: -totalAdSpend, color: '#E11D48', sign: '-' },
    { label: 'Custos Operacionais', value: -totalOperational, color: '#E11D48', sign: '-' },
    { label: 'Taxas de Gateway (Auto)', value: -totalGateway, color: '#1560BD', sign: '-' },
    { label: `Impostos (${taxRate}%)`, value: -taxAmount, color: '#D97706', sign: '-' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Card */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: "'Manrope', sans-serif" }}>Divisão de Lucros</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, marginTop: 4 }}>
              {selectedOperationId === 'all' ? 'Todas as operações' : operations.find(o => o.id === selectedOperationId)?.name}
            </p>
          </div>
        </div>

        {/* Tax Rate Config */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <Percent size={16} style={{ color: 'var(--color-warning)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, fontFamily: "'Manrope', sans-serif" }}>Taxa de Impostos:</span>
          <input
            className="input-dark"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            style={{ width: 80, padding: '8px 12px', fontSize: 14, fontWeight: 600, textAlign: 'center' }}
            min={0}
            max={100}
          />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: "'Manrope', sans-serif" }}>%</span>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="glass-card animate-fade-in-up" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: "'Manrope', sans-serif" }}>
            Demonstrativo Financeiro
          </h3>
        </div>

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
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Source Sans 3', sans-serif" }}>{item.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: item.color, fontFamily: "'Manrope', sans-serif" }}>
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
              padding: '18px 0 10px',
              marginTop: 6,
              borderTop: '2px solid var(--border-default)',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>
              💎 Lucro Distribuível
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: distributableProfit > 0 ? '#10B981' : '#E11D48',
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              {formatCurrency(distributableProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Partner Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {partners.map((partner) => {
          const partnerAmount = (partner.sharePercentage / (totalShares || 1)) * distributableProfit;
          const effectiveShare = totalShares > 0 ? (partner.sharePercentage / totalShares) * 100 : 0;
          const isEditing = editingPartner === partner.id;

          return (
            <div key={partner.id} className="glass-card animate-fade-in-up" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
              {/* Background accent */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'var(--color-primary-light)', filter: 'blur(40px)' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), #0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                    {partner.name.charAt(0).toUpperCase()}
                  </div>
                  {isEditing ? (
                    <input
                      className="input-dark"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ width: 140, padding: '8px 10px', fontSize: 14 }}
                    />
                  ) : (
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: "'Manrope', sans-serif" }}>{partner.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>Sócio</p>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <button onClick={saveEdit} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: 4 }}>
                    <Check size={20} />
                  </button>
                ) : (
                  <button onClick={() => startEdit(partner)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>

              {/* Share percentage */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Participação</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        className="input-dark"
                        type="number"
                        value={editShare}
                        onChange={(e) => setEditShare(Number(e.target.value))}
                        style={{ width: 70, padding: '4px 8px', fontSize: 12, textAlign: 'center' }}
                        min={0}
                        max={100}
                      />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Manrope', sans-serif" }}>%</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', fontFamily: "'Manrope', sans-serif" }}>{effectiveShare.toFixed(0)}%</span>
                  )}
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: 7, borderRadius: 4, background: 'var(--bg-primary)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${effectiveShare}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, var(--color-primary), #0891B2)',
                      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>

              {/* Payout Value */}
              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, margin: 0, fontFamily: "'Manrope', sans-serif" }}>
                  Valor a Receber
                </p>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: partnerAmount > 0 ? '#10B981' : 'var(--color-danger)',
                    letterSpacing: '-0.01em',
                    margin: 0,
                    marginTop: 4,
                    fontFamily: "'Manrope', sans-serif",
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
        <div className="glass-card" style={{ padding: 18, borderColor: 'var(--color-warning-light)', background: 'var(--color-warning-light)', border: '1px solid var(--color-warning-light)' }}>
          <p style={{ fontSize: 13, color: '#92400e', fontWeight: 600, margin: 0, fontFamily: "'Manrope', sans-serif" }}>
            ⚠️ A soma das participações é {totalShares}%. Ajuste para totalizar 100%.
          </p>
        </div>
      )}
    </div>
  );
}
