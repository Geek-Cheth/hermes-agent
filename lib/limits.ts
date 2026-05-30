export const MONTHLY_RUN_LIMIT = parseInt(
  process.env.MONTHLY_RUN_LIMIT ?? '10',
  10
);

export const ENFORCE_MONTHLY_LIMIT =
  process.env.ENFORCE_MONTHLY_LIMIT === 'true' ||
  process.env.ENFORCE_MONTHLY_LIMIT === '1';
