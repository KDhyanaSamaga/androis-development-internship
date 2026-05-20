import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../utils/constants';

const AttendanceCard = ({ item, onAddAttended, onAddBunked, onAddPending, onReset, onDelete }) => {
  const { subject, attended, bunked, pending, total } = item;

  // Total attended + bunked represents classes conducted so far
  // Total = Attended + Bunked + Pending
  // Calculate percentage: (Attended / Total) * 100
  const percentage = total > 0 ? (attended / total) * 100 : 0;
  const percentageFormatted = percentage.toFixed(1);
  const isGood = percentage >= 75;
  const progressColor = isGood ? COLORS.success : COLORS.danger;

  // Svg Circular Progress Math
  const radius = 28;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <View style={styles.infoContainer}>
          <Text style={styles.subjectText}>{subject}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statLine}>
              <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.statText}>Attended: <Text style={styles.boldText}>{attended}</Text></Text>
            </View>
            <View style={styles.statLine}>
              <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.statText}>Bunked: <Text style={styles.boldText}>{bunked}</Text></Text>
            </View>
            <View style={styles.statLine}>
              <View style={[styles.dot, { backgroundColor: COLORS.gray }]} />
              <Text style={styles.statText}>Pending: <Text style={styles.boldText}>{pending}</Text></Text>
            </View>
            <View style={styles.statLine}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.statText}>Total: <Text style={styles.boldText}>{total}</Text></Text>
            </View>
          </View>
        </View>

        {/* Circular Progress SVG */}
        <View style={styles.progressContainer}>
          <Svg width="76" height="76" viewBox="0 0 76 76">
            {/* Background Circle */}
            <Circle
              cx="38"
              cy="38"
              r={radius}
              stroke={COLORS.border}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Circle */}
            <Circle
              cx="38"
              cy="38"
              r={radius}
              stroke={progressColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 38 38)"
            />
            {/* Text Center */}
            <SvgText
              x="38"
              y="42"
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill={COLORS.text}
            >
              {total > 0 ? `${Math.round(percentage)}%` : '0%'}
            </SvgText>
          </Svg>
          <Text style={[styles.statusText, { color: progressColor }]}>
            {isGood ? 'Safe (>=75%)' : 'Shortage (<75%)'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Control Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={onAddAttended}>
          <Text style={styles.btnText}>+ Attended</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={onAddBunked}>
          <Text style={styles.btnText}>+ Bunked</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnGray]} onPress={onAddPending}>
          <Text style={styles.btnText}>+ Pending</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomLinkRow}>
        <TouchableOpacity style={styles.resetLink} onPress={onReset}>
          <Text style={styles.resetLinkText}>Reset Counters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteLink} onPress={onDelete}>
          <Text style={styles.deleteLinkText}>Delete Subject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    paddingRight: 10,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  boldText: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  btnSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  btnDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  btnGray: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  bottomLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  resetLink: {
    padding: 2,
  },
  resetLinkText: {
    fontSize: 11,
    color: COLORS.gray,
    textDecorationLine: 'underline',
  },
  deleteLink: {
    padding: 2,
  },
  deleteLinkText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '600',
  },
});

export default AttendanceCard;
