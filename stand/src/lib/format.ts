export function aed(n: number, signed = false) {
  const abs = Math.abs(n).toLocaleString('en-AE')
  if (!signed) return `AED ${abs}`
  if (n > 0) return `+ AED ${abs}`
  if (n < 0) return `− AED ${abs}`
  return `AED ${abs}`
}

export function aedPlain(n: number) {
  return n.toLocaleString('en-AE')
}
