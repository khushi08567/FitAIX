import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export const CommunityScreen: React.FC = () => {
  const [likes, setLikes] = useState<Record<number, number>>({ 0: 12, 1: 8, 2: 15 });

  const feedItems = [
    {
      avatar: '🏋️‍♂️',
      name: 'Marcus Chen',
      action: 'logged a 200kg Deadlift!',
      time: '3 mins ago',
      tags: ['Powerlifting', 'PR'],
    },
    {
      avatar: '🥗',
      name: 'Elena Rostova',
      action: 'logged a vegan high-protein lunch bowl.',
      time: '15 mins ago',
      tags: ['Nutrition', 'Vegan'],
    },
    {
      avatar: '🧘‍♀️',
      name: 'Aisha Bello',
      action: 'finished a 30-minute morning yoga stretch.',
      time: '1 hour ago',
      tags: ['Flexibility', 'Recovery'],
    },
  ];

  const handleLike = (idx: number) => {
    setLikes(prev => ({
      ...prev,
      [idx]: prev[idx] + 1,
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.subTitle}>Connect</Text>
        <Text style={styles.title}>FitAIX Feed 👥</Text>
      </View>

      <View style={styles.feedList}>
        {feedItems.map((item, idx) => (
          <View key={idx} style={styles.feedCard}>
            <View style={styles.userRow}>
              <View style={styles.avatarBg}>
                <Text style={styles.avatarText}>{item.avatar}</Text>
              </View>
              <View>
                <Text style={styles.username}>{item.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </View>

            <Text style={styles.actionText}>{item.action}</Text>

            <View style={styles.tagRow}>
              {item.tags.map((tag, tIdx) => (
                <View key={tIdx} style={styles.tagBadge}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.interactionRow}>
              <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(idx)}>
                <Text style={styles.likeBtnText}>🔥 {likes[idx]}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commentBtn}>
                <Text style={styles.commentBtnText}>💬 Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12110D',
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  subTitle: {
    color: '#A6A090',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  feedList: {
    gap: 16,
  },
  feedCard: {
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F0E0D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  avatarText: {
    fontSize: 20,
  },
  username: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  time: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  actionText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 214, 10, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: '#A6A090',
    fontSize: 10,
    fontWeight: '500',
  },
  interactionRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 12,
  },
  likeBtn: {
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  likeBtnText: {
    color: '#FFD60A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  commentBtnText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
});
