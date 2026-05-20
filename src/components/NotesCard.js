import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';

const NotesCard = ({ item, onToggleCompleted, onDelete }) => {
  const { title, date, notes, completed } = item;

  // Format the date (e.g. "May 21, 2026")
  const dateFormatted = formatDate(date);

  // Check if the deadline is past and not completed
  const isOverdue = new Date(date) < new Date() && !completed;

  return (
    <View style={[styles.card, completed && styles.cardCompleted, isOverdue && styles.cardOverdue]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={[styles.titleText, completed && styles.titleCompleted]}>
            {title}
          </Text>
          <Text style={[styles.dateText, isOverdue && styles.dateOverdue]}>
            Due: {dateFormatted} {isOverdue && '(Overdue)'}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.statusBadge, completed ? styles.badgeCompleted : styles.badgePending]}
          onPress={onToggleCompleted}
        >
          <Text style={[styles.statusText, completed ? styles.textCompleted : styles.textPending]}>
            {completed ? 'Done ✓' : 'Pending'}
          </Text>
        </TouchableOpacity>
      </View>

      {notes ? (
        <View style={styles.notesSection}>
          <Text style={[styles.notesText, completed && styles.notesCompleted]}>{notes}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  cardOverdue: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.01)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    paddingRight: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontWeight: '500',
  },
  dateOverdue: {
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  badgePending: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textCompleted: {
    color: COLORS.success,
  },
  textPending: {
    color: COLORS.primary,
  },
  notesSection: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  notesCompleted: {
    color: COLORS.gray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  deleteButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  deleteText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
});

export default NotesCard;
