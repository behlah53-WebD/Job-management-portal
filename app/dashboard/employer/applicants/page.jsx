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
import SegmentedTabs from '@/components/ui/mobile/SegmentedTabs';
import BottomSheet from '@/components/ui/mobile/BottomSheet';
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
  ChevronRight,
  ArrowRight,
  Check,
} from 'lucide-react';
import { timeAgo, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './applicants.module.css';

const COLUMNS = ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected'];

// Kanban draggable applicant card (Desktop)
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

// Kanban Column droppable container (Desktop)
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

  // Mobile specific state
  const [mobileActiveStage, setMobileActiveStage] = useState('Applied');
  const [moveApplicantTarget, setMoveApplicantTarget] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplicants(data || []);
    } catch {
      toast.error('Failed to load candidate pipeline');
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
    setActiveDragItem(found || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    let targetColumn = null;
    if (COLUMNS.includes(over.id)) {
      targetColumn = over.id;
    } else {
      const targetApp = applicants.find((a) => a._id === over.id);
      if (targetApp) {
        targetColumn = targetApp.status;
      }
    }

    if (targetColumn && activeDragItem && activeDragItem.status !== targetColumn) {
      const newStatus = targetColumn;
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === activeDragItem._id ? { ...app, status: newStatus } : app
        )
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
      setMoveApplicantTarget(null);
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

  // Mobile tabs configuration
  const mobileTabs = COLUMNS.map((col) => ({
    id: col,
    label: col,
    count: applicants.filter((a) => a.status === col).length,
  }));

  const mobileFilteredApplicants = applicants.filter(
    (a) => a.status === mobileActiveStage
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Candidate Pipeline</h1>
          <p className={styles.subtitle}>
            Monitor and advance candidate applications across evaluation stages.
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
      ) : (
        <>
          {/* =========================================================================
              DESKTOP KANBAN / LIST (>= 1024px)
             ========================================================================= */}
          <div className={styles.desktopKanbanContainer}>
            {viewMode === 'kanban' ? (
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
          </div>

          {/* =========================================================================
              MOBILE STAGE SELECTOR & CARDS (< 1024px)
             ========================================================================= */}
          <div className={styles.mobilePipelineContainer}>
            {/* Sticky Stage Tabs */}
            <div className={styles.mobileTabsWrapper}>
              <SegmentedTabs
                tabs={mobileTabs}
                activeTab={mobileActiveStage}
                onChange={setMobileActiveStage}
              />
            </div>

            {/* Mobile Applicants List */}
            <div className={styles.mobileApplicantsStack}>
              {mobileFilteredApplicants.length === 0 ? (
                <div className={styles.mobileEmptyState}>
                  <p className={styles.mobileEmptyText}>
                    No candidates in {mobileActiveStage} stage 🌱
                  </p>
                </div>
              ) : (
                mobileFilteredApplicants.map((app) => {
                  const user = app.applicant || {};
                  const job = app.job || {};

                  return (
                    <div key={app._id} className={styles.mobileAppCard}>
                      <div className={styles.mobileCardTop}>
                        <div className={styles.mobileAvatar}>
                          {getInitials(user.name || 'Candidate')}
                        </div>
                        <div className={styles.mobileMetaText}>
                          <h4 className={styles.mCandidateName}>{user.name || 'Candidate'}</h4>
                          <span className={styles.mJobTitle}>{job.title || 'Role'}</span>
                          <span className={styles.mAppliedTime}>
                            {timeAgo(app.appliedAt || app.createdAt)}
                          </span>
                        </div>
                        <Badge variant={app.status}>{app.status}</Badge>
                      </div>

                      {app.coverLetter && (
                        <p className={styles.mobileCoverSnippet}>
                          "{app.coverLetter.slice(0, 90)}..."
                        </p>
                      )}

                      <div className={styles.mobileCardActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setMoveApplicantTarget(app)}
                          className={styles.mobileMoveBtn}
                        >
                          Move Stage...
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openDrawer(app)}
                          className={styles.mobileReviewBtn}
                        >
                          Review Candidate
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Move Stage BottomSheet (Mobile) */}
      <BottomSheet
        isOpen={!!moveApplicantTarget}
        onClose={() => setMoveApplicantTarget(null)}
        title="Move Candidate Stage"
      >
        {moveApplicantTarget && (
          <div className={styles.moveSheetBody}>
            <p className={styles.moveCandidateName}>
              Advance {moveApplicantTarget.applicant?.name} for{' '}
              {moveApplicantTarget.job?.title}:
            </p>
            <div className={styles.stageOptionsList}>
              {COLUMNS.map((stage) => {
                const isCurrent = moveApplicantTarget.status === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    className={`${styles.stageOptionBtn} ${
                      isCurrent ? styles.stageOptionCurrent : ''
                    }`}
                    onClick={() => handleUpdateStatus(moveApplicantTarget._id, stage)}
                  >
                    <span>{stage}</span>
                    {isCurrent && <Check size={16} className={styles.stageCheckIcon} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* APPLICANT REVIEW DRAWER (Shared) */}
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
                </div>
              </div>
            </div>

            {/* Stage Selector */}
            <div className={styles.drawerSection}>
              <label className={styles.sectionLabel}>Pipeline Stage</label>
              <div className={styles.stageButtonGroup}>
                {COLUMNS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`${styles.stageBtn} ${
                      selectedApplicant.status === st ? styles.stageActive : ''
                    }`}
                    onClick={() => handleUpdateStatus(selectedApplicant._id, st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Resume File */}
            {selectedApplicant.resumeUrl && (
              <div className={styles.drawerSection}>
                <label className={styles.sectionLabel}>Attached Resume</label>
                <a
                  href={selectedApplicant.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.resumeBox}
                >
                  <FileText size={24} className={styles.resumeIcon} />
                  <div>
                    <span className={styles.resumeTitle}>Candidate Resume (PDF)</span>
                    <span className={styles.resumeSub}>Click to preview in new tab</span>
                  </div>
                  <ExternalLink size={16} className={styles.resumeExt} />
                </a>
              </div>
            )}

            {/* Cover Letter */}
            {selectedApplicant.coverLetter && (
              <div className={styles.drawerSection}>
                <label className={styles.sectionLabel}>Cover Note / Pitch</label>
                <div className={styles.coverBox}>
                  <p className={styles.coverText}>{selectedApplicant.coverLetter}</p>
                </div>
              </div>
            )}

            {/* Internal Employer Notes */}
            <div className={styles.drawerSection}>
              <label className={styles.sectionLabel}>Internal Hiring Notes</label>
              <textarea
                rows={4}
                className={styles.noteTextarea}
                placeholder="Add team feedback, interview notes, or evaluation takeaways..."
                value={drawerNote}
                onChange={(e) => setDrawerNote(e.target.value)}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveNote}
                style={{ alignSelf: 'flex-start', marginTop: '8px' }}
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
