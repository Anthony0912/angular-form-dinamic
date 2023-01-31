export function calculateAge(date: string): number {
  const currentDate: Date = new Date();

  const currentYear: number = currentDate.getFullYear();
  const currentMonth: number = currentDate.getMonth() + 1;
  const currentDay: number = currentDate.getDate();

  const birthYear: number = parseInt(String(date).substring(0, 4));
  const birthMonth: number = parseInt(String(date).substring(5, 7));
  const birthDay: number = parseInt(String(date).substring(8, 10));

  let old = currentYear - birthYear;
  if (currentMonth < birthMonth) {
    old--;
  } else if (currentMonth === birthMonth) {
    if (currentDay < birthDay) {
      old--;
    }
  }
  return old;
}
