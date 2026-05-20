import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { rWidth, rHeight, rFont } from '../utils/responsive';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getProfile } from '../storage/profileStorage';
import { getTasks } from '../storage/taskStorage';
import { getTimetable } from '../storage/timetableStorage';
import { getNotes } from '../storage/notesStorage';
import { getAttendanceList } from '../storage/attendanceStorage';
import ProfileCard from '../components/ProfileCard';
import { COLORS } from '../utils/constants';
import { getTodayDayName } from '../utils/dateUtils';

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState({ name: '', course: '', semester: '', phone: '', collegeName: '', profilePhoto: null });
  const [taskCount, setTaskCount] = useState(0);
  const [nextClass, setNextClass] = useState(null);
  const [nextReminder, setNextReminder] = useState(null);
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);

  const loadDashboardData = async () => {
    try {
      // Load Profile
      const prof = await getProfile();
      setProfile(prof);

      // Load Tasks
      const tasks = await getTasks();
      setTaskCount(tasks.filter(t => !t.completed).length);

      // Load Timetable (find next class today)
      const today = getTodayDayName(); // e.g. "Wednesday"
      const schedule = await getTimetable();
      const todayClasses = schedule.filter(c => c.day === today);
      
      // Sort today classes by starting hour/minute
      todayClasses.sort((a, b) => {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });
      
      // Find the next class based on current time
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

      const upcoming = todayClasses.find(c => (c.startTime || '00:00') > currentTimeStr);
      // If no upcoming class today, show the first class of today or write "No classes today"
      setNextClass(upcoming || todayClasses[0] || null);

      // Load Reminders
      const reminders = await getNotes();
      const pendingReminders = reminders.filter(r => !r.completed && new Date(r.date) >= new Date());
      setNextReminder(pendingReminders[0] || null);

      // Load Attendance Stats
      const attendanceList = await getAttendanceList();
      setSubjectCount(attendanceList.length);
      if (attendanceList.length > 0) {
        let totalAttended = 0;
        let totalClasses = 0;
        attendanceList.forEach(item => {
          totalAttended += item.attended;
          totalClasses += item.total; // total = attended + bunked + pending
        });
        const pct = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
        setOverallAttendance(pct);
      } else {
        setOverallAttendance(0);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadDashboardData();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const featureCards = [
    {
      title: 'Timetable',
      desc: 'Check schedule',
      route: 'TimetableTab',
      bg: '#EFF6FF',
      color: COLORS.primary,
      icon: '📅',
    },
    {
      title: 'Study Materials',
      desc: 'Access your files',
      route: 'MaterialsTab',
      bg: '#ECFDF5',
      color: COLORS.success,
      icon: '📁',
    },
    {
      title: 'Tasks Checklist',
      desc: 'Manage assignments',
      route: 'TasksTab',
      bg: '#FDF2F8',
      color: '#DB2777',
      icon: '✓',
    },
    {
      title: 'Attendance Tracker',
      desc: 'Monitor classes',
      route: 'Attendance', // Stack nav screen
      bg: '#F5F3FF',
      color: '#7C3AED',
      icon: '📊',
    },
    {
      title: 'Notes & Reminders',
      desc: 'Submission deadlines',
      route: 'Notes', // Stack nav screen
      bg: '#FFF7ED',
      color: '#D97706',
      icon: '⏰',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* App Logo Header */}
      <View style={styles.appHeader}>
        <Text style={styles.logoTitle}>Study<Text style={styles.logoAccent}>Fly</Text></Text>
        <Text style={styles.logoSubtitle}>Academic Assistant</Text>
      </View>

      {/* Student Profile Card */}
      <ProfileCard profile={profile} />

      {/* Quick Overview Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overview</Text>
      </View>

      <View style={styles.overviewGrid}>
        {/* Attendance Summary */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewLabel}>Overall Attendance</Text>
          <Text style={[styles.overviewValue, { color: overallAttendance >= 75 ? COLORS.success : COLORS.danger }]}>
            {subjectCount > 0 ? `${overallAttendance.toFixed(1)}%` : 'No subjects'}
          </Text>
          <Text style={styles.overviewSubtext}>
            {overallAttendance >= 75 ? 'Safe and steady! 👍' : 'Need to attend classes! 🙄'}
          </Text>
        </View>

        {/* Tasks Summary */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewLabel}>Pending Tasks</Text>
          <Text style={[styles.overviewValue, { color: taskCount > 0 ? '#DB2777' : COLORS.success }]}>
            {taskCount}
          </Text>
          <Text style={styles.overviewSubtext}>
            {taskCount === 0 ? 'All caught up! 🎉' : 'Assignments pending'}
          </Text>
        </View>
      </View>

      {/* Current schedule info */}
      <View style={styles.scheduleWidget}>
        <Text style={styles.widgetHeader}>Next Scheduled Class Today</Text>
        {nextClass ? (
          <View style={styles.widgetBody}>
            <View style={styles.widgetLeft}>
              <Text style={styles.widgetTitle}>{nextClass.subject}</Text>
              <Text style={styles.widgetSubtitle}>with {nextClass.teacher || 'N/A'}</Text>
            </View>
            <View style={styles.widgetRight}>
              <Text style={styles.widgetTime}>{nextClass.startTime}</Text>
              {nextClass.room ? <Text style={styles.widgetRoom}>Room: {nextClass.room}</Text> : null}
            </View>
          </View>
        ) : (
          <Text style={styles.widgetEmptyText}>No lectures scheduled today</Text>
        )}
      </View>

      {/* Upcoming reminder widget */}
      {nextReminder && (
        <View style={[styles.scheduleWidget, { borderLeftColor: '#D97706' }]}>
          <Text style={[styles.widgetHeader, { color: '#D97706' }]}>Upcoming Deadline</Text>
          <View style={styles.widgetBody}>
            <View style={styles.widgetLeft}>
              <Text style={styles.widgetTitle}>{nextReminder.title}</Text>
              <Text style={styles.widgetSubtitle}>{nextReminder.notes || 'No description'}</Text>
            </View>
            <View style={styles.widgetRight}>
              <Text style={[styles.widgetTime, { fontSize: rFont(13) }]}>
                {new Date(nextReminder.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Feature Navigation Cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Productivity Tools</Text>
      </View>

      <View style={styles.featuresContainer}>
        {featureCards.map((feat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.featureCard, { backgroundColor: feat.bg }]}
            onPress={() => navigation.navigate(feat.route)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.white }]}>
              <Text style={styles.featureIcon}>{feat.icon}</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: feat.color }]}>{feat.title}</Text>
              <Text style={styles.featureDesc}>{feat.desc}</Text>
            </View>
            <Text style={[styles.arrowIcon, { color: feat.color }]}>➔</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
  appHeader: {
    paddingHorizontal: rWidth(5),
    paddingTop: rHeight(2),
    paddingBottom: rHeight(1.5),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoTitle: {
    fontSize: rFont(26),
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  logoSubtitle: {
    fontSize: rFont(12),
    color: COLORS.gray,
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: rWidth(5),
    marginTop: rHeight(2),
    marginBottom: rHeight(1),
  },
  sectionTitle: {
    fontSize: rFont(18),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: rWidth(4),
    marginBottom: rHeight(2),
  },
  overviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: rWidth(4),
    width: rWidth(44),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewLabel: {
    fontSize: rFont(12),
    color: COLORS.gray,
    fontWeight: '600',
  },
  overviewValue: {
    fontSize: rFont(24),
    fontWeight: '800',
    marginTop: rHeight(0.5),
    marginBottom: rHeight(0.5),
  },
  overviewSubtext: {
    fontSize: rFont(10),
    color: COLORS.gray,
    fontWeight: '500',
  },
  scheduleWidget: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: rWidth(4),
    marginHorizontal: rWidth(4),
    marginBottom: rHeight(2),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  widgetHeader: {
    fontSize: rFont(11),
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  widgetBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetLeft: {
    flex: 1,
    paddingRight: 8,
  },
  widgetTitle: {
    fontSize: rFont(16),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  widgetSubtitle: {
    fontSize: rFont(13),
    color: COLORS.gray,
    marginTop: 2,
  },
  widgetRight: {
    alignItems: 'flex-end',
  },
  widgetTime: {
    fontSize: rFont(16),
    fontWeight: '700',
    color: COLORS.text,
  },
  widgetRoom: {
    fontSize: rFont(10),
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 4,
  },
  widgetEmptyText: {
    fontSize: rFont(14),
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  featuresContainer: {
    paddingHorizontal: rWidth(4),
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rWidth(4),
    borderRadius: 16,
    marginBottom: rHeight(1.5),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  iconContainer: {
    width: rWidth(11),
    height: rWidth(11),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: rWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    fontSize: rFont(22),
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: rFont(16),
    fontWeight: 'bold',
  },
  featureDesc: {
    fontSize: rFont(12),
    color: COLORS.gray,
    marginTop: 2,
    fontWeight: '500',
  },
  arrowIcon: {
    fontSize: rFont(16),
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
