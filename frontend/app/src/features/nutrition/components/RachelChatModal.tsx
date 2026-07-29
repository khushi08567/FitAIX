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
import { useQueryClient } from '@tanstack/react-query';
import { Audio } from 'expo-av';

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

// Helpers for encoding raw PCM samples to a 16-bit Mono WAV file in the browser
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: 'audio/wav' });
}

export const RachelChatModal: React.FC<RachelChatModalProps> = ({ visible, onClose }) => {
  const queryClient = useQueryClient();
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

  // Audio recording and playback states
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Web Audio Recording Refs
  const webAudioContextRef = useRef<any>(null);
  const webStreamRef = useRef<any>(null);
  const webProcessorRef = useRef<any>(null);
  const webBuffersRef = useRef<Float32Array[]>([]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isThinking]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(err => console.warn("Audio cleanup error:", err));
      }
    };
  }, []);

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
      
      // Invalidate queries to refresh dashboard charts immediately
      queryClient.invalidateQueries();

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

  const playVoiceAudio = async (base64AudioUrl: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: base64AudioUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch (err) {
      console.error('Failed to play sound:', err);
    }
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        webStreamRef.current = stream;
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        webAudioContextRef.current = audioCtx;
        
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        webProcessorRef.current = processor;
        
        webBuffersRef.current = [];
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          webBuffersRef.current.push(new Float32Array(inputData));
        };
        
        source.connect(processor);
        processor.connect(audioCtx.destination);
        
        setIsRecording(true);
        return;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Microphone permission is required to record voice notes!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      });
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    
    if (Platform.OS === 'web') {
      try {
        if (webProcessorRef.current) {
          webProcessorRef.current.disconnect();
          webProcessorRef.current = null;
        }
        if (webAudioContextRef.current) {
          await webAudioContextRef.current.close();
          webAudioContextRef.current = null;
        }
        if (webStreamRef.current) {
          webStreamRef.current.getTracks().forEach((track: any) => track.stop());
          webStreamRef.current = null;
        }
        
        const buffers = webBuffersRef.current;
        let totalLength = 0;
        for (const buf of buffers) {
          totalLength += buf.length;
        }
        const flatSamples = new Float32Array(totalLength);
        let offset = 0;
        for (const buf of buffers) {
          flatSamples.set(buf, offset);
          offset += buf.length;
        }
        
        const wavBlob = encodeWAV(flatSamples, 16000);
        const wavUrl = URL.createObjectURL(wavBlob);
        
        await sendVoiceMessage(wavUrl);
      } catch (err) {
        console.error('Failed to stop web recording', err);
      }
      return;
    }

    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        await sendVoiceMessage(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const sendVoiceMessage = async (audioUri: string) => {
    setIsThinking(true);
    const userMsgId = `voice-msg-${Date.now()}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: '🎤 Sending voice message...',
      time,
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const formData = new FormData();
      
      const responseBlob = await fetch(audioUri);
      const blob = await responseBlob.blob();
      
      formData.append('audio', blob, 'voice.wav');
      
      const historyPayload = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
      }));
      formData.append('history', JSON.stringify(historyPayload));

      const res = await fetch('http://localhost:8000/api/chat/voice', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Speech process error');

      const data = await res.json();
      
      setMessages(prev =>
        prev.map(m =>
          m.id === userMsgId ? { ...m, text: `🎤 ${data.user_transcribed_text}` } : m
        )
      );

      queryClient.invalidateQueries();

      const coachMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: 'coach',
        text: data.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ui_card_type: data.ui_card_type,
        ui_card_data: data.ui_card_data
      };

      setMessages(prev => [...prev, coachMsg]);

      if (data.voice_audio) {
        await playVoiceAudio(data.voice_audio);
      }
    } catch (err) {
      console.error('Voice send error:', err);
      setMessages(prev => prev.filter(m => m.id !== userMsgId));
      const errorMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: 'coach',
        text: "I couldn't process your voice note. Make sure you speak clearly and allowed microphone access!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
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

  if (!visible) return null;

  return (
    <View style={styles.absoluteChatWindow}>
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
            <TouchableOpacity
              onPressIn={startRecording}
              onPressOut={stopRecording}
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
            >
              <Text style={styles.micBtnText}>{isRecording ? '🔴' : '🎤'}</Text>
            </TouchableOpacity>

            <TextInput
              value={inputVal}
              onChangeText={setInputVal}
              placeholder={isRecording ? "Listening to your voice..." : "Ask Rachel about your nutrition or training..."}
              placeholderTextColor="#666"
              style={styles.input}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit={false}
              editable={!isRecording}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendBtn} disabled={isRecording}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteChatWindow: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: '90%',
    maxWidth: 460,
    height: '70%',
    maxHeight: 620,
    zIndex: 9999,
  },
  keyboardContainer: {
    width: '100%',
    height: '100%',
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
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E1D1A',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  micBtnActive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  micBtnText: {
    fontSize: 16,
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
