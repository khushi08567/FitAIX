import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

// Interfaces matching backend schemas
interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

interface WorkoutData {
  workout_name: string;
  exercises: Exercise[];
  estimated_duration_mins: number;
  calories_burned: number;
  warnings?: string[];
}

interface NutritionData {
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  ingredients: string[];
  instructions?: string[];
}

interface ComparisonItem {
  name: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

interface ComparisonData {
  title: string;
  item_a: ComparisonItem;
  item_b: ComparisonItem;
  overall_verdict: string;
}

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  time: string;
  ui_card_type?: 'WorkoutCard' | 'NutritionCard' | 'ComparisonCard' | null;
  ui_card_data?: any;
}

interface RachelChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const CHAT_API_URL = 'http://localhost:8000/api/chat';

export const RachelChatModal: React.FC<RachelChatModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'coach',
      text: "Hello Simran! Rachel here, your AI coach. I've synced your daily metrics. How are you feeling today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text) return;

    setInputVal('');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: `msg-${Date.now()}`, sender: 'user', text, time };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsThinking(true);

    try {
      const historyPayload = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload })
      });

      if (!res.ok) throw new Error('Network error');

      const data = await res.json();

      const coachMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: 'coach',
        text: data.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ui_card_type: data.ui_card_type,
        ui_card_data: data.ui_card_data
      };

      setMessages(prev => [...prev, coachMsg]);
    } catch (err) {
      console.error('FastAPI fetch error:', err);
      const offlineMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: 'coach',
        text: "I'm having trouble connecting to my local server. Make sure the FastAPI backend is running on port 8000 and Ollama has gemma2:2b pulled!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, offlineMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const renderCard = (type: string, data: any) => {
    if (type === 'WorkoutCard') {
      const workout: WorkoutData = data;
      return (
        <View style={styles.cardContainer}>
          <Text style={styles.cardHeader}>🏋️ WORKOUT: {workout.workout_name}</Text>
          <Text style={styles.cardSubHeader}>{workout.estimated_duration_mins} mins | {workout.calories_burned} kcal</Text>
          <View style={styles.exerciseList}>
            {workout.exercises.map((ex, idx) => (
              <View key={idx} style={styles.exerciseItem}>
                <View style={styles.exerciseRow}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseReps}>{ex.sets}x{ex.reps}</Text>
                </View>
                {ex.notes && <Text style={styles.exerciseNotes}>{ex.notes}</Text>}
              </View>
            ))}
          </View>
          {workout.warnings && workout.warnings.length > 0 && (
            <View style={styles.warningBlock}>
              {workout.warnings.map((w, idx) => (
                <Text key={idx} style={styles.warningText}>⚠️ {w}</Text>
              ))}
            </View>
          )}
        </View>
      );
    }

    if (type === 'NutritionCard') {
      const meal: NutritionData = data;
      return (
        <View style={styles.cardContainer}>
          <Text style={[styles.cardHeader, { color: '#4CAF50' }]}>🥗 MEAL: {meal.meal_name}</Text>
          <View style={styles.macroRow}>
            <Text style={styles.macroBadge}>🔥 {meal.calories} kcal</Text>
            <Text style={styles.macroBadge}>🥩 P: {meal.protein_g}g</Text>
            <Text style={styles.macroBadge}>🌾 C: {meal.carbs_g}g</Text>
            <Text style={styles.macroBadge}>🥑 F: {meal.fats_g}g</Text>
          </View>
          <Text style={styles.sectionTitle}>Ingredients:</Text>
          {meal.ingredients.map((ing, idx) => (
            <Text key={idx} style={styles.listItem}>• {ing}</Text>
          ))}
          {meal.instructions && meal.instructions.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.sectionTitle}>Preparation:</Text>
              {meal.instructions.map((step, idx) => (
                <Text key={idx} style={styles.listItem}>{idx + 1}. {step}</Text>
              ))}
            </View>
          )}
        </View>
      );
    }

    if (type === 'ComparisonCard') {
      const comp: ComparisonData = data;
      return (
        <View style={styles.cardContainer}>
          <Text style={[styles.cardHeader, { color: '#FFD60A' }]}>⚖️ COMPARE: {comp.title}</Text>
          <View style={styles.comparisonGrid}>
            <View style={styles.comparisonCol}>
              <Text style={styles.comparisonName}>{comp.item_a.name}</Text>
              {comp.item_a.pros.slice(0, 2).map((p, idx) => <Text key={idx} style={styles.proText}>👍 {p}</Text>)}
              {comp.item_a.cons.slice(0, 2).map((c, idx) => <Text key={idx} style={styles.conText}>👎 {c}</Text>)}
            </View>
            <View style={styles.comparisonCol}>
              <Text style={styles.comparisonName}>{comp.item_b.name}</Text>
              {comp.item_b.pros.slice(0, 2).map((p, idx) => <Text key={idx} style={styles.proText}>👍 {p}</Text>)}
              {comp.item_b.cons.slice(0, 2).map((c, idx) => <Text key={idx} style={styles.conText}>👎 {c}</Text>)}
            </View>
          </View>
          <Text style={styles.sectionTitle}>Overall Recommendation:</Text>
          <Text style={styles.verdictText}>"{comp.overall_verdict}"</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.chatWindow}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <View style={styles.avatarGlow}>
                  <Text style={styles.avatarText}>🤖</Text>
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.title}>Rachel</Text>
                  <Text style={styles.status}>AI Health & Performance Coach</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Chats */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={{ paddingVertical: 16 }}
            >
              {messages.map(msg => {
                const isUser = msg.sender === 'user';
                return (
                  <View key={msg.id} style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowCoach]}>
                    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCoach]}>
                      <Text style={styles.bubbleText}>{msg.text}</Text>
                      {msg.ui_card_type && msg.ui_card_data && renderCard(msg.ui_card_type, msg.ui_card_data)}
                      <Text style={styles.timeText}>{msg.time}</Text>
                    </View>
                  </View>
                );
              })}

              {isThinking && (
                <View style={[styles.msgRow, styles.msgRowCoach]}>
                  <View style={[styles.bubble, styles.bubbleCoach, styles.thinkingBubble]}>
                    <ActivityIndicator size="small" color="#FFD60A" />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Form */}
            <View style={styles.inputContainer}>
              <TextInput
                value={inputVal}
                onChangeText={setInputVal}
                placeholder="Ask Rachel about your nutrition or training..."
                placeholderTextColor="#666"
                style={styles.input}
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardContainer: {
    width: '100%',
    maxWidth: 540,
    height: '80%',
    maxHeight: 700,
  },
  chatWindow: {
    width: '100%',
    height: '100%',
    backgroundColor: '#12110D',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#161512',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGlow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFD60A20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD60A',
  },
  avatarText: {
    fontSize: 18,
  },
  title: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  status: {
    color: '#FFD60A',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#222',
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 22,
    lineHeight: 24,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginVertical: 6,
    width: '100%',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowCoach: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#8B5CF625',
    borderColor: '#8B5CF640',
    borderWidth: 1,
    borderBottomRightRadius: 2,
  },
  bubbleCoach: {
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
  },
  timeText: {
    color: '#666',
    fontSize: 8,
    marginTop: 6,
    textAlign: 'right',
  },
  thinkingBubble: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#161512',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  input: {
    flex: 1,
    backgroundColor: '#0F0E0D',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#FFF',
    fontSize: 13,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#FFD60A',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#12110D',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Custom Card Styles
  cardContainer: {
    backgroundColor: '#0A0A09',
    borderColor: '#222',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    width: '100%',
  },
  cardHeader: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 4,
    marginBottom: 6,
  },
  cardSubHeader: {
    color: '#999',
    fontSize: 8,
    marginBottom: 6,
  },
  exerciseList: {
    gap: 6,
  },
  exerciseItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
    paddingBottom: 4,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseName: {
    color: '#FFF',
    fontSize: 10.5,
  },
  exerciseReps: {
    color: '#00F0FF',
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  exerciseNotes: {
    color: '#666',
    fontSize: 8.5,
    marginTop: 2,
  },
  warningBlock: {
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 6,
    marginTop: 6,
    gap: 4,
  },
  warningText: {
    color: '#FF4D4D',
    fontSize: 8.5,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 6,
    marginBottom: 8,
  },
  macroBadge: {
    color: '#AAA',
    fontSize: 8.5,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 4,
  },
  listItem: {
    color: '#CCC',
    fontSize: 9.5,
    lineHeight: 14,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  comparisonCol: {
    flex: 1,
    backgroundColor: '#121210',
    borderRadius: 8,
    padding: 6,
    borderColor: '#222',
    borderWidth: 0.5,
  },
  comparisonName: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  proText: {
    color: '#4CAF50',
    fontSize: 8,
    lineHeight: 11,
  },
  conText: {
    color: '#FF4D4D',
    fontSize: 8,
    lineHeight: 11,
  },
  verdictText: {
    color: '#DDD',
    fontSize: 9,
    fontStyle: 'italic',
    lineHeight: 13,
  }
});
