import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { jikanApi } from '../api/jikan';
import { Anime } from '../types/anime';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SearchModal({ visible, onClose }: Props) {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await jikanApi.searchAnime(q.trim());
      setResults(res.data.slice(0, 6));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleSelect = (anime: Anime) => {
    handleClose();
    navigation.navigate('Detail', { id: anime.mal_id, title: anime.title });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <LinearGradient colors={[...colors.gradients.background]} style={styles.fill}>
        <SafeAreaView style={styles.fill}>
          <KeyboardAvoidingView
            style={styles.fill}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Search bar */}
            <View style={styles.header}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={colors.accentBright} style={styles.searchIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Search anime..."
                  placeholderTextColor={colors.textMuted}
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  returnKeyType="search"
                  selectionColor={colors.accentBright}
                  onSubmitEditing={() => {
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    search(query);
                  }}
                />
                {loading && (
                  <ActivityIndicator size="small" color={colors.accentBright} style={styles.loadingIcon} />
                )}
                {query.length > 0 && !loading && (
                  <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Results */}
            <FlatList
              data={results}
              keyExtractor={(item, index) => `${item.mal_id}-${index}`}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: item.images?.jpg?.image_url }}
                    style={styles.thumb}
                    contentFit="cover"
                    placeholder={{ blurhash: BLURHASH }}
                    transition={200}
                  />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.metaRow}>
                      {item.type ? (
                        <View style={styles.typeBadge}>
                          <Text style={styles.typeText}>{item.type}</Text>
                        </View>
                      ) : null}
                      {item.score != null ? (
                        <Text style={styles.score}>★ {item.score.toFixed(1)}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.subMeta}>
                      {item.episodes ? `${item.episodes} eps` : 'Ongoing'}
                      {item.year ? ` · ${item.year}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                query.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="telescope-outline" size={52} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>Discover Anime</Text>
                    <Text style={styles.emptyHint}>Type a name to start searching</Text>
                  </View>
                ) : query.length < 2 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyHint}>Keep typing...</Text>
                  </View>
                ) : !loading ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={52} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>No results found</Text>
                    <Text style={styles.emptyHint}>Try a different search term</Text>
                  </View>
                ) : null
              }
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 78, 0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {},
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  loadingIcon: {},
  cancelBtn: {
    paddingVertical: 6,
  },
  cancelText: {
    color: colors.accentBright,
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  resultInfo: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: colors.accentMuted,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(224,64,251,0.25)',
  },
  typeText: {
    color: colors.accentBright,
    fontSize: 11,
    fontWeight: '600',
  },
  score: {
    color: colors.star,
    fontSize: 12,
    fontWeight: '700',
  },
  subMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
