export interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}