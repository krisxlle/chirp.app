import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './components/AuthContext';
import ChirpApp from './components/ChirpApp';

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ChirpApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
