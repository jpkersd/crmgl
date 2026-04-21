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
