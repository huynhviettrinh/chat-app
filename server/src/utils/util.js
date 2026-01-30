export const validateAuthUser = (data) => {
  const emptyFields = Object.entries(data)
    .filter(
      ([_, value]) => value === "" || value === null || value === undefined,
    )
    .map(([key]) => key);

  if (emptyFields.length > 0) {
    return emptyFields;
  }
};
