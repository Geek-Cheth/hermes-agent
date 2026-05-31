export const MONTHLY_RUN_LIMIT = parseInt(
  process.env.MONTHLY_RUN_LIMIT ?? '5',
  10
);

export const ENFORCE_MONTHLY_LIMIT =
  process.env.ENFORCE_MONTHLY_LIMIT === 'true' ||
  process.env.ENFORCE_MONTHLY_LIMIT === '1';

export const DAILY_RUN_LIMIT = parseInt(
  process.env.DAILY_RUN_LIMIT ?? '1',
  10
);

export const ENFORCE_DAILY_LIMIT =
  process.env.ENFORCE_DAILY_LIMIT === 'true' ||
  process.env.ENFORCE_DAILY_LIMIT === '1';
