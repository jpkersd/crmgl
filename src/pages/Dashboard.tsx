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
  
  const showPie = selectedOperationId === 'all';
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
      color: '#10B981',
      bgColor: 'var(--color-success-light)',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Gasto Meta Ads',
      value: formatCurrency(totalAdSpend),
      icon: Target,
      color: '#E11D48',
      bgColor: 'var(--color-danger-light)',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      label: 'ROI Real',
      value: `${roi.toFixed(1)}%`,
      icon: TrendingUp,
      color: '#0891B2',
      bgColor: 'var(--color-info-light)',
      trend: roi > 100 ? 'Excelente' : roi > 50 ? 'Bom' : 'Atenção',
      trendUp: roi > 50,
    },
    {
      label: 'Lucro Líquido',
      value: formatCurrency(netProfit),
      icon: Gem,
      color: '#1560BD',
      bgColor: 'var(--color-primary-light)',
      trend: netProfit > 0 ? '+Positivo' : 'Negativo',
      trendUp: netProfit > 0,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
          fontFamily: "'Source Sans 3', sans-serif",
        }}
      >
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ fontSize: 12, fontWeight: 600, color: p.color, marginBottom: 2 }}>
            {p.name}: {formatCompact(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards Grid */}
      <div
        className="stagger-children"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="kpi-card animate-fade-in-up"
            style={{ '--kpi-accent': kpi.color } as React.CSSProperties}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: kpi.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: kpi.trendUp ? '#10B981' : '#E11D48',
                  background: kpi.trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(225,29,72,0.1)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                {kpi.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.trend}
              </span>
            </div>
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                marginBottom: 6,
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              {kpi.value}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showPie ? '1fr 380px' : '1fr',
          gap: 20,
        }}
        className="chart-grid"
      >
        {/* Area Chart */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: 4,
              fontFamily: "'Manrope', sans-serif",
            }}>
              Escala de Gastos vs Retorno
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Últimos 14 dias</p>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAdSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Faturamento"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#gradRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="adSpend"
                  name="Gasto Ads"
                  stroke="#E11D48"
                  strokeWidth={2}
                  fill="url(#gradAdSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        {showPie && (
          <div className="glass-card animate-fade-in-up" style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: 4,
                fontFamily: "'Manrope', sans-serif",
              }}>
                Distribuição por Operação
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Faturamento total</p>
            </div>
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
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: 'var(--shadow-md)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
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

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Taxas Antigas</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#D97706', fontFamily: "'Manrope', sans-serif", marginBottom: 4 }}>{formatCurrency(totalPlatformFees)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Histórico</p>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Taxas de Gateway</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#1560BD', fontFamily: "'Manrope', sans-serif", marginBottom: 4 }}>{formatCurrency(totalGateway)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>~{totalRevenue > 0 ? ((totalGateway / totalRevenue) * 100).toFixed(1) : 0}% do faturamento</p>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Custos Operacionais</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#E11D48', fontFamily: "'Manrope', sans-serif", marginBottom: 4 }}>{formatCurrency(totalOperational)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ferramentas + Suporte</p>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Margem Líquida</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: netProfit > 0 ? '#10B981' : '#E11D48', fontFamily: "'Manrope', sans-serif", marginBottom: 4 }}>
            {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Após todos os custos</p>
        </div>
      </div>
    </div>
  );
}
