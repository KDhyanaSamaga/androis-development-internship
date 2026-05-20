import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@studyfly_tasks';

export const getTasks = async () => {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading tasks from storage:', error);
    return [];
  }
};

export const saveTask = async (taskItem) => {
  try {
    const tasks = await getTasks();
    const titleClean = taskItem.title.trim();
    
    if (!titleClean) {
      throw new Error('Task description cannot be empty');
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = tasks.some(
      t => t.title.toLowerCase() === titleClean.toLowerCase() && t.id !== taskItem.id
    );

    if (isDuplicate) {
      throw new Error('A task with this description already exists');
    }

    const newTask = {
      id: taskItem.id || `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: titleClean,
      completed: taskItem.completed !== undefined ? taskItem.completed : false,
    };

    const existingIndex = tasks.findIndex(item => item.id === newTask.id);
    if (existingIndex > -1) {
      tasks[existingIndex] = newTask;
    } else {
      tasks.push(newTask);
    }

    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return newTask;
  } catch (error) {
    console.error('Error saving task:', error.message);
    throw error; // Propagate the error so the UI can display a message (e.g. duplicate task error)
  }
};

export const toggleTask = async (id) => {
  try {
    const tasks = await getTasks();
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    return true;
  } catch (error) {
    console.error('Error toggling task:', error);
    return false;
  }
};

export const deleteTask = async (id) => {
  try {
    const tasks = await getTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};
