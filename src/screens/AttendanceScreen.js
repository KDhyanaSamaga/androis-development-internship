import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AttendanceCard from '../components/AttendanceCard';
import { getAttendanceList, saveAttendanceItem, deleteAttendanceItem } from '../storage/attendanceStorage';
import { COLORS } from '../utils/constants';
import { rWidth, rHeight, rFont } from '../utils/responsive';

const AttendanceScreen = () => {
  const isFocused = useIsFocused();
  const [attendanceList, setAttendanceList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states for adding new subject
  const [subject, setSubject] = useState('');
  const [attended, setAttended] = useState('0');
  const [bunked, setBunked] = useState('0');
  const [pending, setPending] = useState('0');

  const loadAttendance = async () => {
    const data = await getAttendanceList();
    setAttendanceList(data);
  };

  useEffect(() => {
    if (isFocused) {
      loadAttendance();
    }
  }, [isFocused]);

  const handleAddSubject = async () => {
    if (!subject.trim()) {
      Alert.alert('Validation Error', 'Subject name is required.');
      return;
    }

    const item = {
      subject: subject.trim(),
      attended: parseInt(attended, 10) || 0,
      bunked: parseInt(bunked, 10) || 0,
      pending: parseInt(pending, 10) || 0,
    };

    const result = await saveAttendanceItem(item);
    if (result) {
      setModalVisible(false);
      setSubject('');
      setAttended('0');
      setBunked('0');
      setPending('0');
      loadAttendance();
    } else {
      Alert.alert('Error', 'Failed to add subject.');
    }
  };

  const handleUpdateCount = async (item, field, operation) => {
    let value = item[field];
    if (operation === 'add') {
      value += 1;
    } else if (operation === 'sub') {
      value = Math.max(0, value - 1);
    }

    const updated = {
      ...item,
      [field]: value,
    };

    const result = await saveAttendanceItem(updated);
    if (result) {
      loadAttendance();
    }
  };

  const handleReset = async (item) => {
    Alert.alert(
      'Reset Counters',
      `Are you sure you want to reset all class counts for "${item.subject}" to zero?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const updated = {
              ...item,
              attended: 0,
              bunked: 0,
              pending: 0,
            };
            const result = await saveAttendanceItem(updated);
            if (result) loadAttendance();
          },
        },
      ]
    );
  };

  const handleDelete = async (id, name) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to remove "${name}" from attendance tracker?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAttendanceItem(id);
            if (success) {
              loadAttendance();
            } else {
              Alert.alert('Error', 'Failed to delete subject.');
            }
          },
        },
      ]
    );
  };

  const getOverallStats = () => {
    let totalAttended = 0;
    let totalClasses = 0;
    
    attendanceList.forEach(item => {
      totalAttended += item.attended;
      totalClasses += item.total;
    });

    const percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
    return {
      totalAttended,
      totalClasses,
      percentage,
    };
  };

  const stats = getOverallStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Attendance Tracker</Text>
          <Text style={styles.headerSubtitle}>Keep track of your classes to maintain >=75%</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add Subject</Text>
        </TouchableOpacity>
      </View>

      {attendanceList.length > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>Overall Attendance</Text>
            <Text style={styles.summaryCounts}>
              Attended {stats.totalAttended} of {stats.totalClasses} classes
            </Text>
          </View>
          <View style={[styles.summaryPercentBadge, { backgroundColor: stats.percentage >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={[styles.summaryPercentText, { color: stats.percentage >= 75 ? COLORS.success : COLORS.danger }]}>
              {stats.percentage.toFixed(1)}%
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={attendanceList}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No subjects added yet</Text>
            <Text style={styles.emptyDesc}>Tap "+ Add Subject" to start tracking attendance for your courses.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AttendanceCard
            item={item}
            onAddAttended={() => handleUpdateCount(item, 'attended', 'add')}
            onAddBunked={() => handleUpdateCount(item, 'bunked', 'add')}
            onAddPending={() => handleUpdateCount(item, 'pending', 'add')}
            onReset={() => handleReset(item)}
            onDelete={() => handleDelete(item.id, item.subject)}
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
              <Text style={styles.modalTitle}>Track New Subject</Text>
              <Text style={styles.modalSubtitle}>Configure initial attendance parameters</Text>
            </View>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject Name *</Text>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="e.g. Mathematics II"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              <View style={styles.gridInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Attended</Text>
                  <TextInput
                    style={styles.input}
                    value={attended}
                    onChangeText={setAttended}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 4 }]}>
                  <Text style={styles.label}>Bunked</Text>
                  <TextInput
                    style={styles.input}
                    value={bunked}
                    onChangeText={setBunked}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Pending</Text>
                  <TextInput
                    style={styles.input}
                    value={pending}
                    onChangeText={setPending}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
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
                  onPress={handleAddSubject}
                >
                  <Text style={styles.btnSaveText}>Save Subject</Text>
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
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: rWidth(4),
    margin: rWidth(4),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: rFont(14),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryCounts: {
    fontSize: rFont(12),
    color: COLORS.gray,
    marginTop: 4,
  },
  summaryPercentBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  summaryPercentText: {
    fontSize: rFont(16),
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: rWidth(4),
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
  gridInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default AttendanceScreen;
