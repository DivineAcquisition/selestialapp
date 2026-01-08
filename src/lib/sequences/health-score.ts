/**
 * Customer Health Score Calculation
 * 
 * Health score ranges from 0-100 and determines risk level:
 * - 70-100: Healthy (green)
 * - 40-69: Yellow (warning)
 * - 1-39: Red (at-risk)
 * - 0: Churned
 */

export type RiskLevel = 'healthy' | 'yellow' | 'red' | 'churned'

export interface HealthScoreFactors {
  recency: number        // Days since last job
  engagement: number     // Days since last response
  frequency: number      // Actual vs expected frequency
  paymentIssues: boolean // Has failed payments
  complaintCount: number // Number of complaints
  customerType: 'one_time' | 'recurring' | 'vip'
  firstJobDate?: Date    // For calculating expected frequency
  totalJobs?: number     // Total jobs completed
}

export interface HealthScoreResult {
  score: number
  riskLevel: RiskLevel
  factors: {
    recency: { points: number; description: string }
    engagement: { points: number; description: string }
    frequency: { points: number; description: string }
    payment: { points: number; description: string }
    complaints: { points: number; description: string }
  }
  recommendations: string[]
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date | null | undefined, date2: Date): number {
  if (!date1) return Infinity
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate months since first job
 */
function monthsSinceFirstJob(firstJobDate: Date | undefined): number {
  if (!firstJobDate) return 1
  const now = new Date()
  const first = new Date(firstJobDate)
  const months = (now.getFullYear() - first.getFullYear()) * 12 + 
                 (now.getMonth() - first.getMonth())
  return Math.max(1, months)
}

/**
 * Get expected frequency for recurring customers (jobs per month)
 * This would ideally come from the customer's service plan
 */
function getExpectedFrequency(customerType: string): number {
  switch (customerType) {
    case 'recurring':
      return 1 // Monthly service expected
    case 'vip':
      return 2 // Bi-weekly or premium service
    default:
      return 0.25 // One-time customers: 1 job per quarter is healthy
  }
}

/**
 * Calculate the customer health score
 */
export function calculateHealthScore(factors: HealthScoreFactors): HealthScoreResult {
  let score = 100
  const factorResults: HealthScoreResult['factors'] = {
    recency: { points: 0, description: '' },
    engagement: { points: 0, description: '' },
    frequency: { points: 0, description: '' },
    payment: { points: 0, description: '' },
    complaints: { points: 0, description: '' },
  }
  const recommendations: string[] = []

  // ========================================
  // RECENCY SCORE (max -40 points)
  // ========================================
  if (factors.recency > 180) {
    factorResults.recency.points = -40
    factorResults.recency.description = 'No activity in 6+ months'
    recommendations.push('Launch win-back campaign immediately')
  } else if (factors.recency > 90) {
    factorResults.recency.points = -25
    factorResults.recency.description = 'No activity in 3+ months'
    recommendations.push('Consider reactivation outreach')
  } else if (factors.recency > 60) {
    factorResults.recency.points = -15
    factorResults.recency.description = 'No activity in 2+ months'
    recommendations.push('Schedule a check-in call')
  } else if (factors.recency > 30) {
    factorResults.recency.points = -5
    factorResults.recency.description = 'No activity in 1+ month'
  } else {
    factorResults.recency.description = 'Recent activity'
  }
  score += factorResults.recency.points

  // ========================================
  // ENGAGEMENT SCORE (max -30 points)
  // ========================================
  if (factors.engagement > 90) {
    factorResults.engagement.points = -30
    factorResults.engagement.description = 'No response in 90+ days'
    recommendations.push('Try different communication channel')
  } else if (factors.engagement > 60) {
    factorResults.engagement.points = -20
    factorResults.engagement.description = 'No response in 60+ days'
    recommendations.push('Send personalized outreach')
  } else if (factors.engagement > 30) {
    factorResults.engagement.points = -10
    factorResults.engagement.description = 'No response in 30+ days'
  } else {
    factorResults.engagement.description = 'Recently engaged'
  }
  score += factorResults.engagement.points

  // ========================================
  // FREQUENCY SCORE (max -20 points) - for recurring customers
  // ========================================
  if (factors.customerType === 'recurring' || factors.customerType === 'vip') {
    const expectedFrequency = getExpectedFrequency(factors.customerType)
    const monthsActive = monthsSinceFirstJob(factors.firstJobDate)
    const actualFrequency = (factors.totalJobs || 0) / monthsActive

    if (actualFrequency < expectedFrequency * 0.5) {
      factorResults.frequency.points = -20
      factorResults.frequency.description = 'Way below expected frequency'
      recommendations.push('Review service schedule and customer needs')
    } else if (actualFrequency < expectedFrequency * 0.75) {
      factorResults.frequency.points = -10
      factorResults.frequency.description = 'Below expected frequency'
      recommendations.push('Check if customer needs schedule adjustment')
    } else {
      factorResults.frequency.description = 'Meeting expected frequency'
    }
    score += factorResults.frequency.points
  } else {
    factorResults.frequency.description = 'N/A (one-time customer)'
  }

  // ========================================
  // PAYMENT SCORE (max -10 points)
  // ========================================
  if (factors.paymentIssues) {
    factorResults.payment.points = -10
    factorResults.payment.description = 'Has failed payment(s)'
    recommendations.push('Resolve payment issues before next service')
  } else {
    factorResults.payment.description = 'No payment issues'
  }
  score += factorResults.payment.points

  // ========================================
  // COMPLAINTS SCORE (max -10 points, -5 per complaint)
  // ========================================
  const complaintDeduction = Math.min(factors.complaintCount * 5, 10)
  if (complaintDeduction > 0) {
    factorResults.complaints.points = -complaintDeduction
    factorResults.complaints.description = `${factors.complaintCount} complaint(s) on file`
    recommendations.push('Review and address customer complaints')
  } else {
    factorResults.complaints.description = 'No complaints'
  }
  score += factorResults.complaints.points

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score))

  return {
    score,
    riskLevel: getRiskLevel(score),
    factors: factorResults,
    recommendations,
  }
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'healthy'
  if (score >= 40) return 'yellow'
  if (score > 0) return 'red'
  return 'churned'
}

