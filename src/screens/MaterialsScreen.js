import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import mime from 'react-native-mime-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../utils/constants';
import { rWidth, rHeight, rFont } from '../utils/responsive';

const MATERIALS_KEY = '@studyfly_materials';

const MaterialsScreen = () => {
  const isFocused = useIsFocused();
  const [materials, setMaterials] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // { uri, name, size }

  const loadMaterials = async () => {
    try {
      const data = await AsyncStorage.getItem(MATERIALS_KEY);
      setMaterials(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadMaterials();
    }
  }, [isFocused]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          size: file.size,
        });
        
        // Auto-fill title if empty
        if (!title) {
          const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          setTitle(nameWithoutExt);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Validation Error', 'Subject is required.');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Validation Error', 'Please select a file.');
      return;
    }

    try {
      const newMaterial = {
        id: `mat_${Date.now()}`,
        title: title.trim(),
        subject: subject.trim().toUpperCase(),
        fileUri: selectedFile.uri,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        addedDate: new Date().toISOString(),
      };

      const updatedMaterials = [newMaterial, ...materials];
      await AsyncStorage.setItem(MATERIALS_KEY, JSON.stringify(updatedMaterials));
      setMaterials(updatedMaterials);
      
      setTitle('');
      setSubject('');
      setSelectedFile(null);
      setModalVisible(false);
      
      Alert.alert('Success', 'Study material organized successfully! 📁');
    } catch (error) {
      console.error('Error saving study material:', error);
      Alert.alert('Error', 'Failed to organize study material.');
    }
  };

  const handleOpenFile = async (fileUri, fileName) => {
    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        const mimeType = mime.lookup(fileName) || '*/*';

        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: mimeType,
        });
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Error', 'Viewing files is not available on this platform.');
        }
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Could not open the selected file. The file reference might be invalid or moved.');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to remove this file reference?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = materials.filter(m => m.id !== id);
              await AsyncStorage.setItem(MATERIALS_KEY, JSON.stringify(updated));
              setMaterials(updated);
            } catch (error) {
              console.error('Error deleting file reference:', error);
            }
          },
        },
      ]
    );
  };

  const subjects = ['All', ...new Set(materials.map(m => m.subject))];

  const filteredMaterials = selectedSubjectFilter === 'All'
    ? materials
    : materials.filter(m => m.subject === selectedSubjectFilter);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Study Materials</Text>
          <Text style={styles.headerSubtitle}>Keep reference notes organized by subject</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add File</Text>
        </TouchableOpacity>
      </View>

      {subjects.length > 1 ? (
        <View style={styles.filterTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {subjects.map((subj, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tab,
                  selectedSubjectFilter === subj && styles.tabActive,
                ]}
                onPress={() => setSelectedSubjectFilter(subj)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedSubjectFilter === subj && styles.tabTextActive,
                  ]}
                >
                  {subj}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <FlatList
        data={filteredMaterials}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>No study materials organized</Text>
            <Text style={styles.emptyDesc}>Tap "+ Add File" to select PDFs, notes, slides, or pictures.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.materialCard}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.subject}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardFileName} numberOfLines={1}>
              📄 {item.fileName}
            </Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.cardFileSize}>
                Size: {formatBytes(item.fileSize)}
              </Text>
              <TouchableOpacity
                style={styles.openBtn}
                onPress={() => handleOpenFile(item.fileUri, item.fileName)}
              >
                <Text style={styles.openBtnText}>Open File</Text>
              </TouchableOpacity>
            </View>
          </View>
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
              <Text style={styles.modalTitle}>Organize Study Material</Text>
              <Text style={styles.modalSubtitle}>Link local document references for offline access</Text>
            </View>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
              <TouchableOpacity
                style={[styles.pickerTrigger, selectedFile && styles.pickerTriggerActive]} 
                onPress={handlePickDocument}
              >
                <Text style={styles.pickerIcon}>{selectedFile ? '📄' : '📤'}</Text>
                <Text style={styles.pickerTitle}>
                  {selectedFile ? 'File Selected' : 'Choose Local File'}
                </Text>
                <Text style={styles.pickerSub} numberOfLines={1}>
                  {selectedFile ? selectedFile.name : 'PDF, PPT, Word, Images, etc.'}
                </Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject (e.g. Maths, DBMS, AI) *</Text>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="e.g. DBMS"
                  autoCapitalize="characters"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Display Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Chapter 1 Slides"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel]}
                  onPress={() => {
                    setSelectedFile(null);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnSave]}
                  onPress={handleSave}
                >
                  <Text style={styles.btnSaveText}>Save Reference</Text>
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
  filterTabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsScroll: {
    paddingHorizontal: rWidth(4),
    paddingVertical: rHeight(1.5),
  },
  tab: {
    paddingHorizontal: rWidth(4),
    paddingVertical: rHeight(1),
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: rFont(13),
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: rWidth(4),
    paddingBottom: rHeight(5),
  },
  materialCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: rWidth(4),
    marginBottom: rHeight(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rHeight(1.2),
  },
  badge: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: rFont(11),
    fontWeight: '700',
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: rFont(12),
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: rFont(16),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  cardFileName: {
    fontSize: rFont(13),
    color: COLORS.gray,
    marginBottom: rHeight(1.5),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: rHeight(1.5),
  },
  cardFileSize: {
    fontSize: rFont(12),
    color: COLORS.gray,
  },
  openBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  openBtnText: {
    color: COLORS.white,
    fontSize: rFont(12),
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rHeight(8),
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
  pickerTrigger: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: rWidth(5),
    alignItems: 'center',
    marginBottom: rHeight(2),
    backgroundColor: 'rgba(37, 99, 235, 0.02)',
  },
  pickerTriggerActive: {
    borderStyle: 'solid',
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
    borderColor: COLORS.success,
  },
  pickerIcon: {
    fontSize: rFont(32),
    marginBottom: 6,
  },
  pickerTitle: {
    fontSize: rFont(15),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  pickerSub: {
    fontSize: rFont(12),
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 10,
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

export default MaterialsScreen;
