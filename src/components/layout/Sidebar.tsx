import { useState } from 'react';
import { useOperation } from '../../context/OperationContext';
import {
  LayoutDashboard,
  Kanban,
  Wallet,
  Users,
  Layers,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PRESET_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#0891b2', '#7c3aed', '#ec4899', '#14b8a6'];
const PRESET_ICONS = ['🚀', '⚡', '💎', '🔥', '🎯', '📦', '🌟', '💡'];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { operations, selectedOperationId, setSelectedOperationId, addOperation, renameOperation, deleteOperation } = useOperation();
  const [showOpManager, setShowOpManager] = useState(false);
  const [editingOpId, setEditingOpId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showNewOp, setShowNewOp] = useState(false);
  const [newOpName, setNewOpName] = useState('');
  const [newOpColor, setNewOpColor] = useState(PRESET_COLORS[0]);
  const [newOpIcon, setNewOpIcon] = useState(PRESET_ICONS[0]);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pipeline', icon: Kanban, label: 'Pipeline' },
    { id: 'financeiro', icon: Wallet, label: 'Financeiro' },
    { id: 'profitshare', icon: Users, label: 'Profit Share' },
  ];

  const handleCreateOp = () => {
    if (!newOpName.trim()) return;
    addOperation({ name: newOpName.trim(), color: newOpColor, icon: newOpIcon });
    setNewOpName('');
    setShowNewOp(false);
  };

  const handleStartRename = (op: typeof operations[0]) => {
    setEditingOpId(op.id);
    setEditName(op.name);
  };

  const handleSaveRename = () => {
    if (editingOpId && editName.trim()) {
      renameOperation(editingOpId, editName.trim());
    }
    setEditingOpId(null);
  };

  const handleDeleteOp = (opId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta operação? Todos os dados associados serão removidos.')) {
      deleteOperation(opId);
    }
  };

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 animate-slide-in-left"
      style={{
        width: 260,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        height: '100%',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.02em',
              boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
            }}
          >
            GL
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              CrmGL
            </p>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Multi-Operações
            </p>
          </div>
        </div>
      </div>

      {/* Operation Selector */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Layers size={12} />
            Operação
          </label>
          <button
            onClick={() => setShowOpManager(!showOpManager)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: showOpManager ? 'var(--accent-violet)' : 'var(--text-muted)',
              padding: 2,
              borderRadius: 4,
              transition: 'all 0.2s',
            }}
            title="Gerenciar operações"
          >
            <Settings size={13} />
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <select
            className="select-dark"
            value={selectedOperationId}
            onChange={(e) => setSelectedOperationId(e.target.value)}
            style={{ fontSize: 12, padding: '9px 12px', paddingRight: 32 }}
          >
            <option value="all">🌐 Todas as Operações</option>
            {operations.map((op) => (
              <option key={op.id} value={op.id}>
                {op.icon} {op.name}
              </option>
            ))}
          </select>
        </div>

        {/* Operation Manager Panel */}
        {showOpManager && (
          <div
            className="animate-fade-in-up"
            style={{
              marginTop: 10,
              background: 'var(--bg-primary)',
              borderRadius: 12,
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
            }}
          >
            {/* Operations List */}
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {operations.map((op) => (
                <div
                  key={op.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{op.icon}</span>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: op.color,
                      flexShrink: 0,
                    }}
                  />

                  {editingOpId === op.id ? (
                    <>
                      <input
                        className="input-dark"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                        style={{ flex: 1, padding: '4px 8px', fontSize: 11, borderRadius: 6 }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveRename}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-emerald)', padding: 2 }}
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => setEditingOpId(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                      >
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {op.name}
                      </span>
                      <button
                        onClick={() => handleStartRename(op)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                        title="Renomear"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteOp(op.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', padding: 2 }}
                        title="Excluir"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {operations.length === 0 && (
                <p style={{ padding: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                  Nenhuma operação
                </p>
              )}
            </div>

            {/* New Operation Form */}
            {showNewOp ? (
              <div style={{ padding: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="input-dark"
                  placeholder="Nome da operação..."
                  value={newOpName}
                  onChange={(e) => setNewOpName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateOp()}
                  style={{ fontSize: 11, padding: '6px 10px', borderRadius: 6 }}
                  autoFocus
                />
                {/* Color picker */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewOpColor(color)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: color,
                        border: newOpColor === color ? '2px solid var(--text-primary)' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    />
                  ))}
                </div>
                {/* Icon picker */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewOpIcon(icon)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        background: newOpIcon === icon ? 'var(--border-subtle)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={handleCreateOp}
                    style={{
                      flex: 1, background: 'var(--gradient-brand)', color: 'white', border: 'none', borderRadius: 6,
                      padding: '5px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Criar
                  </button>
                  <button
                    onClick={() => { setShowNewOp(false); setNewOpName(''); }}
                    style={{
                      background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-default)', borderRadius: 6,
                      padding: '5px 10px', fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewOp(true)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'none',
                  border: 'none',
                  borderTop: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  color: 'var(--accent-violet)',
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all 0.2s',
                }}
              >
                <Plus size={12} />
                Nova Operação
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            padding: '8px 12px 8px',
          }}
        >
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#6366f1' : 'var(--text-secondary)',
                background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <item.icon
                size={16}
                strokeWidth={isActive ? 2.5 : 2}
                style={{ color: isActive ? '#6366f1' : 'var(--text-muted)', flexShrink: 0 }}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            G
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Guilherme</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
