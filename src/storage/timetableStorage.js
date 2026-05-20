import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleClassNotification, cancelNotification } from '../utils/notifications';

const TIMETABLE_KEY = '@studyfly_timetable';

export const getTimetable = async () => {
  try {
    const data = await AsyncStorage.getItem(TIMETABLE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading timetable from storage:', error);
    return [];
  }
};

export const saveClassItem = async (classItem) => {
  try {
    const timetable = await getTimetable();
    let notificationId = null;

    // 1. Schedule notification (if notification is enabled and we have valid data)
    if (classItem.subject && classItem.day && classItem.startTime) {
      notificationId = await scheduleClassNotification(classItem);
    }

    const newClass = {
      id: classItem.id || `class_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      subject: classItem.subject,
      teacher: classItem.teacher || '',
      room: classItem.room || '',
      day: classItem.day,
      timeSlot: classItem.timeSlot,
      startTime: classItem.startTime, // HH:MM
      notificationId: notificationId || classItem.notificationId || null,
    };

    const existingIndex = timetable.findIndex(item => item.id === newClass.id);
    
    if (existingIndex > -1) {
      // If updating, cancel the old notification
      const oldNotificationId = timetable[existingIndex].notificationId;
      if (oldNotificationId && oldNotificationId !== notificationId) {
        await cancelNotification(oldNotificationId);
      }
      timetable[existingIndex] = newClass;
    } else {
      timetable.push(newClass);
    }

    await AsyncStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetable));
    return newClass;
  } catch (error) {
    console.error('Error saving class item:', error);
    return null;
  }
};

export const deleteClassItem = async (id) => {
  try {
    const timetable = await getTimetable();
    const itemToDelete = timetable.find(item => item.id === id);
    
    if (itemToDelete && itemToDelete.notificationId) {
      await cancelNotification(itemToDelete.notificationId);
    }

    const updatedTimetable = timetable.filter(item => item.id !== id);
    await AsyncStorage.setItem(TIMETABLE_KEY, JSON.stringify(updatedTimetable));
    return true;
  } catch (error) {
    console.error('Error deleting class item:', error);
    return false;
  }
};
