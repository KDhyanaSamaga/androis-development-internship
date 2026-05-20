import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getProfile, saveProfile } from '../storage/profileStorage';
import { COLORS } from '../utils/constants';
import { rWidth, rHeight, rFont } from '../utils/responsive';

const ProfileScreen = () => {
  const [profile, setProfile] = useState({
    name: '',
    dob: '',
    phone: '',
    course: '',
    semester: '',
    collegeName: '',
    profilePhoto: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await getProfile();
      setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Sorry, we need media library permissions to upload your profile photo!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfile(prev => ({ ...prev, profilePhoto: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Something went wrong while picking the photo.');
    }
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      Alert.alert('Validation Error', 'Student Name is required.');
      return;
    }

    if (profile.phone && !/^\+?[0-9\s-]{8,15}$/.test(profile.phone)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    const success = await saveProfile(profile);
    if (success) {
      Alert.alert('Success', 'Profile details updated successfully! 🎉');
    } else {
      Alert.alert('Error', 'Failed to save profile details.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.photoHeader}>
          <TouchableOpacity onPress={handlePickImage} style={styles.imageWrapper} activeOpacity={0.8}>
            {profile.profilePhoto ? (
              <Image source={{ uri: profile.profilePhoto }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderIcon}>👤</Text>
                <Text style={styles.placeholderText}>Tap to add photo</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✎</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{profile.name || 'Student Name'}</Text>
          <Text style={styles.headerSubtitle}>{profile.course || 'No course selected'}</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formSectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              value={profile.name}
              onChangeText={text => setProfile(prev => ({ ...prev, name: text }))}
              placeholder="e.g. John Doe"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
              style={styles.textInput}
              value={profile.dob}
              onChangeText={text => setProfile(prev => ({ ...prev, dob: text }))}
              placeholder="e.g. DD/MM/YYYY"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={profile.phone}
              onChangeText={text => setProfile(prev => ({ ...prev, phone: text }))}
              placeholder="e.g. +1234567890"
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <Text style={[styles.formSectionTitle, { marginTop: rHeight(3) }]}>Academic Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>College Name</Text>
            <TextInput
              style={styles.textInput}
              value={profile.collegeName}
              onChangeText={text => setProfile(prev => ({ ...prev, collegeName: text }))}
              placeholder="e.g. State University"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Course</Text>
            <TextInput
              style={styles.textInput}
              value={profile.course}
              onChangeText={text => setProfile(prev => ({ ...prev, course: text }))}
              placeholder="e.g. Computer Science"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Semester</Text>
            <TextInput
              style={styles.textInput}
              value={profile.semester}
              onChangeText={text => setProfile(prev => ({ ...prev, semester: text }))}
              placeholder="e.g. 4"
              keyboardType="number-pad"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save Profile Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: rHeight(5),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.gray,
    fontSize: rFont(16),
    fontWeight: '500',
  },
  photoHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: rHeight(3),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: rWidth(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  profileImage: {
    width: rWidth(30),
    height: rWidth(30),
    borderRadius: rWidth(15),
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  imagePlaceholder: {
    width: rWidth(30),
    height: rWidth(30),
    borderRadius: rWidth(15),
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  placeholderIcon: {
    fontSize: rFont(48),
  },
  placeholderText: {
    fontSize: rFont(10),
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: rWidth(8),
    height: rWidth(8),
    borderRadius: rWidth(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  editBadgeText: {
    color: COLORS.white,
    fontSize: rFont(14),
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: rFont(22),
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: rFont(14),
    color: COLORS.gray,
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: rWidth(5),
    paddingTop: rHeight(3),
  },
  formSectionTitle: {
    fontSize: rFont(14),
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: rFont(13),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: rHeight(1.5),
    fontSize: rFont(15),
    color: COLORS.text,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: rHeight(1.8),
    alignItems: 'center',
    marginTop: rHeight(4),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: rFont(16),
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
