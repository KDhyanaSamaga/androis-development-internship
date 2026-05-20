import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import TimetableGrid from '../components/TimetableGrid';
import { getTimetable, saveClassItem, deleteClassItem } from '../storage/timetableStorage';
import { COLORS } from '../utils/constants';
import { parseTimeSlotStart } from '../utils/dateUtils';
import { rWidth, rHeight, rFont } from '../utils/responsive';

const TimetableScreen = () => {
  const isFocused = useIsFocused();
  const [timetable, setTimetable] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ day: '', timeSlot: '', classItem: null });

  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');

  const loadTimetable = async () => {
    const data = await getTimetable();
    setTimetable(data);
  };

  useEffect(() => {
    if (isFocused) {
      loadTimetable();
    }
  }, [isFocused]);

  const handleCellPress = (day, timeSlot, classItem) => {
    setSelectedCell({ day, timeSlot, classItem });
    
    if (classItem) {
      setSubject(classItem.subject);
      setTeacher(classItem.teacher);
      setRoom(classItem.room);
    } else {
      setSubject('');
      setTeacher('');
      setRoom('');
    }
    
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!subject.trim()) {
      Alert.alert('Validation Error', 'Subject name is required.');
      return;
    }

    if (!teacher.trim()) {
      Alert.alert('Validation Error', 'Teacher name is required.');
      return;
    }

    const { hour, minute } = parseTimeSlotStart(selectedCell.timeSlot);
    const startTimeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    const updatedItem = {
      id: selectedCell.classItem ? selectedCell.classItem.id : null,
      subject: subject.trim(),
      teacher: teacher.trim(),
      room: room.trim(),
      day: selectedCell.day,
      timeSlot: selectedCell.timeSlot,
      startTime: startTimeStr,
      notificationId: selectedCell.classItem ? selectedCell.classItem.notificationId : null,
    };

    const result = await saveClassItem(updatedItem);
    if (result) {
      setModalVisible(false);
      loadTimetable();
      Alert.alert('Success', 'Class schedule saved. Reminder notification scheduled 5 mins before!');
    } else {
      Alert.alert('Error', 'Failed to save class schedule.');
    }
  };

  const handleDelete = async () => {
    if (!selectedCell.classItem) return;

    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${selectedCell.classItem.subject}" from your timetable?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteClassItem(selectedCell.classItem.id);
            if (success) {
              setModalVisible(false);
              loadTimetable();
            } else {
              Alert.alert('Error', 'Failed to delete class.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timetable Planner</Text>
        <Text style={styles.headerSubtitle}>Tap any cell to add or update your schedule</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <TimetableGrid timetableData={timetable} onCellPress={handleCellPress} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedCell.classItem ? 'Edit Class Details' : 'Add New Class'}
              </Text>
              <Text style={styles.modalCellInfo}>
                {selectedCell.day} • {selectedCell.timeSlot}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject Name *</Text>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="e.g. Maths, DBMS, AI"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teacher / Instructor *</Text>
                <TextInput
                  style={styles.input}
                  value={teacher}
                  onChangeText={setTeacher}
                  placeholder="e.g. Dr. Ravi Kumar"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Room Number / Link (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={room}
                  onChangeText={setRoom}
                  placeholder="e.g. Lecture Hall 203"
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

                {selectedCell.classItem && (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnDelete]}
                    onPress={handleDelete}
                  >
                    <Text style={styles.btnDeleteText}>Delete</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.btn, styles.btnSave]}
                  onPress={handleSave}
                >
                  <Text style={styles.btnSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    fontSize: rFont(13),
    color: COLORS.gray,
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: rHeight(2),
  },
  modalTitle: {
    fontSize: rFont(20),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCellInfo: {
    fontSize: rFont(14),
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: rHeight(2),
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: rHeight(2.5),
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
  btnDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  btnDeleteText: {
    color: COLORS.danger,
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

export default TimetableScreen;
