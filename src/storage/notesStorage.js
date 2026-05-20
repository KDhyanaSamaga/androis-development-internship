import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleReminderNotification, cancelNotification } from '../utils/notifications';

const NOTES_KEY = '@studyfly_notes';

export const getNotes = async () => {
  try {
    const data = await AsyncStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading notes/reminders from storage:', error);
    return [];
  }
};

export const saveNote = async (noteItem) => {
  try {
    const notes = await getNotes();
    let notificationId = null;

    // 1. Schedule 1-day pre-deadline notification
    if (noteItem.title && noteItem.date && !noteItem.completed) {
      notificationId = await scheduleReminderNotification(noteItem);
    }

    const newNote = {
      id: noteItem.id || `note_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: noteItem.title.trim(),
      date: noteItem.date, // ISO Date string
      notes: noteItem.notes ? noteItem.notes.trim() : '',
      completed: noteItem.completed !== undefined ? noteItem.completed : false,
      notificationId: notificationId || noteItem.notificationId || null,
    };

    const existingIndex = notes.findIndex(item => item.id === newNote.id);
    
    if (existingIndex > -1) {
      // Cancel the old notification if there is one and it changed or the task is completed
      const oldNotificationId = notes[existingIndex].notificationId;
      if (oldNotificationId && (oldNotificationId !== notificationId || newNote.completed)) {
        await cancelNotification(oldNotificationId);
      }
      
      // If completed, make sure notificationId is cleared
      if (newNote.completed) {
        newNote.notificationId = null;
      }
      
      notes[existingIndex] = newNote;
    } else {
      notes.push(newNote);
    }

    // Sort by date ascending (closest deadline first)
    notes.sort((a, b) => new Date(a.date) - new Date(b.date));

    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return newNote;
  } catch (error) {
    console.error('Error saving note/reminder:', error);
    return null;
  }
};

export const deleteNote = async (id) => {
  try {
    const notes = await getNotes();
    const itemToDelete = notes.find(item => item.id === id);
    
    if (itemToDelete && itemToDelete.notificationId) {
      await cancelNotification(itemToDelete.notificationId);
    }

    const updatedNotes = notes.filter(item => item.id !== id);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    return true;
  } catch (error) {
    console.error('Error deleting note/reminder:', error);
    return false;
  }
};
