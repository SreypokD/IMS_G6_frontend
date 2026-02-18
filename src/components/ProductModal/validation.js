export const validateField = (fieldName, value, isEditMode) => {
  if (isEditMode) {
    return false; // No validation errors for edit mode
  }

  switch (fieldName) {
    case "name":
    case "category":
    case "supplier":
      return !value;
    case "price":
    case "stock":
      return !value || Number.isNaN(Number(value));
    default:
      return false;
  }
};

export const shouldShowError = (fieldName, product, data, touched, validateOnSave) => {
  const isEditMode = !!data;
  const isTouched = touched[fieldName] || validateOnSave;
  
  if (!isTouched) {
    return false;
  }

  return validateField(fieldName, product[fieldName], isEditMode);
};
