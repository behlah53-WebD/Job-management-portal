'use client';

import React from 'react';
import { Sprout, Leaf, Flower2, Circle, AlertCircle } from 'lucide-react';
import styles from './SproutStepper.module.css';

/**
 * Signature element 2: Sprout Stepper
 * Maps stages: Seed (Applied) -> Sprout (Viewed) -> Leaf (Shortlisted / Interview) -> Bloom (Offered / Hired)
 * Completed stages filled green, current stage has soft pulsing halo and leaf icon, upcoming are outlined.
 * Rejected shows muted gray-red.
 */
const STAGES = [
  { id: 'Applied', name: 'Seed', icon: Circle },
  { id: 'Viewed', name: 'Sprout', icon: Sprout },
  { id: 'Shortlisted', altId: 'Interview', name: 'Leaf', icon: Leaf },
  { id: 'Offered', altId: 'Hired', name: 'Bloom', icon: Flower2 },
];

export default function SproutStepper({
  status = 'Applied',
  statusSentence,
  compact = false,
  className = '',
}) {
  const isClosed = status === 'Rejected' || status === 'Withdrawn';

  // Determine stage index
  const getStageIndex = (st) => {
    if (st === 'Applied') return 0;
    if (st === 'Viewed') return 1;
    if (st === 'Shortlisted' || st === 'Interview') return 2;
    if (st === 'Offered' || st === 'Hired') return 3;
    return 0;
  };

  const currentIdx = getStageIndex(status);

  if (isClosed) {
    return (
      <div className={`${styles.closedState} ${className}`}>
        <AlertCircle size={15} className={styles.closedIcon} />
        <span className={styles.closedText}>
          Application {status.toLowerCase()} • Process concluded
        </span>
      </div>
    );
  }

  return (
    <div className={`${styles.stepperWrapper} ${compact ? styles.compactWrapper : ''} ${className}`}>
      <div className={styles.trackRow}>
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isUpcoming = idx > currentIdx;
          const IconComponent = stage.icon;

          return (
            <React.Fragment key={stage.name}>
              <div className={styles.stageNode}>
                <div
                  className={`${styles.nodeCircle} ${
                    isCompleted ? styles.completedCircle : ''
                  } ${isCurrent ? styles.currentCircle : ''} ${
                    isUpcoming ? styles.upcomingCircle : ''
                  }`}
                  aria-label={`${stage.name} (${stage.id})`}
                >
                  <IconComponent size={isCurrent ? 14 : 12} />
                  {isCurrent && <span className={styles.pulseHalo} aria-hidden="true" />}
                </div>

                {!compact && (
                  <span
                    className={`${styles.stageLabel} ${
                      isCurrent ? styles.activeLabel : isCompleted ? styles.completedLabel : ''
                    }`}
                  >
                    {stage.id}
                  </span>
                )}
              </div>

              {idx < STAGES.length - 1 && (
                <div
                  className={`${styles.connectorLine} ${
                    idx < currentIdx ? styles.completedLine : ''
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {!compact && statusSentence && (
        <div className={styles.statusSentenceRow}>
          <span className={styles.sentenceDot} />
          <span className={styles.sentenceText}>{statusSentence}</span>
        </div>
      )}
    </div>
  );
}
