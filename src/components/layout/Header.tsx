import React, { useState } from 'react';
import { useOperation } from '../../context/OperationContext';
import { Search, Plus, Bell } from 'lucide-react';

export function Header({ activeTab, onNewLead }: { activeTab: string; onNewLead: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'pipeline': return 'Pipeline';
      case 'financeiro': return 'Financeiro';
      case 'profitshare': return 'Profit Share';
      default: return 'CrmGL';
    }
  };

  return (
    <header
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}
    >
      <div>
        <h1 style={{
          fontSize: 20,
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: "'Manrope', sans-serif",
          margin: 0
        }}>
          {getTabTitle()}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, maxWidth: 400 }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            paddingLeft: 12,
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = 'var(--focus-ring)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '10px 12px',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={onNewLead}
          className="btn-primary"
          style={{
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
          }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo Lead</span>
        </button>

        <button
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-primary)';
          }}
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
