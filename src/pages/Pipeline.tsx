import { useState, useRef } from 'react';
import { useOperation } from '../context/OperationContext';
import type { KanbanStatus } from '../types';
import { Plus, Phone, Mail, Clock, X, GripVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const columns: { id: KanbanStatus; label: string; color: string; bgColor: string }[] = [
  { id: 'pending', label: 'Pendente', color: '#D97706', bgColor: 'var(--color-warning-light)' },
  { id: 'paid', label: 'Pago', color: '#10B981', bgColor: 'var(--color-success-light)' },
  { id: 'recovery', label: 'Recuperação', color: '#E11D48', bgColor: 'var(--color-danger-light)' },
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
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Manrope', sans-serif", margin: 0 }}>Novo Lead</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Nome *</label>
            <input className="input-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do lead" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Telefone</label>
              <input className="input-dark" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 9..." />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Email</label>
              <input className="input-dark" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@..." />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Operação</label>
              <select className="select-dark" value={form.operationId} onChange={(e) => setForm({ ...form, operationId: e.target.value })}>
                {operations.map((op) => (
                  <option key={op.id} value={op.id}>{op.icon} {op.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Valor (R$)</label>
              <input className="input-dark" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Status</label>
              <select className="select-dark" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as KanbanStatus })}>
                {columns.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Manrope', sans-serif" }}>Notas</label>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {filteredLeads.length} leads no funil
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} strokeWidth={2.5} />
          Novo Lead
        </button>
      </div>

      {/* Kanban Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
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
              style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{col.label}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: col.color,
                      background: col.bgColor,
                      padding: '3px 9px',
                      borderRadius: 6,
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    {colLeads.length}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>
                  {formatCurrency(colTotal)}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
                {colLeads.map((lead) => {
                  const op = operations.find((o) => o.id === lead.operationId);
                  return (
                    <div
                      key={lead.id}
                      className={`kanban-card ${draggedId === lead.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      style={{ cursor: 'grab' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif", margin: 0 }}>{lead.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onDragStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Tem certeza que deseja excluir este lead?')) {
                                deleteLead(lead.id);
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 4, transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.8';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            title="Excluir Lead"
                          >
                            <Trash2 size={14} style={{ pointerEvents: 'none' }} />
                          </button>
                          <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, cursor: 'grab' }} />
                        </div>
                      </div>

                      {op && (
                        <span
                          className="op-badge"
                          style={{
                            background: `${op.color}15`,
                            color: op.color,
                            border: `1px solid ${op.color}30`,
                            marginBottom: 10,
                          }}
                        >
                          {op.icon} {op.name}
                        </span>
                      )}

                      <p style={{ fontSize: 18, fontWeight: 700, color: '#10B981', margin: '10px 0', fontFamily: "'Manrope', sans-serif" }}>
                        {formatCurrency(lead.value)}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {lead.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Mail size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.email}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
                        <Clock size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
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
