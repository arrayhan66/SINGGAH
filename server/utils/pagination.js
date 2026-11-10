const MAX_LIMIT_PUBLIC = 100;
const MAX_LIMIT_ADMIN = 500;
const HARD_MAX_LIMIT = 1000;

function toPositiveInt(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function parsePagination(query = {}, options = {}) {
  const defaultLimit = Math.min(
    Math.max(1, options.defaultLimit ?? 10),
    HARD_MAX_LIMIT,
  );
  const maxLimit = Math.min(
    Math.max(defaultLimit, options.maxLimit ?? MAX_LIMIT_PUBLIC),
    HARD_MAX_LIMIT,
  );

  const page = Math.max(1, toPositiveInt(query.page) ?? 1);
  const requested = toPositiveInt(query.limit) ?? defaultLimit;
  const limit = Math.min(Math.max(1, requested), maxLimit);

  return { page, limit, offset: (page - 1) * limit };
}

// Batas dependensi role admin. Dipisah supaya service cukup mengimpor
// modul ini tanpa tahu soal request/middleware.
function limitForRole(role, defaultLimit) {
  return {
    defaultLimit,
    maxLimit: role === "admin" ? MAX_LIMIT_ADMIN : MAX_LIMIT_PUBLIC,
  };
}

module.exports = {
  parsePagination,
  limitForRole,
  MAX_LIMIT_PUBLIC,
  MAX_LIMIT_ADMIN,
  HARD_MAX_LIMIT,
};
