export function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function toDateString(value: string) {
  if (!value) {
    return "";
  }

  return value.includes("T") ? value.slice(0, 10) : value;
}

export function isSameDate(value: string, date: string) {
  if (!date) {
    return true;
  }

  return toDateString(value) === date;
}
