import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTENDANCE_KEY = '@studyfly_attendance';

export const getAttendanceList = async () => {
  try {
    const data = await AsyncStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading attendance from storage:', error);
    return [];
  }
};

export const saveAttendanceItem = async (attendanceItem) => {
  try {
    const list = await getAttendanceList();
    
    // Ensure all values are numbers, default to 0
    const attended = Math.max(0, parseInt(attendanceItem.attended, 10) || 0);
    const bunked = Math.max(0, parseInt(attendanceItem.bunked, 10) || 0);
    const pending = Math.max(0, parseInt(attendanceItem.pending, 10) || 0);
    const total = attended + bunked + pending;

    const newItem = {
      id: attendanceItem.id || `subject_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      subject: attendanceItem.subject.trim(),
      attended,
      bunked,
      pending,
      total,
    };

    const existingIndex = list.findIndex(item => item.id === newItem.id);
    if (existingIndex > -1) {
      list[existingIndex] = newItem;
    } else {
      list.push(newItem);
    }

    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list));
    return newItem;
  } catch (error) {
    console.error('Error saving attendance item:', error);
    return null;
  }
};

export const deleteAttendanceItem = async (id) => {
  try {
    const list = await getAttendanceList();
    const updatedList = list.filter(item => item.id !== id);
    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updatedList));
    return true;
  } catch (error) {
    console.error('Error deleting attendance item:', error);
    return false;
  }
};
