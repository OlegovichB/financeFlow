
export type AnalyticsPeriod = 3 | 6 | 12

const ANALYTICS_PERIOD_KEY = 'financeflow.analyticsPeriod'

export function isAnalyticsPeriod(
  value: number
): value is AnalyticsPeriod {
  return value === 3 || value === 6 || value === 12
}

export function getAnalyticsPeriodPreference(): AnalyticsPeriod {
  try {
    const storedValue = localStorage.getItem(ANALYTICS_PERIOD_KEY)

    if (storedValue === null) {
      return 6
    }

    const period = Number(storedValue)

    return isAnalyticsPeriod(period) ? period : 6
  } catch {
    return 6
  }
}

export function saveAnalyticsPeriodPreference(
  period: AnalyticsPeriod
): boolean {
  try {
    localStorage.setItem(
      ANALYTICS_PERIOD_KEY,
      String(period)
    )

    return true
  } catch {
    return false
  }
}

export function resetAnalyticsPeriodPreference(): boolean {
  try {
    localStorage.removeItem(ANALYTICS_PERIOD_KEY)

    return true
  } catch {
    return false
  }
}
