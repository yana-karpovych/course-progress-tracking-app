export function getTitleValidationError(title, { optional = false } = {}) {
  if (title === undefined) {
    return optional ? null : 'Title is required';
  }

  if (typeof title !== 'string' || title.trim() === '') {
    return 'Title is required';
  }

  return null;
}
