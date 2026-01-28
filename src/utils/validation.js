export function zodErrorToList(err) {
  return err.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message
  }));
}
