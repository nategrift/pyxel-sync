export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function convertToSeconds(milliseconds) {
  const seconds = milliseconds / 1000;
  return Math.round(seconds * 100) / 100;
}
export function convertSecondsToMilliseconds(seconds) {
  return Math.floor(seconds * 1000);
}
