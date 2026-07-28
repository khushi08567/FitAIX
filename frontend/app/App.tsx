import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NutritionScreen } from './src/features/nutrition/screens/NutritionScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NutritionScreen />
    </QueryClientProvider>
  );
}
