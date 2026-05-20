import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './screens/HomeScreen';
import TimetableScreen from './screens/TimetableScreen';
import MaterialsScreen from './screens/MaterialsScreen';
import TasksScreen from './screens/TasksScreen';
import ProfileScreen from './screens/ProfileScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import NotesScreen from './screens/NotesScreen';

import { COLORS } from './utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator for inner screen navigation (Attendance, Notes)
function HomeStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ title: 'Attendance' }}
      />
      <Stack.Screen 
        name="Notes" 
        component={NotesScreen} 
        options={{ title: 'Academic Reminders' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator
          initialRouteName="HomeTab"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'HomeTab') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'TimetableTab') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'MaterialsTab') {
                iconName = focused ? 'folder-open' : 'folder-open-outline';
              } else if (route.name === 'TasksTab') {
                iconName = focused ? 'checkbox' : 'checkbox-outline';
              } else if (route.name === 'ProfileTab') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.gray,
            tabBarStyle: {
              backgroundColor: COLORS.white,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              paddingBottom: 6,
              paddingTop: 6,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              marginBottom: 4,
            },
            headerStyle: {
              backgroundColor: COLORS.white,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            },
            headerTintColor: COLORS.text,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
          })}
        >
          <Tab.Screen 
            name="HomeTab" 
            component={HomeStackScreen} 
            options={{ 
              title: 'Home',
              tabBarLabel: 'Home',
              headerShown: false 
            }} 
          />
          <Tab.Screen 
            name="TimetableTab" 
            component={TimetableScreen} 
            options={{ 
              title: 'Timetable',
              tabBarLabel: 'Schedule',
              headerShown: false
            }} 
          />
          <Tab.Screen 
            name="MaterialsTab" 
            component={MaterialsScreen} 
            options={{ 
              title: 'Materials',
              tabBarLabel: 'Materials',
              headerShown: false
            }} 
          />
          <Tab.Screen 
            name="TasksTab" 
            component={TasksScreen} 
            options={{ 
              title: 'Tasks',
              tabBarLabel: 'Tasks',
              headerShown: false
            }} 
          />
          <Tab.Screen 
            name="ProfileTab" 
            component={ProfileScreen} 
            options={{ 
              title: 'Profile',
              tabBarLabel: 'Profile',
              headerShown: false
            }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  </SafeAreaProvider>
  );
}
