import { useState } from 'react';
import { OperationProvider, useOperation } from './context/OperationContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { Financeiro } from './pages/Financeiro';
import { ProfitShare } from './pages/ProfitShare';
import { Layers, Settings, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const PRESET_COLORS = ['var(--color-primary)', '#10B981', '#E11D48', '#D97706', '#0891B2', '#8B5CF6', '#EC4899', '#14B8A6'];
const PRESET_ICONS = ['🚀', '⚡', '💎', '🔥', '🎯', '📦', '🌟', '💡'];

function MobileOperationSelector() {
  const { operations, selectedOperationId, setSelectedOperationId, addOperation, deleteOperation, renameOperation } = useOperation();
  const [showManager, setShowManager] = useState(false);
  const [editingOpId, setEditingOpId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showNewOp, setShowNewOp] = useState(false);
  const [newOpName, setNewOpName] = useState('');
  const [newOpColor, setNewOpColor] = useState(PRESET_COLORS[0]);
  const [newOpIcon, setNewOpIcon] = useState(PRESET_ICONS[0]);

  const handleCreateOp = () => {
    if (!newOpName.trim()) return;
    addOperation({ name: newOpName.trim(), color: newOpColor, icon: newOpIcon } as any);
    setNewOpName('');
    setShowNewOp(false);
  };

  const handleSaveEdit = (opId: string) => {
    if (editingName.trim()) renameOperation(opId, editingName);
    setEditingOpId(null);
    setEditingName('');
  };

  return (
    <>
      <div
        className="md:hidden"
        style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Layers size={16} style={{ color: 'var(--text-secondary)' }} />
        <select
          className="select-dark"
          value={selectedOperationId}
          onChange={(e) => setSelectedOperationId(e.target.value)}
          style={{ fontSize: 13, padding: '7px 10px', flex: 1 }}
        >
          <option value="all">🌐 Todas as Operações</option>
          {operations.map((op) => (
            <option key={op.id} value={op.id}>
              {op.icon} {op.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowManager(true)}
          style={{
            padding: 8,
            borderRadius: 8,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Settings size={16} />
        </button>
      </div>

      {showManager && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Gestão de Operações</h3>
              <button 
                onClick={() => setShowManager(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {operations.map((op) => (
                <div key={op.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: 8 }}>
                  {editingOpId === op.id ? (
                    <>
                      <input
                        autoFocus
                        className="input-dark"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveEdit(op.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(op.id)}
                        style={{ flex: 1, padding: '6px 8px' }}
                      />
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{op.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{op.name}</span>
                    </div>
                  )}
                  <button onClick={() => { setEditingOpId(op.id); setEditingName(op.name); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                  <button onClick={() => confirm('Deletar?') && deleteOperation(op.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            {showNewOp ? (
              <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="input-dark" placeholder="Nome" value={newOpName} onChange={(e) => setNewOpName(e.target.value)} />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewOpColor(c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: newOpColor === c ? '2px solid var(--text-primary)' : '2px solid transparent' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PRESET_ICONS.map(i => (
                    <button key={i} onClick={() => setNewOpIcon(i)} style={{ width: 32, height: 32, borderRadius: 8, background: newOpIcon === i ? 'var(--border-subtle)' : 'transparent', border: 'none', fontSize: 18 }}>{i}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleCreateOp} className="btn-primary" style={{ flex: 1 }}>Criar</button>
                  <button onClick={() => setShowNewOp(false)} className="btn-secondary">Cancelar</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowNewOp(true)}
                className="btn-secondary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}
              >
                <Plus size={16} /> Nova Operação
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddLead, setShowAddLead] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Operation Selector */}
        <MobileOperationSelector />

        {/* Header */}
        <Header activeTab={activeTab} onNewLead={() => setShowAddLead(true)} />

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            paddingBottom: '100px',
          }}
          className="md:p-8"
        >
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'pipeline' && <Pipeline />}
            {activeTab === 'financeiro' && <Financeiro />}
            {activeTab === 'profitshare' && <ProfitShare />}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '7808') {
      onLogin();
    } else {
      setError('Senha incorreta');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100dvh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-primary)'
    }}>
      <form onSubmit={handleSubmit} style={{ 
        background: 'var(--bg-secondary)', 
        padding: 32, 
        borderRadius: 12, 
        border: '1px solid var(--border-subtle)',
        width: 340,
        display: 'flex', 
        flexDirection: 'column', 
        gap: 20,
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <h1 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>CrmGL</h1>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>Acesso Restrito</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Senha de Acesso</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark"
            placeholder="••••"
            autoFocus
          />
        </div>
        
        {error && <p style={{ color: 'var(--color-danger)', fontSize: 13, textAlign: 'center', fontWeight: 500 }}>{error}</p>}
        
        <button 
          type="submit" 
          className="btn-primary"
          style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth_crmgl') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('auth_crmgl', 'true');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <OperationProvider>
      <AppContent />
    </OperationProvider>
  );
}

export default App;
