const prefix = '[Next Safe Routes]';

export const logger = {
  info: (...data: any[]) => console.info(`${prefix} -`, ...data),
  error: (...data: any[]) => console.error(`${prefix} -`, ...data),
  warn: (...data: any[]) => console.warn(`${prefix} -`, ...data),
};
