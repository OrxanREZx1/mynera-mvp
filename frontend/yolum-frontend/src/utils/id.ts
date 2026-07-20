let counter = 0

/**
 * Generates a reasonably-unique client-side id for optimistic UI items
 * (draft messages, temp conversations, etc.) before the backend assigns a
 * real one. Kept as a plain module-level function (not inline Date.now()
 * calls inside components) so it's unambiguous this impurity never runs
 * during render.
 */
export function createId(prefix = 'id'): string {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}
