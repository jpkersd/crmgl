import { useState, useRef } from 'react';
import { useOperation } from '../context/OperationContext';
import type { KanbanStatus } from '../types';
import { Plus, Phone, Mail, Clock, X, GripVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const columns: { id: KanbanStatus; label: string; color: string; bgColor: string }[] = [
  { id: 'pending', label: 'Pendente', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)' },
  { id: 'paid', label: 'Pago', color: '#10b981', bgColor: 'rgba(16,185,129,0.08)' },
  { id: 'recovery', label: 'Recuperação', color: '#f43f5e', bgColor: 'rgba(244,63,94,0.08)' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

interface AddLeadModalProps {
  onClose: () => void;
}

function AddLeadModal({ onClose }: AddLeadModalProps) {
  const { addLead, operations, selectedOperationId } = useOperation();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    operationId: selectedOperationId === 'all' ? operations[0]?.id || '' : selectedOperationId,
    value: 197,
    notes: '',
    status: 'pending' as KanbanStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addLead(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Novo Lead</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome *</label>
            <input className="input-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do lead" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Telefone</label>
              <input className="input-dark" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 9..." />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input className="input-dark" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@..." />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operação</label>
              <select className="select-dark" value={form.operationId} onChange={(e) => setForm({ ...form, operationId: e.target.value })}>
                {operations.map((op) => (
                  <option key={op.id} value={op.id}>{op.icon} {op.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor (R$)</label>
              <input className="input-dark" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
              <select className="select-dark" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as KanbanStatus })}>
                {columns.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas</label>
              <textarea className="input-dark" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observações..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Criar Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Pipeline() {
  const { filteredLeads, updateLeadStatus, deleteLead, operations } = useOperation();
  const [showModal, setShowModal] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<KanbanStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: KanbanStatus) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent, colId: KanbanStatus) => {
    e.preventDefault();
    if (draggedId) {
      updateLeadStatus(draggedId, colId);
    }
    setDraggedId(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverCol(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {filteredLeads.length} leads no funil
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} strokeWidth={2.5} />
          Novo Lead
        </button>
      </div>

      {/* Kanban Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          flex: 1,
          minHeight: 0,
          overflowX: 'auto',
        }}
        className="kanban-grid"
      >
        {columns.map((col) => {
          const colLeads = filteredLeads.filter((l) => l.status === col.id);
          const colTotal = colLeads.reduce((s, l) => s + l.value, 0);

          return (
            <div
              key={col.id}
              className={`kanban-column ${dragOverCol === col.id ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{col.label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: col.color,
                      background: col.bgColor,
                      padding: '2px 7px',
                      borderRadius: 5,
                    }}
                  >
                    {colLeads.length}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {formatCurrency(colTotal)}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
                {colLeads.map((lead) => {
                  const op = operations.find((o) => o.id === lead.operationId);
                  return (
                    <div
                      key={lead.id}
                      className={`kanban-card ${draggedId === lead.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onDragStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Tem certeza que deseja excluir este lead?')) {
                                deleteLead(lead.id);
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: 2, position: 'relative', zIndex: 10 }}
                            title="Excluir Lead"
                          >
                            <Trash2 size={13} style={{ pointerEvents: 'none' }} />
                          </button>
                          <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, cursor: 'grab' }} />
                        </div>
                      </div>

                      {op && (
                        <span
                          className="op-badge"
                          style={{
                            background: `${op.color}12`,
                            color: op.color,
                            border: `1px solid ${op.color}25`,
                            marginBottom: 8,
                          }}
                        >
                          {op.icon} {op.name}
                        </span>
                      )}

                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-emerald)', margin: '8px 0' }}>
                        {formatCurrency(lead.value)}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {lead.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Phone size={10} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Mail size={10} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                        <Clock size={10} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {colLeads.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                      Arraste leads<br />para cá
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <AddLeadModal onClose={() => setShowModal(false)} />}

      <style>{`
        @media (max-width: 768px) {
          .kanban-grid {
            grid-template-columns: repeat(3, 280px) !important;
            overflow-x: auto !important;
            padding-bottom: 80px;
          }
        }
      `}</style>
    </div>
  );
}
