import React, { createContext, useState } from 'react';
import { notificationService } from '../../../shared/services/notificationService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Payroll Import Completed',
      message: 'Successfully processed 150 employee records',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Budget Alert',
      message: 'Marketing budget is 85% utilized',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'New Invoice Received',
      message: 'Invoice #INV-2024-001 from Tech Solutions',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true,
    },
  ]);

  // Helper function to get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'savings_request_submitted':
        return '📋'; // Document icon for requests
      case 'savings_request_approved':
        return '✅'; // Checkmark for approvals
      case 'savings_request_rejected':
        return '❌'; // X mark for rejections
      case 'savings_account_activated':
        return '💰'; // Money icon for savings
      case 'savings_rate_updated':
        return '📈'; // Chart for rate updates
      default:
        return '📢'; // Default notification icon
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount,
    getNotificationIcon,
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
