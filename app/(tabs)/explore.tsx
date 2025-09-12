import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import SearchIcon from '../../components/icons/SearchIcon';

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'chirps' | 'users' | 'trending'>('chirps');

  const trendingTopics = [
    { hashtag: '#technology', count: '12 chirps' },
    { hashtag: '#socialmedia', count: '8 chirps' },
    { hashtag: '#privacy', count: '5 chirps' },
    { hashtag: '#mobile', count: '3 chirps' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Header with back button */}
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>←</ThemedText>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <SearchIcon size={20} color="#657786" />
            <ThemedText type="defaultSemiBold" style={styles.headerTitle}>Search</ThemedText>
          </View>
        </ThemedView>

      {/* Search Input */}
      <ThemedView style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Chirp..."
          placeholderTextColor="#657786"
          value={query}
          onChangeText={setQuery}
        />
      </ThemedView>

      {/* Tabs */}
      <ThemedView style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chirps' && styles.activeTab]}
          onPress={() => setActiveTab('chirps')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'chirps' && styles.activeTabText]}>
            Chirps
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
          onPress={() => setActiveTab('trending')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
            Trending
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'trending' && (
          <ThemedView style={styles.trendingSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Trending Topics
            </ThemedText>
            {trendingTopics.map((topic, index) => (
              <TouchableOpacity key={index} style={styles.trendingItem}>
                <ThemedText type="defaultSemiBold">{topic.hashtag}</ThemedText>
                <ThemedText style={styles.trendingCount}>{topic.count}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}

        {query.trim() === '' && activeTab !== 'trending' && (
          <ThemedView style={styles.emptyState}>
            <ThemedText>Start typing to search for {activeTab}</ThemedText>
          </ThemedView>
        )}

        {query.trim() !== '' && (
          <ThemedView style={styles.emptyState}>
            <ThemedText>Searching for "{query}" in {activeTab}...</ThemedText>
            <ThemedText style={styles.noResults}>No results found</ThemedText>
          </ThemedView>
        )}
      </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    padding: 6,
    marginRight: 12,
    borderRadius: 18,
    backgroundColor: '#f7f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  searchInput: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 20,
    backgroundColor: '#f7f9fa',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1da1f2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#657786',
  },
  activeTabText: {
    color: '#1da1f2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingBottom: 80, // Extra padding to clear navigation bar
  },
  trendingSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  trendingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trendingCount: {
    fontSize: 12,
    color: '#657786',
    marginTop: 2,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  noResults: {
    color: '#657786',
    marginTop: 8,
  },
});