const PDFDocument = require('pdfkit');
const fs = require('fs');

class PdfUtils {
  static createDocument(options = {}) {
    const defaultOptions = {
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      info: {
        Title: 'Document',
        Author: 'Microfinance System',
        Subject: 'Generated Document',
        Creator: 'Microfinance System',
        Producer: 'Microfinance System'
      },
      ...options
    };
    
    return new PDFDocument(defaultOptions);
  }

  static async generateReport(data, template, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = this.createDocument({
          info: {
            Title: template.title || 'Report',
            Subject: template.description || 'Generated Report'
          }
        });
        
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        
        // Add header
        if (template.header) {
          this.addHeader(doc, template.header, data);
        }
        
        // Add content
        if (template.content) {
          this.addContent(doc, template.content, data);
        }
        
        // Add footer
        if (template.footer) {
          this.addFooter(doc, template.footer, data);
        }
        
        doc.end();
        
        stream.on('finish', () => {
          resolve({
            filePath: outputPath,
            message: 'PDF generated successfully'
          });
        });
        
        stream.on('error', (error) => {
          reject(new Error(`PDF generation error: ${error.message}`));
        });
        
      } catch (error) {
        reject(new Error(`PDF creation error: ${error.message}`));
      }
    });
  }

  static addHeader(doc, headerTemplate, data) {
    const { title, subtitle, logo, date } = headerTemplate;
    
    // Add logo if provided
    if (logo && logo.path && fs.existsSync(logo.path)) {
      doc.image(logo.path, 50, 50, { width: logo.width || 100 });
    }
    
    // Add title
    if (title) {
      const processedTitle = this.processTemplate(title, data);
      doc.fontSize(20).font('Helvetica-Bold').text(processedTitle, { align: 'center' });
      doc.moveDown();
    }
    
    // Add subtitle
    if (subtitle) {
      const processedSubtitle = this.processTemplate(subtitle, data);
      doc.fontSize(14).font('Helvetica').text(processedSubtitle, { align: 'center' });
      doc.moveDown();
    }
    
    // Add date
    if (date !== false) {
      const dateText = date || new Date().toLocaleDateString();
      doc.fontSize(10).font('Helvetica').text(`Generated: ${dateText}`, { align: 'right' });
      doc.moveDown();
    }
    
    // Add separator line
    doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
  }

  static addContent(doc, contentTemplate, data) {
    contentTemplate.forEach(section => {
      if (section.type === 'text') {
        this.addTextSection(doc, section, data);
      } else if (section.type === 'table') {
        this.addTableSection(doc, section, data);
      } else if (section.type === 'list') {
        this.addListSection(doc, section, data);
      } else if (section.type === 'chart') {
        this.addChartSection(doc, section, data);
      }
    });
  }

  static addTextSection(doc, section, data) {
    const { text, style = 'normal', size = 12, spacing = 1 } = section;
    const processedText = this.processTemplate(text, data);
    
    switch (style) {
      case 'heading':
        doc.fontSize(size || 16).font('Helvetica-Bold').text(processedText);
        break;
      case 'subheading':
        doc.fontSize(size || 14).font('Helvetica-Bold').text(processedText);
        break;
      case 'bold':
        doc.fontSize(size).font('Helvetica-Bold').text(processedText);
        break;
      default:
        doc.fontSize(size).font('Helvetica').text(processedText);
    }
    
    doc.moveDown(spacing);
  }

  static addTableSection(doc, section, data) {
    const { headers, rows, style = {} } = section;
    const { headerStyle = {}, rowStyle = {}, cellPadding = 5, borderWidth = 1 } = style;
    
    const tableTop = doc.y;
    let currentY = tableTop;
    
    // Calculate column widths
    const columnWidths = headers.map(header => header.width || 100);
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const startX = (doc.page.width - totalWidth) / 2;
    
    // Draw headers
    let currentX = startX;
    headers.forEach((header, index) => {
      const headerText = this.processTemplate(header.text || header, data);
      
      doc.fontSize(headerStyle.size || 12)
         .font(headerStyle.font || 'Helvetica-Bold')
         .text(headerText, currentX + cellPadding, currentY + cellPadding, {
           width: columnWidths[index] - (cellPadding * 2),
           align: header.align || 'left'
         });
      
      // Draw cell border
      if (borderWidth > 0) {
        doc.rect(currentX, currentY, columnWidths[index], 25).stroke();
      }
      
      currentX += columnWidths[index];
    });
    
    currentY += 25;
    
    // Draw rows
    const tableData = this.processTemplate(rows, data);
    tableData.forEach((row, rowIndex) => {
      currentX = startX;
      
      headers.forEach((header, colIndex) => {
        const cellData = row[header.key] || '';
        const processedCellData = this.processTemplate(cellData, data);
        
        doc.fontSize(rowStyle.size || 10)
           .font(rowStyle.font || 'Helvetica')
           .text(processedCellData, currentX + cellPadding, currentY + cellPadding, {
             width: columnWidths[colIndex] - (cellPadding * 2),
             align: rowStyle.align || 'left'
           });
        
        // Draw cell border
        if (borderWidth > 0) {
          doc.rect(currentX, currentY, columnWidths[colIndex], 20).stroke();
        }
        
        currentX += columnWidths[colIndex];
      });
      
      currentY += 20;
      
      // Check if we need a new page
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;
      }
    });
    
    doc.y = currentY + 20;
  }

  static addListSection(doc, section, data) {
    const { items, style = {} } = section;
    const { bullet = '•', spacing = 1, indent = 20 } = style;
    
    const listData = this.processTemplate(items, data);
    
    listData.forEach(item => {
      const processedItem = this.processTemplate(item, data);
      doc.fontSize(style.size || 12)
         .font(style.font || 'Helvetica')
         .text(`${bullet} ${processedItem}`, { indent });
      doc.moveDown(spacing);
    });
  }

  static addChartSection(doc, section, data) {
    // Placeholder for chart functionality
    // In a real implementation, you would use a library like chart.js to generate
    // chart images and embed them in the PDF
    
    const { title, type, chartData } = section;
    const processedTitle = this.processTemplate(title, data);
    
    doc.fontSize(14).font('Helvetica-Bold').text(processedTitle);
    doc.moveDown();
    
    // Add placeholder for chart
    doc.fontSize(10).font('Helvetica-Oblique').text('[Chart would be rendered here]', { align: 'center' });
    doc.moveDown(2);
  }

  static addFooter(doc, footerTemplate, data) {
    const { text, pageNumber, company } = footerTemplate;
    
    // Move to bottom of page
    const pageHeight = doc.page.height;
    const bottomMargin = 50;
    
    doc.y = pageHeight - bottomMargin;
    
    // Add separator line
    doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    
    // Add footer text
    if (text) {
      const processedText = this.processTemplate(text, data);
      doc.fontSize(8).font('Helvetica').text(processedText, { align: 'center' });
      doc.moveDown();
    }
    
    // Add page number
    if (pageNumber) {
      const pageNum = doc.bufferedPageRange().count;
      doc.fontSize(8).font('Helvetica').text(`Page ${pageNum}`, { align: 'center' });
      doc.moveDown();
    }
    
    // Add company info
    if (company) {
      doc.fontSize(8).font('Helvetica').text(company, { align: 'center' });
    }
  }

  static processTemplate(template, data) {
    if (typeof template === 'string') {
      return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const value = this.getNestedValue(data, path);
        return value !== undefined ? value : match;
      });
    } else if (Array.isArray(template)) {
      return template.map(item => this.processTemplate(item, data));
    } else if (typeof template === 'object' && template !== null) {
      const result = {};
      Object.keys(template).forEach(key => {
        result[key] = this.processTemplate(template[key], data);
      });
      return result;
    }
    
    return template;
  }

  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  static async generateLoanStatement(loanData, outputPath) {
    const template = {
      title: 'Loan Statement',
      subtitle: '{{companyName}} - Loan Account Statement',
      header: {
        title: 'Loan Statement',
        subtitle: 'Account: {{loanNumber}}',
        date: '{{statementDate}}'
      },
      content: [
        {
          type: 'text',
          text: 'Borrower Information:',
          style: 'subheading'
        },
        {
          type: 'text',
          text: 'Name: {{borrowerName}}\nEmployee ID: {{employeeId}}\nDepartment: {{department}}'
        },
        {
          type: 'text',
          text: 'Loan Details:',
          style: 'subheading'
        },
        {
          type: 'text',
          text: 'Loan Amount: {{loanAmount}}\nInterest Rate: {{interestRate}}%\nTerm: {{loanTerm}} months\nMonthly Payment: {{monthlyPayment}}'
        },
        {
          type: 'table',
          headers: [
            { text: 'Payment Date', key: 'paymentDate', width: 100 },
            { text: 'Payment', key: 'payment', width: 80 },
            { text: 'Principal', key: 'principal', width: 80 },
            { text: 'Interest', key: 'interest', width: 80 },
            { text: 'Balance', key: 'balance', width: 80 }
          ],
          rows: '{{paymentHistory}}',
          style: {
            headerStyle: { font: 'Helvetica-Bold' },
            borderWidth: 1
          }
        }
      ],
      footer: {
        text: 'This is a computer-generated statement. If you have any questions, please contact us.',
        pageNumber: true,
        company: '{{companyName}} - Microfinance System'
      }
    };
    
    return this.generateReport(loanData, template, outputPath);
  }

  static async generateSavingsStatement(savingsData, outputPath) {
    const template = {
      title: 'Savings Statement',
      subtitle: '{{companyName}} - Savings Account Statement',
      header: {
        title: 'Savings Statement',
        subtitle: 'Account: {{accountNumber}}',
        date: '{{statementDate}}'
      },
      content: [
        {
          type: 'text',
          text: 'Account Holder Information:',
          style: 'subheading'
        },
        {
          type: 'text',
          text: 'Name: {{accountHolderName}}\nEmployee ID: {{employeeId}}\nDepartment: {{department}}'
        },
        {
          type: 'text',
          text: 'Account Details:',
          style: 'subheading'
        },
        {
          type: 'text',
          text: 'Saving Percentage: {{savingPercentage}}%\nCurrent Balance: {{currentBalance}}\nAccount Status: {{accountStatus}}'
        },
        {
          type: 'table',
          headers: [
            { text: 'Transaction Date', key: 'transactionDate', width: 100 },
            { text: 'Type', key: 'transactionType', width: 80 },
            { text: 'Description', key: 'description', width: 150 },
            { text: 'Amount', key: 'amount', width: 80 },
            { text: 'Balance', key: 'balance', width: 80 }
          ],
          rows: '{{transactions}}',
          style: {
            headerStyle: { font: 'Helvetica-Bold' },
            borderWidth: 1
          }
        }
      ],
      footer: {
        text: 'This is a computer-generated statement. If you have any questions, please contact us.',
        pageNumber: true,
        company: '{{companyName}} - Microfinance System'
      }
    };
    
    return this.generateReport(savingsData, template, outputPath);
  }

  static async generateFinancialReport(reportData, outputPath) {
    const template = {
      title: 'Financial Report',
      subtitle: '{{companyName}} - Financial Summary',
      header: {
        title: 'Financial Report',
        subtitle: 'Period: {{reportPeriod}}',
        date: '{{reportDate}}'
      },
      content: [
        {
          type: 'text',
          text: 'Executive Summary:',
          style: 'subheading'
        },
        {
          type: 'text',
          text: '{{summary}}'
        },
        {
          type: 'text',
          text: 'Key Metrics:',
          style: 'subheading'
        },
        {
          type: 'table',
          headers: [
            { text: 'Metric', key: 'metric', width: 150 },
            { text: 'Current Period', key: 'current', width: 100 },
            { text: 'Previous Period', key: 'previous', width: 100 },
            { text: 'Change', key: 'change', width: 100 }
          ],
          rows: '{{metrics}}',
          style: {
            headerStyle: { font: 'Helvetica-Bold' },
            borderWidth: 1
          }
        }
      ],
      footer: {
        text: 'Confidential Financial Report - For Internal Use Only',
        pageNumber: true,
        company: '{{companyName}} - Microfinance System'
      }
    };
    
    return this.generateReport(reportData, template, outputPath);
  }

  static async generatePdfBuffer(data, template) {
    return new Promise((resolve, reject) => {
      try {
        const doc = this.createDocument({
          info: {
            Title: template.title || 'Document',
            Subject: template.description || 'Generated Document'
          }
        });
        
        const buffers = [];
        
        doc.on('data', (chunk) => {
          buffers.push(chunk);
        });
        
        // Add header
        if (template.header) {
          this.addHeader(doc, template.header, data);
        }
        
        // Add content
        if (template.content) {
          this.addContent(doc, template.content, data);
        }
        
        // Add footer
        if (template.footer) {
          this.addFooter(doc, template.footer, data);
        }
        
        doc.end();
        
        doc.on('end', () => {
          const buffer = Buffer.concat(buffers);
          resolve(buffer);
        });
        
        doc.on('error', (error) => {
          reject(new Error(`PDF buffer generation error: ${error.message}`));
        });
        
      } catch (error) {
        reject(new Error(`PDF creation error: ${error.message}`));
      }
    });
  }

  static async mergePdfs(pdfPaths, outputPath) {
    // Placeholder for PDF merging functionality
    // In a real implementation, you would use a library like pdf-merger-js or pdf-lib
    throw new Error('PDF merging functionality not implemented yet');
  }

  static async addWatermark(inputPath, outputPath, watermarkText) {
    // Placeholder for watermark functionality
    // In a real implementation, you would open the existing PDF and add watermark
    throw new Error('Watermark functionality not implemented yet');
  }
}

module.exports = PdfUtils;
