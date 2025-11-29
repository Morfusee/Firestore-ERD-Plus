export const isSuccessStatus = (status: number): boolean =>
  status >= 200 && status < 300;
