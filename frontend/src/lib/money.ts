const GRAPHQL_INT_MAX = 2_147_483_647

function parseDigitGroup(group: string): number | null {
  if (!/^\d+$/.test(group)) {
    return null
  }

  let value = 0

  for (const char of group) {
    value = value * 10 + (char.charCodeAt(0) - 48)

    if (value > GRAPHQL_INT_MAX) {
      return null
    }
  }

  return value
}

/**
 * BR-MONEY-001: localized money stays a string until this boundary, then becomes integer cents.
 * `10,05` → `1005`. Thousands use `.` (`1.234,56`).
 */
export function parseLocalizedAmountToCents(value: string): number | null {
  const normalized = value.replace(/\p{Cf}/gu, '').trim()

  if (normalized === '') {
    return null
  }

  const match = /^(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?$/.exec(normalized)

  if (!match) {
    return null
  }

  const reais = parseDigitGroup(match[1].replaceAll('.', ''))

  if (reais === null) {
    return null
  }

  const fraction = match[2] ?? ''
  const cents =
    fraction === '' ? 0 : fraction.length === 1 ? (parseDigitGroup(fraction) ?? -1) * 10 : parseDigitGroup(fraction)

  if (cents === null || cents < 0) {
    return null
  }

  const amountInCents = reais * 100 + cents

  if (amountInCents < 1 || amountInCents > GRAPHQL_INT_MAX) {
    return null
  }

  return amountInCents
}

export function formatCentsToBRL(amountInCents: number): string {
  const sign = amountInCents < 0 ? '-' : ''
  const absolute = amountInCents < 0 ? -amountInCents : amountInCents
  const reais = Math.trunc(absolute / 100)
  const cents = absolute % 100
  const grouped = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${sign}R$ ${grouped},${String(cents).padStart(2, '0')}`
}

export function formatCentsForInput(amountInCents: number): string {
  const reais = Math.trunc(amountInCents / 100)
  const cents = amountInCents % 100

  return `${reais},${String(cents).padStart(2, '0')}`
}

export function occurredOnFromIso(iso: string): string {
  return iso.slice(0, 10)
}

export function occurredAtFromDateInput(isoDate: string): string {
  return `${isoDate}T12:00:00.000Z`
}

export function formatOccurredOn(iso: string): string {
  const [year, month, day] = occurredOnFromIso(iso).split('-')

  return `${day}/${month}/${year}`
}
