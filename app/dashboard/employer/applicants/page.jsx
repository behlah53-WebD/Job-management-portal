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
  MoreVertical,
  Sprout,
  XCircle,
  Sparkles,
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
  const [mobileDetailApplicant, setMobileDetailApplicant] = useState(null);

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
    // Optimistic UI update
    setApplicants((prev) =>
      prev.map((a) =>
        a._id === appId
          ? { ...a, status: newStatus, employerNote: drawerNote || a.employerNote }
          : a
      )
    );

    if (selectedApplicant && selectedApplicant._id === appId) {
      setSelectedApplicant((prev) => ({
        ...prev,
        status: newStatus,
        employerNote: drawerNote || prev.employerNote,
      }));
    }

    if (mobileDetailApplicant && mobileDetailApplicant._id === appId) {
      setMobileDetailApplicant((prev) => ({
        ...prev,
        status: newStatus,
        employerNote: drawerNote || prev.employerNote,
      }));
    }

    setMoveApplicantTarget(null);
    toast.success(`Moved to ${newStatus} 🌱`);

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
    } catch (err) {
      toast.error(err.message);
      fetchApplicants();
    }
  };

  const handleSaveNote = async () => {
    const target = selectedApplicant || mobileDetailApplicant;
    if (!target) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: target._id,
          status: target.status,
          employerNote: drawerNote,
        }),
      });
      if (!res.ok) throw new Error('Failed to save note');
      if (selectedApplicant) setSelectedApplicant({ ...selectedApplicant, employerNote: drawerNote });
      if (mobileDetailApplicant) setMobileDetailApplicant({ ...mobileDetailApplicant, employerNote: drawerNote });
      toast.success('Hiring notes saved 🌱');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openDrawer = (app) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileDetailApplicant(app);
      setDrawerNote(app.employerNote || '');
    } else {
      setSelectedApplicant(app);
      setDrawerNote(app.employerNote || '');
    }
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
            aria-label="Kanban view"
          >
            <LayoutGrid size={17} />
            <span className={styles.toggleLabel}>Kanban</span>
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List size={17} />
            <span className={styles.toggleLabel}>List</span>
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
              DESKTOP KANBAN / LIST (>= 1024px) - 100% UNTOUCHED
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
            {/* Sticky Stage Tabs directly under app bar */}
            <div className={styles.mobileTabsWrapper}>
              <SegmentedTabs
                tabs={mobileTabs}
                activeTab={mobileActiveStage}
                onChange={setMobileActiveStage}
              />
            </div>

            {/* Mobile Applicants Stack (shows ONE stage at a time) */}
            <div className={styles.mobileApplicantsStack}>
              {mobileFilteredApplicants.length === 0 ? (
                <div className={styles.mobileEmptyState}>
                  <Sprout size={36} className={styles.mobileEmptySprout} />
                  <p className={styles.mobileEmptyTitle}>
                    No candidates in {mobileActiveStage} stage yet 🌱
                  </p>
                  <p className={styles.mobileEmptySub}>
                    Candidates will appear here as they progress through your pipeline.
                  </p>
                </div>
              ) : viewMode === 'list' ? (
                /* Mobile Compact List View */
                <div className={styles.mobileCompactListStack}>
                  {mobileFilteredApplicants.map((app) => {
                    const user = app.applicant || {};
                    const job = app.job || {};

                    return (
                      <div
                        key={app._id}
                        className={styles.compactListRow}
                        onClick={() => openDrawer(app)}
                      >
                        <div className={styles.compactRowAvatar}>
                          {getInitials(user.name || 'Candidate')}
                        </div>
                        <div className={styles.compactRowMeta}>
                          <h4 className={styles.compactRowName}>{user.name || 'Candidate'}</h4>
                          <span className={styles.compactRowRole}>{job.title || 'Role'}</span>
                        </div>
                        <Badge variant={app.status}>{app.status}</Badge>
                        <ChevronRight size={18} className={styles.compactChevron} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Mobile Kanban Card View */
                mobileFilteredApplicants.map((app) => {
                  const user = app.applicant || {};
                  const job = app.job || {};

                  return (
                    <div
                      key={app._id}
                      className={styles.mobileAppCard}
                      onClick={() => openDrawer(app)}
                    >
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
                        <div className={styles.coverLetterBox}>
                          <p className={styles.mobileCoverSnippet}>
                            "{app.coverLetter.slice(0, 110)}..."
                          </p>
                        </div>
                      )}

                      <div className={styles.mobileCardActions} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={styles.mobileMoveBtn}
                          onClick={() => setMoveApplicantTarget(app)}
                        >
                          <span>Move to...</span>
                        </button>
                        <button
                          type="button"
                          className={styles.mobileReviewBtn}
                          onClick={() => openDrawer(app)}
                        >
                          <span>Review</span>
                          <ChevronRight size={15} />
                        </button>
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
        isOpen={Boolean(moveApplicantTarget)}
        onClose={() => setMoveApplicantTarget(null)}
        title="Move Candidate Stage"
      >
        {moveApplicantTarget && (
          <div className={styles.moveSheetBody}>
            <p className={styles.moveCandidateName}>
              Move <strong>{moveApplicantTarget.applicant?.name}</strong> for {moveApplicantTarget.job?.title}:
            </p>
            <div className={styles.stageOptionsList}>
              {COLUMNS.map((stage) => {
                const isCurrent = moveApplicantTarget.status === stage;
                const isReject = stage === 'Rejected';
                return (
                  <button
                    key={stage}
                    type="button"
                    className={`${styles.stageOptionBtn} ${
                      isCurrent ? styles.stageOptionCurrent : ''
                    } ${isReject ? styles.stageOptionReject : ''}`}
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

      {/* Mobile Candidate Detail Full Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(mobileDetailApplicant)}
        onClose={() => setMobileDetailApplicant(null)}
        title="Candidate Profile"
      >
        {mobileDetailApplicant && (
          <div className={styles.mobileDetailSheetBody}>
            {/* Header info */}
            <div className={styles.detailHeaderBox}>
              <div className={styles.detailAvatar}>
                {getInitials(mobileDetailApplicant.applicant?.name)}
              </div>
              <div className={styles.detailMeta}>
                <h3 className={styles.detailName}>{mobileDetailApplicant.applicant?.name}</h3>
                <span className={styles.detailRole}>{mobileDetailApplicant.job?.title}</span>
                <div className={styles.detailContactRow}>
                  <span className={styles.detailContactItem}>
                    <Mail size={13} /> {mobileDetailApplicant.applicant?.email}
                  </span>
                  {mobileDetailApplicant.applicant?.phone && (
                    <span className={styles.detailContactItem}>
                      <Phone size={13} /> {mobileDetailApplicant.applicant?.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Resume button */}
            {mobileDetailApplicant.resumeUrl && (
              <a
                href={mobileDetailApplicant.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.detailResumeBtn}
              >
                <FileText size={18} />
                <span>View Candidate Resume (PDF)</span>
                <ExternalLink size={15} className={styles.detailExtIcon} />
              </a>
            )}

            {/* Full Cover Note */}
            {mobileDetailApplicant.coverLetter && (
              <div className={styles.detailSection}>
                <label className={styles.detailSectionLabel}>Cover Note & Pitch</label>
                <div className={styles.detailCoverBox}>
                  <p className={styles.detailCoverText}>"{mobileDetailApplicant.coverLetter}"</p>
                </div>
              </div>
            )}

            {/* Internal Notes */}
            <div className={styles.detailSection}>
              <label className={styles.detailSectionLabel}>Team Hiring Notes</label>
              <textarea
                rows={3}
                className={styles.detailNoteTextarea}
                placeholder="Add evaluation takeaways or interview notes..."
                value={drawerNote}
                onChange={(e) => setDrawerNote(e.target.value)}
              />
              <button
                type="button"
                className={styles.saveNoteBtn}
                onClick={handleSaveNote}
              >
                Save Notes
              </button>
            </div>

            {/* Action Bar: Shortlist / Schedule / Reject */}
            <div className={styles.detailActionsSticky}>
              <button
                type="button"
                className={styles.actionShortlistBtn}
                onClick={() => handleUpdateStatus(mobileDetailApplicant._id, 'Shortlisted')}
              >
                Shortlist
              </button>
              <button
                type="button"
                className={styles.actionInterviewBtn}
                onClick={() => handleUpdateStatus(mobileDetailApplicant._id, 'Interview')}
              >
                Schedule Interview
              </button>
              <button
                type="button"
                className={styles.actionRejectBtn}
                onClick={() => handleUpdateStatus(mobileDetailApplicant._id, 'Rejected')}
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* APPLICANT REVIEW DRAWER (Desktop >= 1024px) */}
      <Drawer
        isOpen={Boolean(selectedApplicant)}
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
