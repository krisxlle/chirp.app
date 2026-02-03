import { registerRootComponent } from 'expo';
import { AuthProvider } from './components/AuthContext';
import ChirpApp from './components/ChirpApp';

function App() {
  return (
    <AuthProvider>
      <ChirpApp />
    </AuthProvider>
  );
}

registerRootComponent(App);
