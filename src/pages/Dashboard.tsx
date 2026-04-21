import { useOperation } from '../context/OperationContext';
import { DollarSign, TrendingUp, Target, Gem, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatCompact(value: number): string {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return formatCurrency(value);
}

export function Dashboard() {
  const { filteredExpenses, filteredRevenue, operations, selectedOperationId } = useOperation();

  // ─── KPI Calculations ─────────────────────────────────
  const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.amount, 0);
  const totalPlatformFees = filteredRevenue.reduce((sum, r) => sum + r.platformFee, 0);
  const totalAdSpend = filteredExpenses
    .filter((e) => e.type === 'meta_ads')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalOperational = filteredExpenses
    .filter((e) => e.type === 'operational')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalGateway = filteredExpenses
    .filter((e) => e.type === 'gateway')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalAdSpend + totalOperational + totalGateway;
  const netProfit = totalRevenue - totalPlatformFees - totalExpenses;
  const roi = totalAdSpend > 0 ? ((totalRevenue - totalPlatformFees - totalAdSpend) / totalAdSpend) * 100 : 0;

  // ─── Area Chart Data (last 14 days) ────────────────────
  const areaData: { date: string; adSpend: number; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    const dayRevenue = filteredRevenue
      .filter((r) => r.date === dateStr)
      .reduce((s, r) => s + r.amount, 0);
    const daySpend = filteredExpenses
      .filter((e) => e.date === dateStr && e.type === 'meta_ads')
      .reduce((s, e) => s + e.amount, 0);
    areaData.push({ date: dayLabel, adSpend: daySpend, revenue: dayRevenue });
  }

  // ─── Pie Chart Data (per operation) ────────────────────
  const pieData = operations.map((op) => {
    const opRevenue = filteredRevenue
      .filter((r) => selectedOperationId === 'all' ? r.operationId === op.id : true)
      .reduce((s, r) => s + r.amount, 0);
    return { name: op.name, value: selectedOperationId === 'all' ? opRevenue : 0, color: op.color, icon: op.icon };
  });
  // Only show pie when viewing all operations
  const showPie = selectedOperationId === 'all';
  // Recalculate for "all" view
  const pieDataAll = operations.map((op) => {
    const opRevenue = filteredRevenue
      .filter((r) => r.operationId === op.id)
      .reduce((s, r) => s + r.amount, 0);
    return { name: op.name, value: opRevenue, color: op.color, icon: op.icon };
  });

  // ─── KPI Cards ─────────────────────────────────────────
  const kpis = [
    {
      label: 'Faturamento',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      glow: 'glow-emerald',
      color: 'var(--accent-emerald)',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.15)',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Gasto Meta Ads',
      value: formatCurrency(totalAdSpend),
      icon: Target,
      glow: 'glow-rose',
      color: 'var(--accent-rose)',
      bgColor: 'rgba(244, 63, 94, 0.08)',
      borderColor: 'rgba(244, 63, 94, 0.15)',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      label: 'ROI Real',
      value: `${roi.toFixed(1)}%`,
      icon: TrendingUp,
      glow: 'glow-cyan',
      color: 'var(--accent-cyan)',
      bgColor: 'rgba(6, 182, 212, 0.08)',
      borderColor: 'rgba(6, 182, 212, 0.15)',
      trend: roi > 100 ? 'Excelente' : roi > 50 ? 'Bom' : 'Atenção',
      trendUp: roi > 50,
    },
    {
      label: 'Lucro Líquido',
      value: formatCurrency(netProfit),
      icon: Gem,
      glow: 'glow-violet',
      color: 'var(--accent-violet)',
      bgColor: 'rgba(139, 92, 246, 0.08)',
      borderColor: 'rgba(139, 92, 246, 0.15)',
      trend: netProfit > 0 ? '+Positivo' : 'Negativo',
      trendUp: netProfit > 0,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ fontSize: 12, fontWeight: 600, color: p.color, marginBottom: 2 }}>
            {p.name}: {formatCompact(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Cards */}
      <div
        className="stagger-children"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className={`glass-card ${kpi.glow} animate-fade-in-up`}
            style={{ padding: 20, position: 'relative', overflow: 'hidden' }}
          >
            {/* Background glow */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: kpi.bgColor,
                filter: 'blur(30px)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: kpi.bgColor,
                  border: `1px solid ${kpi.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  color: kpi.trendUp ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  background: kpi.trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                  padding: '3px 8px',
                  borderRadius: 6,
                }}
              >
                {kpi.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.trend}
              </span>
            </div>
            <p
              className="animate-count-up"
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: 4,
                position: 'relative',
              }}
            >
              {kpi.value}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showPie ? '1fr 380px' : '1fr',
          gap: 16,
        }}
        className="chart-grid"
      >
        {/* Area Chart */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Escala de Gastos vs Retorno</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>Últimos 14 dias</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAdSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Faturamento"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gradRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="adSpend"
                  name="Gasto Ads"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#gradAdSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart — only in "all" view */}
        {showPie && (
          <div className="glass-card animate-fade-in-up" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Distribuição por Operação</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>Faturamento total</p>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataAll}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {pieDataAll.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      background: 'rgba(255,255,255,0.97)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: 'var(--shadow-md)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {pieDataAll.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.color }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{entry.icon} {entry.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Taxas Antigas (Plataforma)</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-amber)' }}>{formatCurrency(totalPlatformFees)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Histórico</p>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Taxas de Gateway</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-violet)' }}>{formatCurrency(totalGateway)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>~{totalRevenue > 0 ? ((totalGateway / totalRevenue) * 100).toFixed(1) : 0}% do faturamento</p>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custos Operacionais</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-rose)' }}>{formatCurrency(totalOperational)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Ferramentas + Suporte</p>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Margem Líquida</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: netProfit > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Após todos os custos</p>
        </div>
      </div>
    </div>
  );
}
