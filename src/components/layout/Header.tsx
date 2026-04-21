import { useOperation } from '../../context/OperationContext';
import { Search, Bell, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onNewLead: () => void;
}

const tabTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  pipeline: 'Pipeline de Leads',
  financeiro: 'Gestão Financeira',
  profitshare: 'Divisão de Lucros',
};

export function Header({ activeTab, onNewLead }: HeaderProps) {
  const { operations, selectedOperationId } = useOperation();
  const selectedOp = operations.find((o) => o.id === selectedOperationId);

  return (
    <header
      style={{
        height: 60,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          {tabTitles[activeTab] || 'Dashboard'}
        </h1>
        {selectedOp && (
          <span
            className="op-badge"
            style={{
              background: `${selectedOp.color}12`,
              color: selectedOp.color,
              border: `1px solid ${selectedOp.color}30`,
            }}
          >
            {selectedOp.icon} {selectedOp.name}
          </span>
        )}
        {selectedOperationId === 'all' && (
          <span
            className="op-badge"
            style={{
              background: 'rgba(99,102,241,0.08)',
              color: '#6366f1',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            🌐 Visão Global
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <div style={{ position: 'relative' }} className="hidden md:block">
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Buscar..."
            className="input-dark"
            style={{
              paddingLeft: 32,
              width: 180,
              padding: '8px 12px 8px 32px',
              fontSize: 12,
            }}
          />
        </div>

        {/* Notifications */}
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s ease',
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent-rose)',
            }}
          />
        </button>

        {/* New Lead */}
        <button className="btn-primary" onClick={onNewLead} style={{ padding: '8px 16px' }}>
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden md:inline">Novo Lead</span>
        </button>
      </div>
    </header>
  );
}
