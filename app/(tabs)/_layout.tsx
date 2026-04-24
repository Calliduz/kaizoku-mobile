import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';
import { BlurView } from 'expo-blur';

type IconName = keyof typeof Ionicons.glyphMap;

import { Text } from 'react-native';

function TabBarIcon({
  name,
  focused,
}: {
  name: IconName;
  focused: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.tabContainer, animatedStyle]}>
      <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
        <Ionicons
          name={name}
          size={focused ? 24 : 22}
          color={focused ? Colors.accent : '#64748b'}
        />
      </View>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: '#64748b',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10 },
        tabBarItemStyle: { padding: 0, margin: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
          tabBarLabel: ({ focused, color }) => <Text style={{ color, fontSize: 10, width: 100, textAlign: 'center', fontWeight: '600' }}>Home</Text>,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'search' : 'search-outline'} focused={focused} />
          ),
          tabBarLabel: ({ focused, color }) => <Text style={{ color, fontSize: 10, width: 100, textAlign: 'center', fontWeight: '600' }}>Browse</Text>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'time' : 'time-outline'} focused={focused} />
          ),
          tabBarLabel: ({ focused, color }) => <Text style={{ color, fontSize: 10, width: 100, textAlign: 'center', fontWeight: '600' }}>History</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    height: Platform.OS === 'android' ? 70 : 65,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#11151c',
    elevation: 0,
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 202, 40, 0.15)',
  },
});
