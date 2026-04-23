import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { StreamingSource } from '@/types';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface ServerSelectorProps {
  sources: StreamingSource[];
  currentSource: StreamingSource | null;
  onSelect: (source: StreamingSource) => void;
}

export default function ServerSelector({
  sources,
  currentSource,
  onSelect,
}: ServerSelectorProps) {
  if (!sources || sources.length === 0) return null;

  const subSources = sources.filter((s) => s.audio === 'sub' || !s.audio);
  const dubSources = sources.filter((s) => s.audio === 'dub');

  return (
    <View style={styles.container}>
      {subSources.length > 0 && (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>SUB</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {subSources.map((source, i) => {
              const isActive = currentSource === source;
              return (
                <TouchableOpacity
                  key={`sub-${i}`}
                  style={[styles.btn, isActive && styles.btnActive]}
                  onPress={() => onSelect(source)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.btnName, isActive && styles.btnNameActive]}>
                    {source.server}
                  </Text>
                  {source.quality !== 'auto' && (
                    <Text style={[styles.btnQuality, isActive && styles.btnQualityActive]}>
                      {source.quality}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {dubSources.length > 0 && (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>DUB</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dubSources.map((source, i) => {
              const isActive = currentSource === source;
              return (
                <TouchableOpacity
                  key={`dub-${i}`}
                  style={[styles.btn, styles.btnDub, isActive && styles.btnActive]}
                  onPress={() => onSelect(source)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.btnName, isActive && styles.btnNameActive]}>
                    {source.server}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs + 2,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  groupLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.black,
    color: Colors.textMuted,
    letterSpacing: 1,
    width: 30,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs + 2,
  },
  btnDub: {
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  btnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  btnName: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  btnNameActive: {
    color: '#000',
  },
  btnQuality: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  btnQualityActive: {
    color: 'rgba(0,0,0,0.6)',
  },
});
