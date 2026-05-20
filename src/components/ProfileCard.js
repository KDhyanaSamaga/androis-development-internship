import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');

const ProfileCard = ({ profile }) => {
  const { name, course, semester, phone, collegeName, profilePhoto } = profile;

  // Placeholder avatar using initials if name exists, else default symbol
  const renderAvatar = () => {
    if (profilePhoto) {
      return <Image source={{ uri: profilePhoto }} style={styles.avatar} />;
    }
    
    const initials = name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'SF';

    return (
      <View style={[styles.avatar, styles.avatarPlaceholder]}>
        <Text style={styles.avatarPlaceholderText}>{initials}</Text>
      </View>
    );
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[COLORS.primary, '#1D4ED8']}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          {renderAvatar()}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{name || 'Welcome Student!'}</Text>
          <Text style={styles.collegeText}>{collegeName || 'Add your college details'}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Course</Text>
              <Text style={styles.detailValue}>{course || 'Not set'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Semester</Text>
              <Text style={styles.detailValue}>{semester ? `Sem ${semester}` : 'Not set'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{phone || 'Not set'}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  gradientHeader: {
    height: 90,
    width: '100%',
  },
  headerSpacer: {
    height: '100%',
  },
  cardContent: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginTop: -55,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  collegeText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default ProfileCard;
