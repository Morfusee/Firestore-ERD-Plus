export const isSuccessStatus = (status: number): boolean =>
  status >= 200 && status < 300;

export const determineTitle = (
  successTitle: string,
  errorTitle: string,
  isSuccess: boolean
) => {
  if (isSuccess) return successTitle;

  return errorTitle;
};
