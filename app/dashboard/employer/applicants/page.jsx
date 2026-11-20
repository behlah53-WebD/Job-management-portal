'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import EmptyState from '@/components/ui/EmptyState';
import {
  Users,
  LayoutGrid,
  List,
  FileText,
  Clock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Calendar,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { timeAgo, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './applicants.module.css';

const COLUMNS = ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected'];

// Kanban draggable applicant card
function KanbanCard({ applicant, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: applicant._id,
    data: { applicant },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const user = applicant.applicant || {};
  const job = applicant.job || {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.kanbanItem}
      onClick={() => onClick(applicant)}
    >
      <div className={styles.itemTop}>
        <div className={styles.itemMeta}>
          <div className={styles.avatarMini}>{getInitials(user.name || 'Candidate')}</div>
          <div>
            <h4 className={styles.candidateName}>{user.name || 'Candidate'}</h4>
            <span className={styles.jobTitleSub}>{job.title || 'Role'}</span>
          </div>
        </div>
        <div
          {...attributes}
          {...listeners}
          className={styles.dragHandle}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>
      </div>

      {applicant.coverLetter && (
        <p className={styles.coverSnippet}>"{applicant.coverLetter.slice(0, 60)}..."</p>
      )}

      <div className={styles.itemFooter}>
        <span className={styles.timeText}>{timeAgo(applicant.appliedAt || applicant.createdAt)}</span>
        {applicant.employerNote && (
          <span className={styles.hasNoteBadge} title={applicant.employerNote}>
            <MessageSquare size={13} />
          </span>
        )}
      </div>
    </div>
  );
}

// Kanban Column droppable container
function KanbanColumn({ columnId, applicants, onCardClick }) {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div className={styles.columnTitleRow}>
          <span className={styles.colTitle}>{columnId}</span>
          <span className={styles.colCount}>{applicants.length}</span>
        </div>
      </div>

      <SortableContext
        items={applicants.map((a) => a._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.columnBody}>
          {applicants.length === 0 ? (
            <div className={styles.emptyColBox}>No candidates</div>
          ) : (
            applicants.map((app) => (
              <KanbanCard key={app._id} applicant={app} onClick={onCardClick} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function EmployerApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [drawerNote, setDrawerNote] = useState('');
  const [activeDragItem, setActiveDragItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchApplicants = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (Array.isArray(data)) setApplicants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleDragStart = (event) => {
    const { active } = event;
    const found = applicants.find((a) => a._id === active.id);
    setActiveDragItem(found);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;

    // Check if dropped onto a column
    let newStatus = null;
    if (COLUMNS.includes(over.id)) {
      newStatus = over.id;
    } else {
      const overItem = applicants.find((a) => a._id === over.id);
      if (overItem) newStatus = overItem.status;
    }

    if (newStatus && activeDragItem && activeDragItem.status !== newStatus) {
      // Optimistic update
      setApplicants((prev) =>
        prev.map((a) => (a._id === activeDragItem._id ? { ...a, status: newStatus } : a))
      );

      try {
        const res = await fetch('/api/applications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: activeDragItem._id,
            status: newStatus,
          }),
        });

        if (!res.ok) throw new Error('Status update failed');
        toast.success(`Candidate moved to ${newStatus} 🌱`);
      } catch (err) {
        toast.error(err.message);
        fetchApplicants();
      }
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          status: newStatus,
          employerNote: drawerNote,
        }),
      });

      if (!res.ok) throw new Error('Status update failed');
      setApplicants((prev) =>
        prev.map((a) =>
          a._id === appId
            ? { ...a, status: newStatus, employerNote: drawerNote }
            : a
        )
      );
      if (selectedApplicant) {
        setSelectedApplicant({
          ...selectedApplicant,
          status: newStatus,
          employerNote: drawerNote,
        });
      }
      toast.success(`Updated to ${newStatus} 🌱`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedApplicant) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApplicant._id,
          status: selectedApplicant.status,
          employerNote: drawerNote,
        }),
      });
      if (!res.ok) throw new Error('Failed to save note');
      setSelectedApplicant({ ...selectedApplicant, employerNote: drawerNote });
      toast.success('Hiring notes saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openDrawer = (app) => {
    setSelectedApplicant(app);
    setDrawerNote(app.employerNote || '');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Candidate Pipeline</h1>
          <p className={styles.subtitle}>
            Drag & drop applicants across stages or click any candidate for full details.
          </p>
        </div>

        <div className={styles.viewToggle}>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'kanban' ? styles.viewActive : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid size={17} />
            <span>Kanban</span>
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={17} />
            <span>List</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>Loading candidate pipeline...</div>
      ) : applicants.length === 0 ? (
        <EmptyState
          title="No candidates in pipeline yet 🌱"
          description="Once candidates submit their resumes, they will appear on this interactive Kanban board."
        />
      ) : viewMode === 'kanban' ? (
        /* DND-KIT KANBAN BOARD */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.kanbanBoard}>
            {COLUMNS.map((col) => {
              const columnApplicants = applicants.filter((a) => a.status === col);
              return (
                <KanbanColumn
                  key={col}
                  columnId={col}
                  applicants={columnApplicants}
                  onCardClick={openDrawer}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeDragItem ? (
              <div className={`${styles.kanbanItem} ${styles.dragOverlay}`}>
                <div className={styles.itemTop}>
                  <div className={styles.itemMeta}>
                    <div className={styles.avatarMini}>
                      {getInitials(activeDragItem.applicant?.name || 'C')}
                    </div>
                    <div>
                      <h4 className={styles.candidateName}>
                        {activeDragItem.applicant?.name}
                      </h4>
                      <span className={styles.jobTitleSub}>
                        {activeDragItem.job?.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        /* LIST VIEW */
        <div className={styles.listContainer}>
          {applicants.map((app) => (
            <div
              key={app._id}
              className={styles.listRow}
              onClick={() => openDrawer(app)}
            >
              <div className={styles.listRowLeft}>
                <div className={styles.avatarMini}>
                  {getInitials(app.applicant?.name || 'C')}
                </div>
                <div>
                  <h4 className={styles.candidateName}>{app.applicant?.name}</h4>
                  <span className={styles.jobTitleSub}>{app.job?.title}</span>
                </div>
              </div>

              <div className={styles.listRowRight}>
                <Badge variant={app.status}>{app.status}</Badge>
                <span className={styles.timeText}>
                  Applied {timeAgo(app.appliedAt || app.createdAt)}
                </span>
                <Button variant="secondary" size="sm">
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPLICANT REVIEW DRAWER */}
      <Drawer
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        title="Candidate Profile"
        subtitle={selectedApplicant?.job?.title}
        width="540px"
      >
        {selectedApplicant && (
          <div className={styles.drawerContent}>
            {/* Header / Avatar */}
            <div className={styles.drawerUserHeader}>
              <div className={styles.drawerAvatar}>
                {getInitials(selectedApplicant.applicant?.name)}
              </div>
              <div className={styles.drawerUserMeta}>
                <h3 className={styles.drawerUserName}>
                  {selectedApplicant.applicant?.name}
                </h3>
                <div className={styles.drawerContactList}>
                  <span className={styles.drawerContactItem}>
                    <Mail size={14} /> {selectedApplicant.applicant?.email}
                  </span>
                  {selectedApplicant.applicant?.phone && (
                    <span className={styles.drawerContactItem}>
                      <Phone size={14} /> {selectedApplicant.applicant?.phone}
                    </span>
                  )}
                  {selectedApplicant.applicant?.location && (
                    <span className={styles.drawerContactItem}>
                      <MapPin size={14} /> {selectedApplicant.applicant?.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stage Selector */}
            <div className={styles.drawerSection}>
              <label className={styles.drawerSectionLabel}>Pipeline Stage</label>
              <div className={styles.stageButtonGrid}>
                {COLUMNS.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    className={`${styles.stageBtn} ${
                      selectedApplicant.status === stage ? styles.stageActive : ''
                    }`}
                    onClick={() => handleUpdateStatus(selectedApplicant._id, stage)}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Resume Button */}
            {selectedApplicant.resumeUrl && (
              <div className={styles.drawerSection}>
                <label className={styles.drawerSectionLabel}>Attached Resume</label>
                <a
                  href={selectedApplicant.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.resumeBox}
                >
                  <FileText size={24} className={styles.resumeIcon} />
                  <div>
                    <span className={styles.resumeTitle}>Download / Preview PDF</span>
                    <span className={styles.resumeSub}>Opens in new window</span>
                  </div>
                  <ExternalLink size={16} className={styles.resumeExt} />
                </a>
              </div>
            )}

            {/* Cover Note */}
            {selectedApplicant.coverLetter && (
              <div className={styles.drawerSection}>
                <label className={styles.drawerSectionLabel}>Cover Note</label>
                <div className={styles.coverBox}>
                  <p className={styles.coverText}>"{selectedApplicant.coverLetter}"</p>
                </div>
              </div>
            )}

            {/* Employer Internal Notes */}
            <div className={styles.drawerSection}>
              <label className={styles.drawerSectionLabel}>Private Team Notes</label>
              <textarea
                rows={3}
                className={styles.noteTextarea}
                placeholder="Add private evaluation notes for interviewers or colleagues..."
                value={drawerNote}
                onChange={(e) => setDrawerNote(e.target.value)}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveNote}
                style={{ alignSelf: 'flex-end', marginTop: '6px' }}
              >
                Save Notes
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
