class MathUtils {
  static roundToDecimal(number, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(number * factor) / factor;
  }

  static roundToNearest(number, nearest) {
    return Math.round(number / nearest) * nearest;
  }

  static floorToDecimal(number, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.floor(number * factor) / factor;
  }

  static ceilToDecimal(number, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.ceil(number * factor) / factor;
  }

  static formatCurrency(amount, currency = 'ETB', decimals = 2) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  }

  static formatNumber(number, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  }

  static calculatePercentage(part, total, decimals = 2) {
    if (total === 0) return 0;
    return this.roundToDecimal((part / total) * 100, decimals);
  }

  static calculatePercentageChange(oldValue, newValue, decimals = 2) {
    if (oldValue === 0) return 0;
    return this.roundToDecimal(((newValue - oldValue) / oldValue) * 100, decimals);
  }

  static calculateSimpleInterest(principal, rate, time) {
    return principal * (rate / 100) * time;
  }

  static calculateCompoundInterest(principal, rate, time, compoundsPerYear = 1) {
    const amount = principal * Math.pow((1 + (rate / 100) / compoundsPerYear), compoundsPerYear * time);
    return amount - principal;
  }

  static calculateLoanPayment(principal, annualRate, months) {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) {
      return principal / months;
    }
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    
    return this.roundToDecimal(payment, 2);
  }

  static calculateLoanSchedule(principal, annualRate, months) {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = this.calculateLoanPayment(principal, annualRate, months);
    
    let balance = principal;
    const schedule = [];
    
    for (let i = 1; i <= months; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    
    return schedule;
  }

  static calculateAmortization(principal, annualRate, loanTerm) {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = this.calculateLoanPayment(principal, annualRate, loanTerm);
    const totalPayment = monthlyPayment * loanTerm;
    const totalInterest = totalPayment - principal;
    
    return {
      principal,
      annualRate,
      loanTerm,
      monthlyRate,
      monthlyPayment,
      totalPayment,
      totalInterest
    };
  }

  static calculateEarlySettlement(balance, annualRate, remainingMonths) {
    const monthlyRate = annualRate / 100 / 12;
    
    
    let presentValue = 0;
    for (let i = 1; i <= remainingMonths; i++) {
      const payment = this.calculateLoanPayment(balance, annualRate, remainingMonths);
      presentValue += payment / Math.pow(1 + monthlyRate, i);
    }
    
    return this.roundToDecimal(presentValue, 2);
  }

  static calculatePenalty(amount, penaltyRate, daysOverdue) {
    return this.roundToDecimal(amount * (penaltyRate / 100) * (daysOverdue / 30), 2);
  }

  static calculateLateFee(paymentAmount, lateFeeRate, flatFee = 0) {
    const percentageFee = paymentAmount * (lateFeeRate / 100);
    return this.roundToDecimal(percentageFee + flatFee, 2);
  }

  static calculateSavingsTarget(monthlyIncome, savingPercentage, months) {
    const monthlySavings = monthlyIncome * (savingPercentage / 100);
    const totalSavings = monthlySavings * months;
    
    return {
      monthlyIncome,
      savingPercentage,
      monthlySavings,
      months,
      totalSavings
    };
  }

  static calculateRetirementSavings(currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn) {
    const yearsToRetirement = retirementAge - currentAge;
    const months = yearsToRetirement * 12;
    const monthlyRate = expectedReturn / 100 / 12;
    
    
    const futureValueCurrent = currentSavings * Math.pow(1 + monthlyRate, months);
    
    
    const futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    const totalFutureValue = futureValueCurrent + futureValueContributions;
    
    return {
      currentAge,
      retirementAge,
      yearsToRetirement,
      currentSavings,
      monthlyContribution,
      expectedReturn,
      futureValueCurrent,
      futureValueContributions,
      totalFutureValue
    };
  }

  static calculateDebtToIncomeRatio(monthlyDebtPayments, monthlyIncome) {
    if (monthlyIncome === 0) return 0;
    return this.roundToDecimal((monthlyDebtPayments / monthlyIncome) * 100, 2);
  }

  static calculateLoanToValueRatio(loanAmount, propertyValue) {
    if (propertyValue === 0) return 0;
    return this.roundToDecimal((loanAmount / propertyValue) * 100, 2);
  }

  static calculateDebtServiceCoverageRatio(netOperatingIncome, totalDebtService) {
    if (totalDebtService === 0) return 0;
    return this.roundToDecimal(netOperatingIncome / totalDebtService, 2);
  }

  static calculateGrowthRate(startValue, endValue, periods) {
    if (startValue === 0) return 0;
    return this.roundToDecimal((Math.pow(endValue / startValue, 1 / periods) - 1) * 100, 2);
  }

  static calculateCAGR(startValue, endValue, years) {
    return this.calculateGrowthRate(startValue, endValue, years);
  }

  static calculateNPV(cashFlows, discountRate) {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + discountRate / 100, i);
    }
    return this.roundToDecimal(npv, 2);
  }

  static calculateIRR(cashFlows, guess = 0.1) {
    
    let rate = guess;
    const maxIterations = 100;
    const tolerance = 0.0001;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      
      for (let j = 0; j < cashFlows.length; j++) {
        npv += cashFlows[j] / Math.pow(1 + rate, j);
        dnpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
      }
      
      if (Math.abs(npv) < tolerance) {
        return this.roundToDecimal(rate * 100, 2);
      }
      
      rate = rate - npv / dnpv;
    }
    
    return this.roundToDecimal(rate * 100, 2);
  }

  static calculateROI(initialInvestment, finalValue) {
    if (initialInvestment === 0) return 0;
    return this.roundToDecimal(((finalValue - initialInvestment) / initialInvestment) * 100, 2);
  }

  static calculateROE(netIncome, shareholdersEquity) {
    if (shareholdersEquity === 0) return 0;
    return this.roundToDecimal((netIncome / shareholdersEquity) * 100, 2);
  }

  static calculateROA(netIncome, totalAssets) {
    if (totalAssets === 0) return 0;
    return this.roundToDecimal((netIncome / totalAssets) * 100, 2);
  }

  static calculateCurrentRatio(currentAssets, currentLiabilities) {
    if (currentLiabilities === 0) return 0;
    return this.roundToDecimal(currentAssets / currentLiabilities, 2);
  }

  static calculateQuickRatio(quickAssets, currentLiabilities) {
    if (currentLiabilities === 0) return 0;
    return this.roundToDecimal(quickAssets / currentLiabilities, 2);
  }

  static calculateBreakEvenPoint(fixedCosts, variableCostPerUnit, pricePerUnit) {
    const contributionMargin = pricePerUnit - variableCostPerUnit;
    if (contributionMargin <= 0) return 0;
    return this.roundToDecimal(fixedCosts / contributionMargin, 2);
  }

  static calculateMarginOfSafety(actualSales, breakEvenSales) {
    if (breakEvenSales === 0) return 0;
    return this.roundToDecimal(((actualSales - breakEvenSales) / actualSales) * 100, 2);
  }

  static sum(numbers) {
    return numbers.reduce((sum, num) => sum + (parseFloat(num) || 0), 0);
  }

  static average(numbers) {
    if (numbers.length === 0) return 0;
    return this.sum(numbers) / numbers.length;
  }

  static median(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  static mode(numbers) {
    const frequency = {};
    let maxCount = 0;
    let modes = [];
    
    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
      if (frequency[num] > maxCount) {
        maxCount = frequency[num];
        modes = [num];
      } else if (frequency[num] === maxCount) {
        modes.push(num);
      }
    });
    
    return modes.length === 1 ? modes[0] : modes;
  }

  static standardDeviation(numbers) {
    const mean = this.average(numbers);
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
    const variance = this.average(squaredDifferences);
    return Math.sqrt(variance);
  }

  static min(numbers) {
    return Math.min(...numbers);
  }

  static max(numbers) {
    return Math.max(...numbers);
  }

  static range(numbers) {
    return this.max(numbers) - this.min(numbers);
  }

  static clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  static randomBetween(min, max, decimals = 0) {
    const random = Math.random() * (max - min) + min;
    return decimals > 0 ? this.roundToDecimal(random, decimals) : Math.round(random);
  }
}

module.exports = MathUtils;
