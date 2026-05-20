import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import NotesCard from '../components/NotesCard';
import { getNotes, saveNote, deleteNote } from '../storage/notesStorage';
import { COLORS } from '../utils/constants';
import { rWidth, rHeight, rFont } from '../utils/responsive';

const NotesScreen = () => {
  const isFocused = useIsFocused();
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dateStr, setDateStr] = useState('');

  const loadReminders = async () => {
    const list = await getNotes();
    setReminders(list);
  };

  useEffect(() => {
    if (isFocused) {
      loadReminders();
    }
  }, [isFocused]);

  const openAddModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDateStr(`${yyyy}-${mm}-${dd}`);
    setTitle('');
    setNotes('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Reminder title is required.');
      return;
    }

    const dateReg = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateReg.test(dateStr)) {
      Alert.alert('Validation Error', 'Date must be in YYYY-MM-DD format.');
      return;
    }

    const reminderDate = new Date(dateStr);
    if (isNaN(reminderDate.getTime())) {
      Alert.alert('Validation Error', 'Please enter a valid calendar date.');
      return;
    }

    const newReminder = {
      title: title.trim(),
      notes: notes.trim(),
      date: reminderDate.toISOString(),
      completed: false,
    };

    const saved = await saveNote(newReminder);
    if (saved) {
      setModalVisible(false);
      loadReminders();
      Alert.alert(
        'Success', 
        'Reminder scheduled! We will notify you 1 day before the deadline.'
      );
    } else {
      Alert.alert('Error', 'Failed to save reminder.');
    }
  };

  const handleToggleCompleted = async (item) => {
    const updated = {
      ...item,
      completed: !item.completed,
    };
    const saved = await saveNote(updated);
    if (saved) loadReminders();
  };

  const handleDelete = async (id, name) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteNote(id);
            if (success) loadReminders();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Academic Reminders</Text>
          <Text style={styles.headerSubtitle}>Deadline alerts scheduled 1 day in advance</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add Reminder</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⏰</Text>
            <Text style={styles.emptyTitle}>No academic reminders</Text>
            <Text style={styles.emptyDesc}>
              Tap "+ Add Reminder" to schedule homework deadlines or project submissions.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <NotesCard
            item={item}
            onToggleCompleted={() => handleToggleCompleted(item)}
            onDelete={() => handleDelete(item.id, item.title)}
          />
        )}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Academic Reminder</Text>
              <Text style={styles.modalSubtitle}>Schedules notification alert 24 hours prior</Text>
            </View>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reminder Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Submit AIML Assignment"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Deadline Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  value={dateStr}
                  onChangeText={setDateStr}
                  placeholder="e.g. 2026-05-21"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Submission Notes / Description</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Submit via Google Classroom or hand in printed copy"
                  multiline={true}
                  numberOfLines={3}
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnSave]}
                  onPress={handleSave}
                >
                  <Text style={styles.btnSaveText}>Schedule Alert</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: rHeight(1.2),
    paddingHorizontal: rWidth(4),
    borderRadius: 10,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: rFont(14),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: rWidth(6),
    maxHeight: '90%',
  },
  modalHeader: {
    marginBottom: rHeight(2),
  },
  modalTitle: {
    fontSize: rFont(20),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: rFont(12),
    color: COLORS.gray,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: rFont(13),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: rHeight(1.5),
    fontSize: rFont(15),
    color: COLORS.text,
  },
  multilineInput: {
    height: rHeight(10),
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: rHeight(2.5),
    marginBottom: rHeight(2.5),
  },
  btn: {
    flex: 1,
    paddingVertical: rHeight(1.8),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  btnCancel: {
    backgroundColor: '#F1F5F9',
  },
  btnCancelText: {
    color: COLORS.gray,
    fontWeight: 'bold',
    fontSize: rFont(15),
  },
  btnSave: {
    backgroundColor: COLORS.primary,
  },
  btnSaveText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: rFont(15),
  },
});

export default NotesScreen;
