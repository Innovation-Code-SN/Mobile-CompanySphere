import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Header } from '../../components/ui/Header';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';
import { Meeting } from '../../types/meetings';
import { meetingService } from '@/services/meetingService';

// Types pour la navigation
type MeetingsStackParamList = {
  MeetingsList: undefined;
  MeetingsCalendar: undefined;
};

type CalendarScreenNavigationProp = StackNavigationProp<MeetingsStackParamList, 'MeetingsCalendar'>;

const { width } = Dimensions.get('window');
const dayWidth = (width - Spacing.lg * 2) / 7;

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMeetings, setSelectedMeetings] = useState<Meeting[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fonction pour convertir les dates array en Date
  const arrayToDate = (dateArray: any) => {
    if (!dateArray || !Array.isArray(dateArray)) return new Date();
    return new Date(
      dateArray[0],     // année
      dateArray[1] - 1, // mois (0-11)
      dateArray[2],     // jour
      dateArray[3] || 0, // heure
      dateArray[4] || 0  // minute
    );
  };

  // Charger les réunions
  const loadMeetings = useCallback(async () => {
    try {
      console.log('📅 Chargement des réunions pour le calendrier...');
      const response = await meetingService.getMyMeetings();
      
      if (response.success) {
        const normalizedMeetings = response.data.map(meeting => ({
          ...meeting,
          dateDebut: Array.isArray(meeting.dateDebut) 
            ? arrayToDate(meeting.dateDebut)
            : new Date(meeting.dateDebut),
          dateFin: Array.isArray(meeting.dateFin)
            ? arrayToDate(meeting.dateFin) 
            : new Date(meeting.dateFin),
        }));
        
        console.log('📅 Réunions chargées pour calendrier:', normalizedMeetings.length);
        setMeetings(normalizedMeetings);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des réunions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Navigation mois
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  // Retour vers la liste
  const handleBackToList = () => {
    navigation.goBack();
  };

  // Obtenir les jours du mois
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  // Obtenir les réunions pour une date
  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(meeting.dateDebut as Date, date)
    );
  };

  // Obtenir le statut d'une réunion (couleur)
  const getMeetingStatusColor = (meeting: Meeting) => {
    switch (meeting.myStatus) {
      case 'ACCEPTE': return Colors.success;
      case 'EN_ATTENTE': return Colors.warning;
      case 'REFUSE': return Colors.error;
      case 'PEUT_ETRE': return Colors.info;
      default: return Colors.textMuted;
    }
  };

  // Sélectionner une date
  const handleDatePress = (date: Date) => {
    const dayMeetings = getMeetingsForDate(date);
    setSelectedDate(date);
    setSelectedMeetings(dayMeetings);
    
    if (dayMeetings.length > 0) {
      setModalVisible(true);
    }
  };

  const days = getDaysInMonth();

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Calendrier des Réunions" 
        rightIcon="list"
        onRightPress={handleBackToList}
      />
      
      <View style={styles.content}>
        {/* Barre d'outils */}
        <View style={styles.toolbarContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToList}
          >
            <Ionicons name="list" size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>Vue liste</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation mois */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={styles.monthButton}
            onPress={() => navigateMonth('prev')}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.monthButton}
            onPress={() => navigateMonth('next')}
          >
            <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Jours de la semaine */}
        <View style={styles.weekDaysContainer}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <View key={index} style={styles.weekDayContainer}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Grille du calendrier */}
        <ScrollView 
          style={styles.calendarContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.calendarGrid}>
            {days.map((day, index) => {
              const dayMeetings = getMeetingsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayContainer,
                    !isCurrentMonth && styles.dayContainerInactive,
                    isDayToday && styles.dayContainerToday,
                  ]}
                  onPress={() => handleDatePress(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayText,
                    !isCurrentMonth && styles.dayTextInactive,
                    isDayToday && styles.dayTextToday,
                  ]}>
                    {format(day, 'd')}
                  </Text>
                  
                  {/* Indicateurs de réunions */}
                  {dayMeetings.length > 0 && (
                    <View style={styles.meetingsIndicatorContainer}>
                      {dayMeetings.slice(0, 3).map((meeting, mIndex) => (
                        <View
                          key={mIndex}
                          style={[
                            styles.meetingIndicator,
                            { backgroundColor: getMeetingStatusColor(meeting) }
                          ]}
                        />
                      ))}
                      {dayMeetings.length > 3 && (
                        <View style={styles.moreMeetingsIndicator}>
                          <Text style={styles.moreMeetingsText}>+{dayMeetings.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Légende */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Légende :</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>Accepté</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.warning }]} />
              <Text style={styles.legendText}>En attente</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.error }]} />
              <Text style={styles.legendText}>Refusé</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.info }]} />
              <Text style={styles.legendText}>Peut-être</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Modal détails du jour */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeModalButton}
              >
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedMeetings.length > 0 ? (
                selectedMeetings.map((meeting, index) => (
                  <View key={index} style={styles.modalMeetingCard}>
                    <View style={styles.modalMeetingHeader}>
                      <Text style={styles.modalMeetingTitle}>{meeting.titre}</Text>
                      {meeting.myStatus && (
                        <View style={[
                          styles.modalStatusBadge, 
                          { backgroundColor: getMeetingStatusColor(meeting) }
                        ]}>
                          <Text style={styles.modalStatusText}>
                            {meeting.myStatus === 'EN_ATTENTE' ? 'En attente' :
                             meeting.myStatus === 'ACCEPTE' ? 'Accepté' :
                             meeting.myStatus === 'REFUSE' ? 'Refusé' :
                             meeting.myStatus === 'PEUT_ETRE' ? 'Peut-être' : meeting.myStatus}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.modalMeetingTime}>
                      {format(meeting.dateDebut as Date, 'HH:mm', { locale: fr })} - {format(meeting.dateFin as Date, 'HH:mm', { locale: fr })}
                    </Text>
                    
                    {meeting.organisateurNom && (
                      <Text style={styles.modalMeetingOrganizer}>
                        Organisé par {meeting.organisateurNom}
                      </Text>
                    )}
                    
                    {(meeting.lieu || meeting.salle) && (
                      <View style={styles.modalMeetingLocation}>
                        <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.modalMeetingLocationText}>
                          {meeting.lieu || meeting.salle}
                        </Text>
                      </View>
                    )}
                    
                    {meeting.description && (
                      <Text style={styles.modalMeetingDescription}>
                        {meeting.description}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.noMeetingsContainer}>
                  <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.noMeetingsText}>Aucune réunion ce jour</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  // Barre d'outils
  toolbarContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: Spacing.md,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.xs,
    ...StyleUtils.getUniformShadow('low'),
  },

  backButtonText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Navigation mois
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },

  monthButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleUtils.getUniformShadow('low'),
  },

  monthTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  monthTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },

  // Jours de la semaine
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },

  weekDayContainer: {
    width: dayWidth,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },

  weekDayText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // Grille calendrier
  calendarContainer: {
    flex: 1,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayContainer: {
    width: dayWidth,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border + '30',
    backgroundColor: Colors.surface,
    position: 'relative',
  },

  dayContainerInactive: {
    backgroundColor: Colors.background,
    opacity: 0.5,
  },

  dayContainerToday: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
    borderWidth: 2,
  },

  dayText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  dayTextInactive: {
    color: Colors.textMuted,
  },

  dayTextToday: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Indicateurs de réunions
  meetingsIndicatorContainer: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },

  meetingIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  moreMeetingsIndicator: {
    backgroundColor: Colors.textMuted,
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  moreMeetingsText: {
    ...Typography.caption,
    color: Colors.surface,
    fontSize: 8,
    fontWeight: '600',
  },

  // Légende
  legendContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...StyleUtils.getUniformShadow('low'),
  },

  legendTitle: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  legendText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    minHeight: '50%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50',
  },

  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },

  closeModalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // Cartes de réunions dans le modal
  modalMeetingCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  modalMeetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },

  modalMeetingTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },

  modalStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.circle,
  },

  modalStatusText: {
    ...Typography.caption,
    color: Colors.surface,
    fontWeight: '600',
    fontSize: 10,
  },

  modalMeetingTime: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },

  modalMeetingOrganizer: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  modalMeetingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  modalMeetingLocationText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginLeft: 4,
  },

  modalMeetingDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },

  // État vide
  noMeetingsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },

  noMeetingsText: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});

export default CalendarScreen;