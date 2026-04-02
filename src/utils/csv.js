const csv = require('@fast-csv/parse');
const createCsvWriter = require('@fast-csv/format');

class CsvUtils {
  static async parseCsv(filePath, options = {}) {
    return new Promise((resolve, reject) => {
      const results = [];
      const headers = [];
      
      const defaultOptions = {
        headers: true,
        ignoreEmpty: true,
        trim: true,
        skipLinesWithError: true,
        ...options
      };
      
      const stream = require('fs').createReadStream(filePath);
      
      stream
        .pipe(csv.parse(defaultOptions))
        .on('data', (row) => {
          results.push(row);
        })
        .on('headers', (headerList) => {
          headers.push(...headerList);
        })
        .on('end', () => {
          resolve({
            headers,
            data: results,
            count: results.length
          });
        })
        .on('error', (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        });
    });
  }

  static async parseCsvBuffer(buffer, options = {}) {
    return new Promise((resolve, reject) => {
      const results = [];
      const headers = [];
      
      const defaultOptions = {
        headers: true,
        ignoreEmpty: true,
        trim: true,
        skipLinesWithError: true,
        ...options
      };
      
      
      const csvString = buffer.toString('utf8');
      
      csv.parse(csvString, defaultOptions)
        .on('data', (row) => {
          results.push(row);
        })
        .on('headers', (headerList) => {
          headers.push(...headerList);
        })
        .on('end', () => {
          resolve({
            headers,
            data: results,
            count: results.length
          });
        })
        .on('error', (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        });
    });
  }

