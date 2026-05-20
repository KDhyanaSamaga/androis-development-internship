import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, TIME_SLOTS, DAYS } from '../utils/constants';

const CELL_WIDTH = 140;
const DAY_COLUMN_WIDTH = 90;
const ROW_HEIGHT = 85;

const TimetableGrid = ({ timetableData, onCellPress }) => {
  // Find class for a specific day and time slot
  const getClassForCell = (day, timeSlot) => {
    return timetableData.find(
      item => item.day === day && item.timeSlot === timeSlot
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.horizontalScroll}>
        <View>
          {/* Header Row */}
          <View style={styles.headerRow}>
            {/* Corner Cell */}
            <View style={[styles.dayHeaderCell, { width: DAY_COLUMN_WIDTH }]}>
              <Text style={styles.dayHeaderText}>Day / Time</Text>
            </View>
            
            {/* Time Slot Headers */}
            {TIME_SLOTS.map((slot, index) => {
              // Parse time slot display (e.g. 09:00 - 10:00 -> 09:00\n10:00)
              const [start, end] = slot.split('-');
              return (
                <View key={index} style={[styles.timeHeaderCell, { width: CELL_WIDTH }]}>
                  <Text style={styles.timeTextStart}>{start.trim()}</Text>
                  <Text style={styles.timeTextEnd}>{end.trim()}</Text>
                </View>
              );
            })}
          </View>

          {/* Grid Body */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {DAYS.map((day, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {/* Day Left Header Cell */}
                <View style={[styles.dayCell, { width: DAY_COLUMN_WIDTH }]}>
                  <Text style={styles.dayText}>{day.substring(0, 3)}</Text>
                </View>

                {/* Time Cells */}
                {TIME_SLOTS.map((slot, colIndex) => {
                  const classItem = getClassForCell(day, slot);

                  return (
                    <TouchableOpacity
                      key={colIndex}
                      style={[
                        styles.cell,
                        { width: CELL_WIDTH, height: ROW_HEIGHT },
                        classItem ? styles.classCellActive : styles.classCellEmpty,
                      ]}
                      onPress={() => onCellPress(day, slot, classItem)}
                      activeOpacity={0.7}
                    >
                      {classItem ? (
                        <View style={styles.classContent}>
                          <Text numberOfLines={1} style={styles.classSubject}>{classItem.subject}</Text>
                          <Text numberOfLines={1} style={styles.classTeacher}>{classItem.teacher}</Text>
                          {classItem.room ? (
                            <View style={styles.roomBadge}>
                              <Text numberOfLines={1} style={styles.classRoom}>R: {classItem.room}</Text>
                            </View>
                          ) : null}
                        </View>
                      ) : (
                        <Text style={styles.plusIcon}>+</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  horizontalScroll: {
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    backgroundColor: COLORS.lightBlue,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timeHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  timeTextStart: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timeTextEnd: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayCell: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    padding: 6,
  },
  classCellActive: {
    backgroundColor: COLORS.lightBlue,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  classCellEmpty: {
    backgroundColor: COLORS.white,
  },
  plusIcon: {
    fontSize: 18,
    color: COLORS.placeholder,
    fontWeight: '300',
  },
  classContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  classSubject: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  classTeacher: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 2,
  },
  roomBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 4,
  },
  classRoom: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default TimetableGrid;
