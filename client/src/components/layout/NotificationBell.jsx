import React, { useEffect, useRef } from 'react';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../api/user.api';
import useNotificationStore from '../../store/useNotificationStore';
import { timeAgo } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const NotificationBell = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { notifications, unreadCount, isOpen, setNotifications, setUnreadCount, setIsOpen, addNotification, markAsRead: markRead, markAllRead } = useNotificationStore();
  const dropdownRef = useRef(null);

  // Connect to socket
  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || '', {
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('join', user._id);
    });

    socket.on('notification', (data) => {
      addNotification(data.notification || data);
    });

    return () => socket.disconnect();
  }, [user, addNotification]);

  // Fetch notifications
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userAPI.getNotifications({ limit: 10 }),
    enabled: !!user,
    onSuccess: (data) => {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    },
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: userAPI.markNotificationRead,
    onSuccess: (_, id) => {
      markRead(id);
      qc.invalidateQueries(['notifications']);
    },
  });

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: userAPI.markAllNotificationsRead,
    onSuccess: () => {
      markAllRead();
    },
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const notificationTypeIcons = {
    application_received: '📝',
    application_shortlisted: '⭐',
    application_rejected: '❌',
    application_hired: '🎉',
    interview_scheduled: '📅',
    new_job_alert: '💼',
    recruiter_approved: '✅',
    system: '🔔',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellAlertIcon className="h-6 w-6 text-primary-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <CheckIcon className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <BellIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${
                    !notif.read ? 'bg-primary-50/50' : ''
                  }`}
                  onClick={() => {
                    if (!notif.read) markReadMutation.mutate(notif._id);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-xl flex-shrink-0">
                    {notificationTypeIcons[notif.type] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium text-center">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
