import { useState } from 'react';
import { OperationProvider, useOperation } from './context/OperationContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { Financeiro } from './pages/Financeiro';
import { ProfitShare } from './pages/ProfitShare';
import { Layers } from 'lucide-react';

function MobileOperationSelector() {
  const { operations, selectedOperationId, setSelectedOperationId } = useOperation();

  return (
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
      <Layers size={14} style={{ color: 'var(--text-muted)' }} />
      <select
        className="select-dark"
        value={selectedOperationId}
        onChange={(e) => setSelectedOperationId(e.target.value)}
        style={{ fontSize: 12, padding: '7px 10px', flex: 1 }}
      >
        <option value="all">🌐 Todas as Operações</option>
        {operations.map((op) => (
          <option key={op.id} value={op.id}>
            {op.icon} {op.name}
          </option>
        ))}
      </select>
    </div>
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
            padding: '20px',
            paddingBottom: '100px',
          }}
          className="md:p-6"
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
    <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: 32, borderRadius: 16, border: '1px solid var(--border-subtle)', width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: 'white' }}>CrmGL</h2>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: -10 }}>Acesso Restrito</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <label style={{ fontSize: 14, color: 'var(--text-muted)' }}>Senha de Acesso</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              padding: '12px 14px', 
              borderRadius: 8, 
              border: '1px solid var(--border-subtle)', 
              background: 'var(--bg-tertiary)', 
              color: 'white',
              fontSize: 16,
              outline: 'none'
            }}
            placeholder="••••"
            autoFocus
          />
        </div>
        
        {error && <p style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>{error}</p>}
        
        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            borderRadius: 8, 
            fontWeight: 'bold', 
            background: '#6366f1', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            marginTop: 8,
            fontSize: 16
          }}
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
