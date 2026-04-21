import { useState } from 'react';
import { useOperation } from '../../context/OperationContext';
import {
  LayoutDashboard,
  Kanban,
  DollarSign,
  Users,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';

type NavTab = 'dashboard' | 'pipeline' | 'financeiro' | 'profitshare';

const PRESET_COLORS = ['var(--color-primary)', '#10B981', '#E11D48', '#D97706', '#0891B2', '#8B5CF6', '#EC4899', '#14B8A6'];
const PRESET_ICONS = ['🚀', '⚡', '💎', '🔥', '🎯', '📦', '🌟', '💡'];

export function Sidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: NavTab) => void;
}) {
  const { operations, selectedOperationId, setSelectedOperationId, addOperation, deleteOperation, renameOperation } = useOperation();
  const [showOpMenu, setShowOpMenu] = useState(false);
  const [editingOpId, setEditingOpId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  const [showNewOp, setShowNewOp] = useState(false);
  const [newOpName, setNewOpName] = useState('');
  const [newOpColor, setNewOpColor] = useState(PRESET_COLORS[0]);
  const [newOpIcon, setNewOpIcon] = useState(PRESET_ICONS[0]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'profitshare', label: 'Profit Share', icon: Users },
  ] as const;

  const handleCreateOp = () => {
    if (!newOpName.trim()) return;
    addOperation({ name: newOpName.trim(), color: newOpColor, icon: newOpIcon } as any);
    setNewOpName('');
    setShowNewOp(false);
  };

  const handleEditOperation = (opId: string, currentName: string) => {
    setEditingOpId(opId);
    setEditingName(currentName);
  };

  const handleSaveEdit = (opId: string) => {
    if (editingName.trim()) {
      renameOperation(opId, editingName);
    }
    setEditingOpId(null);
    setEditingName('');
  };

  return (
    <aside
      style={{
        width: 260,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      className="hidden md:flex"
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--color-primary)',
          margin: 0,
          fontFamily: "'Manrope', sans-serif",
        }}>
          CrmGL
        </h2>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as NavTab)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === item.id ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === item.id ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === item.id ? 600 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              fontFamily: "'Source Sans 3', sans-serif",
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) {
                e.currentTarget.style.background = 'var(--bg-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Operations Section */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 8px' }}>
        <button
          onClick={() => setShowOpMenu(!showOpMenu)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            fontFamily: "'Source Sans 3', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Operações
          <ChevronDown size={14} style={{ transform: showOpMenu ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
        </button>

        {showOpMenu && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* All Operations Option */}
            <button
              onClick={() => setSelectedOperationId('all')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: selectedOperationId === 'all' ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                background: selectedOperationId === 'all' ? 'var(--color-primary-light)' : 'transparent',
                color: selectedOperationId === 'all' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: "'Source Sans 3', sans-serif",
                transition: 'all 0.2s ease',
              }}
            >
              🌐 Todas
            </button>

            {/* Individual Operations */}
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {operations.map((op) => (
                <div
                  key={op.id}
                  style={{
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                  }}
                >
                  {editingOpId === op.id ? (
                    <input
                      autoFocus
                      type="text"
                      className="input-dark"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveEdit(op.id)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(op.id);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: '1px solid var(--color-primary)',
                        fontSize: 12,
                        fontFamily: "'Source Sans 3', sans-serif",
                        outline: 'none',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setSelectedOperationId(op.id)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: selectedOperationId === op.id ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                        background: selectedOperationId === op.id ? 'var(--color-primary-light)' : 'transparent',
                        color: selectedOperationId === op.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: selectedOperationId === op.id ? 600 : 400,
                        cursor: 'pointer',
                        fontSize: 12,
                        textAlign: 'left',
                        fontFamily: "'Source Sans 3', sans-serif",
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {op.icon} {op.name}
                    </button>
                  )}
                  <button
                    onClick={() => handleEditOperation(op.id, op.name)}
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)' }
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)' }
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Deletar operação "${op.name}"?`)) {
                        deleteOperation(op.id);
                      }
                    }}
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)' }
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)' }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Operation */}
            {showNewOp ? (
              <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <input
                  className="input-dark"
                  placeholder="Nome da operação..."
                  value={newOpName}
                  onChange={(e) => setNewOpName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateOp()}
                  style={{ fontSize: 12, padding: '8px 10px', borderRadius: 6 }}
                  autoFocus
                />
                
                {/* Color picker */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewOpColor(color)}
                      style={{
                        width: 20,
                        height: 20,
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
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button
                    onClick={handleCreateOp}
                    className="btn-primary"
                    style={{ flex: 1, padding: '6px 0', fontSize: 12, borderRadius: 6 }}
                  >
                    Criar
                  </button>
                  <button
                    onClick={() => { setShowNewOp(false); setNewOpName(''); }}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: 12, borderRadius: 6 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewOp(true)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px dashed var(--border-default)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: "'Source Sans 3', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                  marginTop: 4
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Plus size={14} /> Adicionar
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
