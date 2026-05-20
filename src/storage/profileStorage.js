import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@studyfly_profile';

const DEFAULT_PROFILE = {
  name: '',
  dob: '',
  phone: '',
  course: '',
  semester: '',
  collegeName: '',
  profilePhoto: null, // Image URI
};

export const getProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  } catch (error) {
    console.error('Error reading profile from storage:', error);
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = async (profileData) => {
  try {
    const cleanData = {
      name: profileData.name || '',
      dob: profileData.dob || '',
      phone: profileData.phone || '',
      course: profileData.course || '',
      semester: profileData.semester || '',
      collegeName: profileData.collegeName || '',
      profilePhoto: profileData.profilePhoto || null,
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(cleanData));
    return true;
  } catch (error) {
    console.error('Error saving profile to storage:', error);
    return false;
  }
};
