import React, { createContext, useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../../../shared/services/notificationsAPI';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getNotifications();
      // Assume data returns an array or an object with notifications
      const list = Array.isArray(data) ? data : (data?.notifications || data?.data || []);
      
      // Map backend fields to frontend expected fields
      const mapped = list.map(n => ({
        ...n,
        id: n.id,
        type: n.notification_type?.toLowerCase() || 'info', // success, warning, error, info
        title: n.title,
        message: n.message,
        timestamp: n.created_at || new Date(),
        read: n.is_read || false,
        priority: n.priority?.toLowerCase() || 'medium',
        category: n.category || 'system'
      }));
      setNotifications(mapped);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
    }
  };

  const clearNotifications = async () => {
    setNotifications([]);
    // You could also call an API to clear if supported
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    deleteNotification,
    fetchNotifications,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
