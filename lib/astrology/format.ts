export function formatDegree(degreeInSign: number): string {
  const degrees = Math.floor(degreeInSign);
  const minutes = Math.round((degreeInSign - degrees) * 60);
  if (minutes === 60) {
    return `${degrees + 1}°0'`;
  }
  return `${degrees}°${minutes}'`;
}
