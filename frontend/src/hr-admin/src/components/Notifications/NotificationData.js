export const notificationsData = [
  {
    id: 'notif-1',
    title: 'New Leave Request',
    message: 'Sarah Connor submitted a leave request for next week.',
    time: '2 mins ago',
    type: 'request',
    isRead: false,
    detail: 'Sarah Connor (Engineering) requested 5 days of personal leave starting from March 20th.'
  },
  {
    id: 'notif-2',
    title: 'Performance Review Due',
    message: 'It\'s time for the Q1 performance reviews for your team.',
    time: '1 hour ago',
    type: 'alert',
    isRead: false,
    detail: 'All department heads must complete employee performance reviews by March 31st.'
  },
  {
    id: 'notif-3',
    title: 'System Maintenance',
    message: 'Dashboard will be down for maintenance tonight at GMT 12:00.',
    time: '5 hours ago',
    type: 'system',
    isRead: true,
    detail: 'Scheduled database optimization and cache clearing. Downtime expected: 30 minutes.'
  },
  {
    id: 'notif-4',
    title: 'New Policy Uploaded',
    message: 'The updated Remote Work Policy is now available in the library.',
    time: '1 day ago',
    type: 'info',
    isRead: true,
    detail: 'The 2026 Remote Work Policy includes new guidelines on equipment stipends and flexible hours.'
  }
];
