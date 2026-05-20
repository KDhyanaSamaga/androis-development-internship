import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Setup notification channel for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

// Request notification permissions
export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

// Map day name to Expo WeeklyTrigger weekday (1 = Sunday, 2 = Monday, ..., 7 = Saturday)
const getExpoWeekday = (dayName) => {
  const mapping = {
    'Sunday': 1,
    'Monday': 2,
    'Tuesday': 3,
    'Wednesday': 4,
    'Thursday': 5,
    'Friday': 6,
    'Saturday': 7,
  };
  return mapping[dayName] || 2;
};

// Schedule 5 minutes pre-class weekly notification
export const scheduleClassNotification = async (classItem) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    const { subject, teacher, room, day, startTime } = classItem;
    // startTime is format "HH:MM", e.g. "09:00"
    const [hourStr, minStr] = startTime.split(':');
    let hour = parseInt(hourStr, 10);
    let minute = parseInt(minStr, 10);

    // Subtract 5 minutes
    minute -= 5;
    if (minute < 0) {
      minute += 60;
      hour -= 1;
      if (hour < 0) {
        hour += 24;
      }
    }

    const weekday = getExpoWeekday(day);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming Class',
        body: `${subject} with ${teacher || 'Teacher'}${room ? ' in Room ' + room : ''} starts in 5 minutes.`,
        sound: true,
        data: { classId: classItem.id },
      },
      trigger: {
        type: 'weekly',
        weekday,
        hour,
        minute,
        repeats: true,
        channelId: 'default',
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling class notification:', error);
    return null;
  }
};

// Schedule 1 day pre-deadline notification
export const scheduleReminderNotification = async (noteItem) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    const { title, date } = noteItem; // date is ISO string or Date object
    const deadlineDate = new Date(date);
    
    // Calculate 1 day before: subtract 24 hours
    const triggerDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000);
    
    // Ensure the notification is set for the future
    if (triggerDate <= new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming Deadline Tomorrow',
        body: `Reminder: "${title}" is due tomorrow.`,
        sound: true,
        data: { noteId: noteItem.id },
      },
      trigger: {
        type: 'date',
        date: triggerDate,
        channelId: 'default',
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling reminder notification:', error);
    return null;
  }
};

// Cancel a scheduled notification
export const cancelNotification = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error(`Error cancelling notification ${notificationId}:`, error);
  }
};
