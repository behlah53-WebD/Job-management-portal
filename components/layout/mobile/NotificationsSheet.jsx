'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Sparkles, Briefcase, FileText, CheckCheck } from 'lucide-react';
import BottomSheet from '@/components/ui/mobile/BottomSheet';
import { timeAgo } from '@/lib/utils';
import styles from './NotificationsSheet.module.css';

export default function NotificationsSheet({
  isOpen = false,
  onClose,
  notifications = [],
  onMarkAllRead,
}) {
  const [marking, setMarking] = useState(false);

  const handleMarkAll = async () => {
    if (marking) return;
    setMarking(true);
    try {
      await onMarkAllRead?.();
    } finally {
      setMarking(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      subtitle={
        unreadCount > 0
          ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}`
          : 'All caught up'
      }
    >
      <div className={styles.container}>
        {unreadCount > 0 && (
          <div className={styles.topActionRow}>
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={handleMarkAll}
              disabled={marking}
            >
              <CheckCheck size={16} />
              <span>{marking ? 'Marking...' : 'Mark all as read'}</span>
            </button>
          </div>
        )}

        <div className={styles.list}>
          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconCircle}>
                <Sparkles size={24} />
              </div>
              <h3 className={styles.emptyTitle}>You're all caught up! 🌿</h3>
              <p className={styles.emptySub}>
                When employers view your applications, shortlist your profile, or schedule interviews, updates will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Content = (
                <div
                  className={`${styles.item} ${!notif.isRead ? styles.unreadItem : ''}`}
                  onClick={onClose}
                >
                  <div className={styles.itemIconBox}>
                    {notif.type === 'status_update' ? (
                      <Briefcase size={18} />
                    ) : notif.type === 'new_application' ? (
                      <FileText size={18} />
                    ) : (
                      <Bell size={18} />
                    )}
                  </div>
                  <div className={styles.itemBody}>
                    <p className={styles.message}>{notif.message}</p>
                    <span className={styles.time}>{timeAgo(notif.createdAt)}</span>
                  </div>
                  {!notif.isRead && <span className={styles.unreadDot} />}
                </div>
              );

              return notif.link ? (
                <Link
                  key={notif._id}
                  href={notif.link}
                  className={styles.itemLink}
                  onClick={onClose}
                >
                  {Content}
                </Link>
              ) : (
                <div key={notif._id}>{Content}</div>
              );
            })
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
