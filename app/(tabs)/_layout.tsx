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
  label,
}: {
  name: IconName;
  focused: boolean;
  label: string;
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
          size={focused ? 26 : 24}
          color={focused ? Colors.accent : '#64748b'}
        />
      </View>
      <Text style={[styles.tabLabel, { color: focused ? Colors.accent : '#64748b' }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.tabBarAndroid]} />
          )
        ),
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: '#64748b',
        tabBarShowLabel: false,
        tabBarItemStyle: { justifyContent: 'center' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'search' : 'search-outline'} focused={focused} label="Browse" />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'time' : 'time-outline'} focused={focused} label="History" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'android' ? 70 : 65,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabBarAndroid: {
    backgroundColor: 'rgba(11, 14, 20, 0.97)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 202, 40, 0.15)',
  },
});
