const { query } = require('../config/database');

const auditLog = async (userId, action, tableName = null, recordId = null, oldValues = null, newValues = null, ipAddress = null, userAgent = null) => {
  try {
    const auditQuery = `
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(auditQuery, [
      userId,
      action,
      tableName,
      recordId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress,
      userAgent
    ]);
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

const auditMiddleware = (action, tableName = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    let responseData = null;
    
    res.send = function(data) {
      responseData = data;
      return originalSend.call(this, data);
    };
    
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const recordId = req.params.id || req.params.userId || req.body.id || null;
        const oldValues = req.oldData || null;
        const newValues = req.body || null;
        
        await auditLog(
          req.user.id,
          action,
          tableName,
          recordId,
          oldValues,
          newValues,
          req.ip,
          req.get('User-Agent')
        );
      }
    });
    
    next();
  };
};

module.exports = {
  auditLog,
  auditMiddleware
};