  static async writeCsv(filePath, data, options = {}) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        headers: true,
        writeBOM: true,
        ...options
      };
      
      const csvWriter = createCsvWriter({
        path: filePath,
        data: data,
        options: defaultOptions
      });
      
      csvWriter.write()
        .then(() => {
          csvWriter.finalize();
          resolve({
            filePath,
            count: data.length,
            message: 'CSV file written successfully'
          });
        })
        .catch((error) => {
          reject(new Error(`CSV writing error: ${error.message}`));
        });
    });
  }

  static async generateCsvBuffer(data, options = {}) {
    return new Promise((resolve, reject) => {
      const buffers = [];
      
      const defaultOptions = {
        headers: true,
        writeBOM: true,
        transform: (row) => row,
        ...options
      };
      
      const csvWriter = createCsvWriter({
        data: data,
        options: defaultOptions
      });
      
      csvWriter.on('data', (chunk) => {
        buffers.push(chunk);
      });
      
      csvWriter.on('end', () => {
        const buffer = Buffer.concat(buffers);
        resolve(buffer);
      });
      
      csvWriter.on('error', (error) => {
        reject(new Error(`CSV buffer generation error: ${error.message}`));
      });
      
      csvWriter.write();
      csvWriter.finalize();
    });
  }

  static validateCsvHeaders(actualHeaders, requiredHeaders) {
    const missingHeaders = requiredHeaders.filter(header => !actualHeaders.includes(header));
    const extraHeaders = actualHeaders.filter(header => !requiredHeaders.includes(header));
    
    return {
      isValid: missingHeaders.length === 0,
      missingHeaders,
      extraHeaders,
      message: missingHeaders.length > 0 
        ? `Missing required headers: ${missingHeaders.join(', ')}`
        : 'All required headers present'
    };
  }

  static validateCsvData(data, validationRules = {}) {
    const errors = [];
    const validData = [];
    
    data.forEach((row, index) => {
      const rowErrors = [];
      
      
      Object.keys(validationRules).forEach(field => {
        const rule = validationRules[field];
        const value = row[field];
        
        if (rule.required && (value === undefined || value === null || value === '')) {
          rowErrors.push(`${field} is required`);
          return;
        }
        
        if (value !== undefined && value !== null && value !== '') {
          
          if (rule.type === 'number' && isNaN(Number(value))) {
            rowErrors.push(`${field} must be a number`);
          }
          
          if (rule.type === 'email' && !this.isValidEmail(value)) {
            rowErrors.push(`${field} must be a valid email`);
          }
          
          if (rule.type === 'date' && !this.isValidDate(value)) {
            rowErrors.push(`${field} must be a valid date`);
          }
          
          
          if (rule.min !== undefined && Number(value) < rule.min) {
            rowErrors.push(`${field} must be at least ${rule.min}`);
          }
          
          if (rule.max !== undefined && Number(value) > rule.max) {
            rowErrors.push(`${field} must be at most ${rule.max}`);
          }
          
          
          if (rule.minLength !== undefined && String(value).length < rule.minLength) {
            rowErrors.push(`${field} must be at least ${rule.minLength} characters`);
          }
          
          if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
            rowErrors.push(`${field} must be at most ${rule.maxLength} characters`);
          }
          
          
          if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
            rowErrors.push(`${field} format is invalid`);
          }
          
          
          if (rule.validate && typeof rule.validate === 'function') {
            const customError = rule.validate(value);
            if (customError) {
              rowErrors.push(`${field}: ${customError}`);
            }
          }
        }
      });
      
      if (rowErrors.length > 0) {
        errors.push({
          row: index + 1,
          errors: rowErrors,
          data: row
        });
      } else {
        validData.push(row);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      validData,
      totalRows: data.length,
      validRows: validData.length,
      invalidRows: errors.length
    };
  }

  static transformCsvData(data, transformations = {}) {
    return data.map(row => {
      const transformedRow = { ...row };
      
      Object.keys(transformations).forEach(field => {
        const transform = transformations[field];
        
        if (typeof transform === 'function') {
          transformedRow[field] = transform(row[field], row);
        } else if (typeof transform === 'string') {
          
          transformedRow[transform] = row[field];
          delete transformedRow[field];
        }
      });
      
      return transformedRow;
    });
  }

  static filterCsvData(data, filters = {}) {
    return data.filter(row => {
      return Object.keys(filters).every(field => {
        const filter = filters[field];
        
        if (typeof filter === 'function') {
          return filter(row[field], row);
        }
        
        if (typeof filter === 'object' && filter !== null) {
          
          return Object.keys(filter).every(operator => {
            const value = filter[operator];
            
            switch (operator) {
              case 'equals':
                return row[field] === value;
              case 'notEquals':
                return row[field] !== value;
              case 'contains':
                return String(row[field]).includes(value);
              case 'startsWith':
                return String(row[field]).startsWith(value);
              case 'endsWith':
                return String(row[field]).endsWith(value);
              case 'greaterThan':
                return Number(row[field]) > value;
              case 'lessThan':
                return Number(row[field]) < value;
              case 'greaterThanOrEqual':
                return Number(row[field]) >= value;
              case 'lessThanOrEqual':
                return Number(row[field]) <= value;
              case 'in':
                return Array.isArray(value) && value.includes(row[field]);
              case 'notIn':
                return Array.isArray(value) && !value.includes(row[field]);
              default:
                return true;
            }
          });
        }
        
        
        return row[field] === filter;
      });
    });
  }

  static groupCsvData(data, groupByField) {
    const groups = {};
    
    data.forEach(row => {
      const groupKey = row[groupByField];
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(row);
    });
    
    return groups;
  }

  static aggregateCsvData(data, groupByField, aggregations = {}) {
    const groups = this.groupCsvData(data, groupByField);
    const results = {};
    
    Object.keys(groups).forEach(groupKey => {
      const groupData = groups[groupKey];
      const aggregatedData = { [groupByField]: groupKey };
      
      Object.keys(aggregations).forEach(field => {
        const aggregation = aggregations[field];
        const values = groupData.map(row => Number(row[field]) || 0).filter(val => !isNaN(val));
        
        switch (aggregation) {
          case 'sum':
            aggregatedData[field] = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'avg':
            aggregatedData[field] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            break;
          case 'min':
            aggregatedData[field] = values.length > 0 ? Math.min(...values) : 0;
            break;
          case 'max':
            aggregatedData[field] = values.length > 0 ? Math.max(...values) : 0;
            break;
          case 'count':
            aggregatedData[field] = groupData.length;
            break;
          default:
            aggregatedData[field] = values[0] || 0;
        }
      });
      
      results[groupKey] = aggregatedData;
    });
    
    return Object.values(results);
  }

  static sortCsvData(data, sortBy, order = 'asc') {
    return [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (order === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }

  static paginateCsvData(data, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);
    
    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        pages: Math.ceil(data.length / limit)
      }
    };
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  static sanitizeFileName(fileName) {
    return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  static async exportToCsv(data, fileName, options = {}) {
    const sanitizedFileName = this.sanitizeFileName(fileName);
    const filePath = `./exports/${sanitizedFileName}.csv`;
    
    
    const fs = require('fs');
    const path = require('path');
    const exportsDir = path.dirname(filePath);
    
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    await this.writeCsv(filePath, data, options);
    
    return {
      filePath,
      fileName: `${sanitizedFileName}.csv`,
      count: data.length
    };
  }
}

module.exports = CsvUtils;
