import React from 'react';
import { Platform, ScrollView, ScrollViewProps } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === 'expo';

type Props = ScrollViewProps & {
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  bottomOffset?: number;
  [key: string]: any;
};

let ComponentToRender: React.ComponentType<any> = ScrollView;

if (!isExpoGo && Platform.OS !== 'web') {
  try {
    const KC = require('react-native-keyboard-controller');
    if (KC && KC.KeyboardAwareScrollView) {
      ComponentToRender = KC.KeyboardAwareScrollView;
    }
  } catch {
    ComponentToRender = ScrollView;
  }
}

export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: Props) {
  const Comp = ComponentToRender;
  return (
    <Comp keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...props}>
      {children}
    </Comp>
  );
}
