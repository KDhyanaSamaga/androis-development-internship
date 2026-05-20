export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const getTodayDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  return days[todayIndex];
};

export const parseTimeSlotStart = (timeSlot) => {
  if (!timeSlot) return { hour: 9, minute: 0 };
  // Expected format: "09:00 - 10:00"
  const startPart = timeSlot.split('-')[0].trim();
  const [hourStr, minStr] = startPart.split(':');
  return {
    hour: parseInt(hourStr, 10) || 9,
    minute: parseInt(minStr, 10) || 0,
  };
};

export const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
