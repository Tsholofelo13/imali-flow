import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Call just before a state change that adds, removes or resizes things on screen.
export const animateNext = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
