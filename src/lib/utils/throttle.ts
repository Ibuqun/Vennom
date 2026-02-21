export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(fn: T, limit = 250) {
  let inFlight = false;
  return (...args: Parameters<T>) => {
    if (inFlight) return;
    inFlight = true;
    fn(...args);
    setTimeout(() => {
      inFlight = false;
    }, limit);
  };
}
