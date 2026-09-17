export const ROLES = Object.freeze({
  USER: 'user',
  ELITE: 'elite',
  DEVELOPER: 'developer'
});

export const ROLE_RANK = Object.freeze({
  [ROLES.USER]: 0,
  [ROLES.ELITE]: 1,
  [ROLES.DEVELOPER]: 2
});

export function normalizeRole(value) {
  const role = String(value || '').trim().toLowerCase();
  return Object.hasOwn(ROLE_RANK, role) ? role : null;
}

export function hasRole(role, required = ROLES.USER) {
  const actual = normalizeRole(role);
  const needed = normalizeRole(required) || ROLES.USER;
  return actual !== null && ROLE_RANK[actual] >= ROLE_RANK[needed];
}
