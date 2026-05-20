import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import TaskCard from '../components/TaskCard';
import { getTasks, saveTask, toggleTask, deleteTask } from '../storage/taskStorage';
import { COLORS } from '../utils/constants';
import { rWidth, rHeight, rFont } from '../utils/responsive';

const TasksScreen = () => {
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending' or 'Completed'
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const loadTasks = async () => {
    const list = await getTasks();
    setTasks(list);
  };

  useEffect(() => {
    if (isFocused) {
      loadTasks();
    }
  }, [isFocused]);

  const handleAddTask = async () => {
    const titleClean = newTaskTitle.trim();
    if (!titleClean) {
      Alert.alert('Validation Error', 'Please enter a task description.');
      return;
    }

    try {
      await saveTask({ title: titleClean });
      setNewTaskTitle('');
      Keyboard.dismiss();
      loadTasks();
    } catch (error) {
      Alert.alert('Validation Error', error.message || 'Failed to add task.');
    }
  };

  const handleToggleTask = async (id) => {
    const success = await toggleTask(id);
    if (success) {
      loadTasks();
    }
  };

  const handleDeleteTask = async (id, title) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTask(id);
            if (success) loadTasks();
          },
        },
      ]
    );
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  const displayTasks = activeTab === 'Pending' ? pendingTasks : completedTasks;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks Checklist</Text>
        <Text style={styles.headerSubtitle}>Keep track of your study items and assignments</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          placeholder="Add a new homework, study task..."
          placeholderTextColor={COLORS.placeholder}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddTask} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Pending' && styles.tabActive]}
          onPress={() => setActiveTab('Pending')}
        >
          <Text style={[styles.tabText, activeTab === 'Pending' && styles.tabTextActive]}>
            Pending ({pendingTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Completed' && styles.tabActive]}
          onPress={() => setActiveTab('Completed')}
        >
          <Text style={[styles.tabText, activeTab === 'Completed' && styles.tabTextActive]}>
            Completed ({completedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{activeTab === 'Pending' ? '📝' : '🎉'}</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'Pending' ? 'No pending tasks' : 'No completed tasks yet'}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'Pending' 
                ? 'Type in the box above and tap + to add your academic tasks.' 
                : 'Complete items in your checklist to see them here.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            item={item}
            onToggle={() => handleToggleTask(item.id)}
            onDelete={() => handleDeleteTask(item.id, item.title)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: rWidth(5),
    paddingTop: rHeight(2),
    paddingBottom: rHeight(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: rFont(22),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: rFont(12),
    color: COLORS.gray,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rWidth(4),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: rHeight(1.5),
    fontSize: rFont(15),
    color: COLORS.text,
    marginRight: 10,
  },
  addBtn: {
    width: rWidth(12),
    height: rWidth(12),
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: rFont(24),
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 6,
    marginHorizontal: rWidth(4),
    marginTop: rHeight(2),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: rHeight(1.2),
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: rFont(13),
    fontWeight: '700',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: rWidth(4),
    paddingBottom: rHeight(5),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rHeight(10),
  },
  emptyIcon: {
    fontSize: rFont(48),
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: rFont(18),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyDesc: {
    fontSize: rFont(13),
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});

export default TasksScreen;
