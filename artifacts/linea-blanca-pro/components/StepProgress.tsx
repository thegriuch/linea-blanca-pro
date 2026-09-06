import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  steps: string[];
  currentIndex: number;
}

export function StepProgress({ steps, currentIndex }: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <React.Fragment key={step}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done || active ? colors.primary : colors.muted,
                    borderColor: active ? colors.primary : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.dotText, { color: done || active ? colors.primaryForeground : colors.mutedForeground }]}>
                  {done ? '✓' : (i + 1).toString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  { color: active ? colors.primary : done ? colors.mutedForeground : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {step}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View
                style={[styles.line, { backgroundColor: done ? colors.primary : colors.muted }]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  dotText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '500',
    maxWidth: 56,
    textAlign: 'center',
  },
  line: {
    flex: 1,
    height: 2,
    marginBottom: 14,
  },
});
