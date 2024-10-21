// Ensure field is in environment variables
export const check = (field: string) => {
  if (!process.env[field]) throw new Error(`'Please set ${field} in .env file`);
};
