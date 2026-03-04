const moment = require('moment');

class DateUtils {
  static formatDate(date, format = 'YYYY-MM-DD') {
    return moment(date).format(format);
  }

  static formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(date).format(format);
  }

  static getCurrentDate(format = 'YYYY-MM-DD') {
    return moment().format(format);
  }

  static getCurrentDateTime(format = 'YYYY-MM-DD HH:mm:ss') {
    return moment().format(format);
  }

  static addDays(date, days) {
    return moment(date).add(days, 'days').toDate();
  }

  static addMonths(date, months) {
    return moment(date).add(months, 'months').toDate();
  }

  static addYears(date, years) {
    return moment(date).add(years, 'years').toDate();
  }

  static subtractDays(date, days) {
    return moment(date).subtract(days, 'days').toDate();
  }

  static subtractMonths(date, months) {
    return moment(date).subtract(months, 'months').toDate();
  }

  static subtractYears(date, years) {
    return moment(date).subtract(years, 'years').toDate();
  }

  static getDaysBetween(startDate, endDate) {
    return moment(endDate).diff(moment(startDate), 'days');
  }

  static getMonthsBetween(startDate, endDate) {
    return moment(endDate).diff(moment(startDate), 'months');
  }

  static getYearsBetween(startDate, endDate) {
    return moment(endDate).diff(moment(startDate), 'years');
  }

  static isDateInRange(date, startDate, endDate) {
    const checkDate = moment(date);
    const start = moment(startDate);
    const end = moment(endDate);
    
    return checkDate.isBetween(start, end, null, '[]');
  }

  static isToday(date) {
    return moment(date).isSame(moment(), 'day');
  }

  static isThisWeek(date) {
    return moment(date).isSame(moment(), 'week');
  }

  static isThisMonth(date) {
    return moment(date).isSame(moment(), 'month');
  }

  static isThisYear(date) {
    return moment(date).isSame(moment(), 'year');
  }

  static getStartOfDay(date) {
    return moment(date).startOf('day').toDate();
  }

  static getEndOfDay(date) {
    return moment(date).endOf('day').toDate();
  }

  static getStartOfWeek(date) {
    return moment(date).startOf('week').toDate();
  }

  static getEndOfWeek(date) {
    return moment(date).endOf('week').toDate();
  }

  static getStartOfMonth(date) {
    return moment(date).startOf('month').toDate();
  }

  static getEndOfMonth(date) {
    return moment(date).endOf('month').toDate();
  }

  static getStartOfYear(date) {
    return moment(date).startOf('year').toDate();
  }

  static getEndOfYear(date) {
    return moment(date).endOf('year').toDate();
  }

  static getAge(birthDate) {
    return moment().diff(moment(birthDate), 'years');
  }

  static getWorkingDays(startDate, endDate) {
    let workingDays = 0;
    let currentDate = moment(startDate);
    const end = moment(endDate);

    while (currentDate.isSameOrBefore(end)) {
      // Monday to Friday are working days (1-5 in moment.js)
      if (currentDate.isoWeekday() <= 5) {
        workingDays++;
      }
      currentDate.add(1, 'day');
    }

    return workingDays;
  }

  static getBusinessDays(startDate, endDate, holidays = []) {
    let businessDays = 0;
    let currentDate = moment(startDate);
    const end = moment(endDate);

    while (currentDate.isSameOrBefore(end)) {
      // Check if it's a weekday (Monday-Friday)
      if (currentDate.isoWeekday() <= 5) {
        // Check if it's not a holiday
        const isHoliday = holidays.some(holiday => 
          moment(holiday).isSame(currentDate, 'day')
        );
        
        if (!isHoliday) {
          businessDays++;
        }
      }
      currentDate.add(1, 'day');
    }

    return businessDays;
  }

  static addWorkingDays(date, days) {
    let currentDate = moment(date);
    let workingDaysAdded = 0;

    while (workingDaysAdded < days) {
      currentDate.add(1, 'day');
      
      // Check if it's a weekday (Monday-Friday)
      if (currentDate.isoWeekday() <= 5) {
        workingDaysAdded++;
      }
    }

    return currentDate.toDate();
  }

  static getQuarter(date) {
    return moment(date).quarter();
  }

  static getWeekOfYear(date) {
    return moment(date).week();
  }

  static getDayOfYear(date) {
    return moment(date).dayOfYear();
  }

  static isValidDate(date) {
    return moment(date).isValid();
  }

  static parseDate(dateString, format = 'YYYY-MM-DD') {
    const parsed = moment(dateString, format, true);
    return parsed.isValid() ? parsed.toDate() : null;
  }

  static getRelativeTime(date) {
    return moment(date).fromNow();
  }

  static getTimeAgo(date) {
    return moment(date).fromNow();
  }

  static getTimeIn(date) {
    return moment(date).toNow();
  }

  static getCalendar(date) {
    return moment(date).calendar();
  }

  static humanizeDuration(milliseconds) {
    return moment.duration(milliseconds).humanize();
  }

  static getFiscalYear(date, fiscalYearStartMonth = 7) {
    const dateMoment = moment(date);
    const year = dateMoment.year();
    const month = dateMoment.month() + 1; // moment months are 0-indexed
    
    if (month >= fiscalYearStartMonth) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  static getFiscalYearStart(date, fiscalYearStartMonth = 7) {
    const dateMoment = moment(date);
    const year = dateMoment.year();
    const month = dateMoment.month() + 1;
    
    if (month >= fiscalYearStartMonth) {
      return moment(`${year}-${fiscalYearStartMonth}-01`, 'YYYY-MM-DD').toDate();
    } else {
      return moment(`${year - 1}-${fiscalYearStartMonth}-01`, 'YYYY-MM-DD').toDate();
    }
  }

  static getFiscalYearEnd(date, fiscalYearStartMonth = 7) {
    const start = this.getFiscalYearStart(date, fiscalYearStartMonth);
    return moment(start).add(1, 'year').subtract(1, 'day').toDate();
  }

  static getPayrollDate(date, payDay = 25) {
    const dateMoment = moment(date);
    const lastDayOfMonth = dateMoment.endOf('month');
    
    if (lastDayOfMonth.date() < payDay) {
      return lastDayOfMonth.toDate();
    } else {
      return dateMoment.date(payDay).toDate();
    }
  }

  static getNextPayrollDate(date, payDay = 25) {
    const currentPayroll = this.getPayrollDate(date, payDay);
    return this.addMonths(currentPayroll, 1);
  }

  static getLoanRepaymentDate(disbursementDate, paymentDay = 1) {
    const disbursementMoment = moment(disbursementDate);
    
    // If disbursement is after payment day, first payment is next month
    if (disbursementMoment.date() > paymentDay) {
      return disbursementMoment.add(1, 'month').date(paymentDay).toDate();
    } else {
      return disbursementMoment.date(paymentDay).toDate();
    }
  }

  static getNextLoanRepaymentDate(lastPaymentDate, paymentDay = 1) {
    return this.addMonths(lastPaymentDate, 1);
  }

  static isOverdue(dueDate, gracePeriodDays = 0) {
    const due = moment(dueDate);
    const now = moment().add(gracePeriodDays, 'days');
    return now.isAfter(due);
  }

  static getOverdueDays(dueDate) {
    const due = moment(dueDate);
    const now = moment();
    
    if (now.isAfter(due)) {
      return now.diff(due, 'days');
    }
    
    return 0;
  }

  static formatDuration(startDate, endDate) {
    const start = moment(startDate);
    const end = moment(endDate);
    
    const years = end.diff(start, 'years');
    const months = end.diff(start, 'months') % 12;
    const days = end.diff(start, 'days') % 30;
    
    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    
    return parts.join(', ') || '0 days';
  }
}

module.exports = DateUtils;
