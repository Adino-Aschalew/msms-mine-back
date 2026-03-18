// Export utility functions for all pages

export const exportReport = (data, filename, format = 'json') => {
  console.log('exportReport called with:', { data, filename, format });
  let content, mimeType;
  
  switch (format) {
    case 'json':
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      filename = filename.endsWith('.json') ? filename : `${filename}.json`;
      break;
    case 'csv':
      content = convertToCSV(data);
      mimeType = 'text/csv';
      filename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
      break;
    case 'txt':
      content = convertToText(data);
      mimeType = 'text/plain';
      filename = filename.endsWith('.txt') ? filename : `${filename}.txt`;
      break;
    case 'pdf':
      // For PDF, we would need a library like jsPDF
      // For now, we'll create a text representation
      content = convertToText(data);
      mimeType = 'text/plain';
      filename = filename.endsWith('.txt') ? filename : `${filename}.txt`;
      break;
    default:
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      filename = filename.endsWith('.json') ? filename : `${filename}.json`;
  }

  console.log('File prepared:', { filename, mimeType, contentLength: content.length });

  // Create and download file
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log(`Report exported successfully as ${format.toUpperCase()}`);
  } catch (error) {
    console.error('Error during file download:', error);
  }
};

const convertToCSV = (data) => {
  if (!data || typeof data !== 'object') return '';
  
  // Handle array of objects (like activity logs)
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(item => 
      headers.map(header => {
        const value = item[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return `${csvHeaders}\n${csvRows.join('\n')}`;
  }
  
  // Handle single object
  if (typeof data === 'object' && !Array.isArray(data)) {
    const headers = Object.keys(data);
    const csvHeaders = headers.join(',');
    const csvRow = headers.map(header => {
      const value = data[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
    
    return `${csvHeaders}\n${csvRow}`;
  }
  
  return String(data);
};

const convertToText = (data) => {
  const timestamp = new Date().toLocaleString();
  let text = `Report Generated: ${timestamp}\n\n`;
  
  if (Array.isArray(data)) {
    text += `Total Records: ${data.length}\n\n`;
    data.forEach((item, index) => {
      text += `Record ${index + 1}:\n`;
      Object.entries(item).forEach(([key, value]) => {
        text += `  ${key}: ${value}\n`;
      });
      text += '\n';
    });
  } else if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        text += `${key}:\n`;
        Object.entries(value).forEach(([subKey, subValue]) => {
          text += `  ${subKey}: ${subValue}\n`;
        });
      } else {
        text += `${key}: ${value}\n`;
      }
    });
  } else {
    text += String(data);
  }
  
  return text;
};

// Specific export functions for different page types
export const exportSecurityReport = (securityData, format = 'json') => {
  const filename = `security-report-${new Date().toISOString().split('T')[0]}`;
  exportReport(securityData, filename, format);
};

export const exportLoanReport = (loanData, format = 'json') => {
  const filename = `loan-report-${new Date().toISOString().split('T')[0]}`;
  exportReport(loanData, filename, format);
};

export const exportDashboardReport = (dashboardData, format = 'json') => {
  console.log('exportDashboardReport called with:', dashboardData);
  const filename = `dashboard-report-${new Date().toISOString().split('T')[0]}`;
  exportReport(dashboardData, filename, format);
};

export const exportProfileReport = (profileData, format = 'json') => {
  const filename = `profile-report-${new Date().toISOString().split('T')[0]}`;
  exportReport(profileData, filename, format);
};

export const exportPreferencesReport = (preferencesData, format = 'json') => {
  const filename = `preferences-report-${new Date().toISOString().split('T')[0]}`;
  exportReport(preferencesData, filename, format);
};

// Generic export modal component data
export const getExportOptions = () => [
  { value: 'json', label: 'JSON', description: 'Machine-readable format' },
  { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
  { value: 'txt', label: 'Text', description: 'Human-readable format' },
  { value: 'pdf', label: 'PDF', description: 'Document format (coming soon)' }
];

export const getReportDescription = (reportType) => {
  const descriptions = {
    security: 'Security metrics, activity logs, and settings',
    loan: 'Loan applications, approvals, and disbursements',
    dashboard: 'System overview and performance metrics',
    profile: 'User profile and activity information',
    preferences: 'System preferences and configuration'
  };
  
  return descriptions[reportType] || 'Comprehensive report data';
};