/**
 * Get color for risk level (for UI)
 */
export function getRiskLevelColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'healthy':
      return 'emerald'
    case 'yellow':
      return 'amber'
    case 'red':
      return 'red'
    case 'churned':
      return 'gray'
    default:
      return 'gray'
  }
}

/**
 * Get display text for risk level
 */
export function getRiskLevelText(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'healthy':
      return 'Healthy'
    case 'yellow':
      return 'At Risk'
    case 'red':
      return 'High Risk'
    case 'churned':
      return 'Churned'
    default:
      return 'Unknown'
  }
}

/**
 * Bulk calculate health scores for multiple customers
 */
export function calculateBulkHealthScores(
  customers: Array<{
    id: string
    last_job_date: Date | null
    last_response_date: Date | null
    customer_type: 'one_time' | 'recurring' | 'vip'
    first_job_date?: Date
    total_jobs?: number
    has_failed_payment?: boolean
    complaint_count?: number
  }>
): Map<string, HealthScoreResult> {
  const results = new Map<string, HealthScoreResult>()
  const now = new Date()

  for (const customer of customers) {
    const result = calculateHealthScore({
      recency: daysBetween(customer.last_job_date, now),
      engagement: daysBetween(customer.last_response_date, now),
      frequency: 0, // Will be calculated inside
      customerType: customer.customer_type,
      firstJobDate: customer.first_job_date,
      totalJobs: customer.total_jobs,
      paymentIssues: customer.has_failed_payment || false,
      complaintCount: customer.complaint_count || 0,
    })
    results.set(customer.id, result)
  }

  return results
}

/**
 * Determine if customer should be flagged for at-risk intervention
 */
export function shouldTriggerAtRiskSequence(
  currentScore: number,
  previousScore: number | null,
  customerType: string
): boolean {
  // Only trigger for recurring customers
  if (customerType !== 'recurring' && customerType !== 'vip') {
    return false
  }

  // Trigger if score drops below 50
  if (currentScore < 50) {
    // And either no previous score, or score dropped significantly
    if (previousScore === null || previousScore - currentScore >= 10) {
      return true
    }
  }

  return false
}

/**
 * Get customers that need health score recalculation
 * (those whose scores might have changed based on time passing)
 */
export function getCustomersNeedingRecalculation(
  lastCalculated: Date,
  now: Date = new Date()
): { daysSince: number; shouldRecalculate: boolean } {
  const daysSince = daysBetween(lastCalculated, now)
  
  // Recalculate daily for at-risk detection
  return {
    daysSince,
    shouldRecalculate: daysSince >= 1,
  }
}
