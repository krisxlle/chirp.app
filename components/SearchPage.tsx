import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'trending' | 'chirps' | 'users'>('trending');

  const trendingTopics = [
    { hashtag: '#technology', count: '12 chirps' },
    { hashtag: '#socialmedia', count: '8 chirps' },
    { hashtag: '#privacy', count: '5 chirps' },
    { hashtag: '#mobile', count: '3 chirps' },
  ];

  return (
    <View style={styles.container}>
      {/* Header - exactly like original */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#657786"
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>
      </View>

      {/* Tabs - like original */}
      <View style={styles.tabsContainer}>
        {(['trending', 'chirps', 'users'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'trending' ? 'Trending' : tab === 'chirps' ? 'Chirps' : 'Users'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'trending' && (
          <View style={styles.trendingSection}>
            <Text style={styles.sectionTitle}>Trending Topics</Text>
            {trendingTopics.map((topic, index) => (
              <TouchableOpacity key={index} style={styles.trendingItem}>
                <Text style={styles.hashtag}>{topic.hashtag}</Text>
                <Text style={styles.trendingCount}>{topic.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'chirps' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Search for chirps</Text>
            <Text style={styles.emptySubtext}>Enter keywords to find chirps</Text>
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>Search for users</Text>
            <Text style={styles.emptySubtext}>Find people to follow</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#f7f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#657786',
  },
  activeTabText: {
    color: '#7c3aed',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  trendingSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  trendingItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  hashtag: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 4,
  },
  trendingCount: {
    fontSize: 14,
    color: '#657786',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
});