
const MAX_INTEGER_DIGITS = 13

const integerFormatter = new Intl.NumberFormat('en-SG', {
  maximumFractionDigits: 0,
})

export function toCents(amount: string): bigint {
  const normalized = amount.trim()

  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized)

  if (!match) {
    throw new Error('Invalid monetary amount')
  }

  const integerPart = match[1]
  const fractionPart = (match[2] ?? '').padEnd(2, '0')

  if (integerPart.length > MAX_INTEGER_DIGITS + 10) {
    throw new Error('Monetary amount is too large')
  }

  const cents =
    BigInt(integerPart) * 100n + BigInt(fractionPart)

  if (cents > 999999999999999n) {
    throw new Error('Monetary amount is too large')
  }

  return cents
}

export function formatCents(cents: bigint): string {
  const negative = cents < 0n
  const absolute = negative ? -cents : cents

  const whole = absolute / 100n
  const fraction = (absolute % 100n)
    .toString()
    .padStart(2, '0')

  return `${negative ? '-' : ''}S$${integerFormatter.format(whole)}.${fraction}`
}

export function formatMoney(amount: string): string {
  return formatCents(toCents(amount))
}

export function sumAmounts(amounts: string[]): bigint {
  return amounts.reduce(
    (total, amount) => total + toCents(amount),
    0n
  )
}
