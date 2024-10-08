import { PageConfig } from 'next-safe-routes';

export const config: PageConfig = {
  searchParams: {
    required: ['orgId'],
    optional: ['employeeId'],
  },
};
