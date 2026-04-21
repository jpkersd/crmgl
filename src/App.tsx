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

function App() {
  return (
    <OperationProvider>
      <AppContent />
    </OperationProvider>
  );
}

export default App;
