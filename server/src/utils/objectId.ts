export const objectId = (value: string): boolean => {
  return !!value?.match(/^[0-9a-fA-F]{24}$/);
};
