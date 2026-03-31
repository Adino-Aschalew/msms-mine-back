const { query, transaction } = require('../config/database');
const NotificationService = require('../services/notification.service');

class SavingsRequest {
  static async createRequest(userId, oldPercentage, newPercentage, reason) {
    const insertQuery = `
      INSERT INTO savings_requests (user_id, old_value, new_value, reason, status, request_type, savings_type, effective_date, requested_effective_date, submitted_by)
      VALUES (?, ?, ?, ?, 'PENDING', 'PERCENTAGE_CHANGE', 'PERCENTAGE', CURDATE(), CURDATE(), ?)
    `;
    
    const result = await query(insertQuery, [userId, oldPercentage, newPercentage, reason, userId]);
    return result.insertId;
  }
  
  static async getRequests(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      whereClause += ' AND sr.status = ?';
      params.push(filters.status);
    }
    
    if (filters.user_id) {
      whereClause += ' AND sr.user_id = ?';
      params.push(filters.user_id);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total FROM savings_requests sr ${whereClause}
    `;
    
    const selectQuery = `
      SELECT sr.*, sr.old_value as old_percentage, sr.new_value as new_percentage, 
             u.username, u.email, ep.first_name, ep.last_name, ep.department,
             reviewer.username as reviewer_username
      FROM savings_requests sr
      JOIN users u ON sr.user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN users reviewer ON sr.final_approved_by = reviewer.id
      ${whereClause}
      ORDER BY sr.submitted_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, requests] = await Promise.all([
      query(countQuery, params),
      query(selectQuery, [...params, limit, offset])
    ]);
    
    return {
      requests,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }
  
  static async getRequest(requestId) {
    const selectQuery = `
      SELECT sr.*, sr.old_value as old_percentage, sr.new_value as new_percentage,
             u.username, u.email, ep.first_name, ep.last_name, ep.department
      FROM savings_requests sr
      JOIN users u ON sr.user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE sr.id = ?
    `;
    
    const requests = await query(selectQuery, [requestId]);
    return requests[0] || null;
  }
  
  static async updateRequestStatus(requestId, status, reviewedBy, comments) {
    return await transaction(async (connection) => {
      const request = await this.getRequest(requestId);
      
      if (!request) {
        throw new Error('Savings update request not found');
      }
      
      if (request.status !== 'PENDING') {
        throw new Error('Request has already been processed');
      }
      
      const updateRequestQuery = `
        UPDATE savings_requests 
        SET status = ?, final_approved_by = ?, final_approved_at = NOW(), final_approval_comments = ?
        WHERE id = ?
      `;
      
      await connection.execute(updateRequestQuery, [status, reviewedBy, comments, requestId]);
      
      if (status === 'APPROVED') {
        const updateSavingsQuery = `
          UPDATE savings_accounts 
          SET saving_percentage = ?, updated_at = NOW()
          WHERE user_id = ? AND account_status = 'ACTIVE'
        `;
        
        await connection.execute(updateSavingsQuery, [request.new_percentage, request.user_id]);
      }
      
      // Notify user through centralized service
      await NotificationService.sendSavingsStatusNotification(
        request.user_id,
        requestId,
        status,
        request.new_percentage,
        comments
      );
      
      return { success: true, status };
    });
  }
}

module.exports = SavingsRequest;
