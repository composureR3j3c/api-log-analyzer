
export function getEmptyLogMessage(hasSearch, totalLogCount) {
  if (hasSearch) return "No logs match your search.";
  if (totalLogCount === 0) return "Upload a .log file to search its entries.";
  return "No logs available.";
}
