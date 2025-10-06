// Temporary React Native type declarations for Expo projects
declare module 'react-native' {
  import { ReactNode } from 'react';

  export interface ViewStyle {
    [key: string]: any;
  }
  
  export interface TextStyle {
    [key: string]: any;
  }
  
  export interface ImageStyle {
    [key: string]: any;
  }
  
  export interface StyleSheet {
    [key: string]: ViewStyle | TextStyle | ImageStyle;
  }
  
  export const StyleSheet: {
    create: <T extends StyleSheet>(styles: T) => T;
    flatten: (style: any) => any;
    absoluteFill: ViewStyle;
    absoluteFillObject: ViewStyle;
    hairlineWidth: number;
  };
  
  export interface ViewProps {
    style?: ViewStyle | ViewStyle[];
    children?: ReactNode;
    [key: string]: any;
  }
  
  export interface TextProps {
    style?: TextStyle | TextStyle[];
    children?: ReactNode;
    [key: string]: any;
  }
  
  export interface TouchableOpacityProps {
    style?: ViewStyle | ViewStyle[];
    onPress?: (event?: any) => void;
    children?: ReactNode;
    activeOpacity?: number;
    disabled?: boolean;
    hitSlop?: any;
    [key: string]: any;
  }
  
  export interface TextInputProps {
    style?: TextStyle | TextStyle[];
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    maxLength?: number;
    scrollEnabled?: boolean;
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
    onContentSizeChange?: (event: any) => void;
    onSelectionChange?: (event: any) => void;
    onPressIn?: (event: any) => void;
    onPressOut?: (event: any) => void;
    ref?: React.RefObject<any>;
    [key: string]: any;
  }
  
  export interface ModalProps {
    visible: boolean;
    transparent?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
    onRequestClose?: () => void;
    children?: ReactNode;
    [key: string]: any;
  }
  
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;
  export const TextInput: React.ComponentType<TextInputProps>;
  export const ScrollView: React.ComponentType<any>;
  export const Image: React.ComponentType<any>;
  export const Modal: React.ComponentType<ModalProps>;
  export const ActivityIndicator: React.ComponentType<any>;
  export const KeyboardAvoidingView: React.ComponentType<any>;
  
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[], options?: any) => void;
  };
  
  export const Clipboard: {
    setString: (text: string) => Promise<void>;
    getString: () => Promise<string>;
  };
  
  export const Platform: {
    OS: 'ios' | 'android' | 'web' | 'windows' | 'macos';
    select: (obj: any) => any;
  };
}
