import { LayoutDashboard, Kanban, Wallet, Users } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'pipeline', icon: Kanban, label: 'Leads' },
    { id: 'financeiro', icon: Wallet, label: 'Finanças' },
    { id: 'profitshare', icon: Users, label: 'Lucros' },
  ];

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: 10,
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#6366f1' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              flex: 1,
            }}
          >
            <div
              style={{
                padding: 4,
                borderRadius: 8,
                background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
              }}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
