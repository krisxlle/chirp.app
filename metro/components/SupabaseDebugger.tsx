import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { checkDatabaseSchema, supabase, testNetworkConnectivity, validateSupabaseCredentials } from '../lib/database/mobile-db-supabase';

export default function SupabaseDebugger() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setIsLoading(true);
    setDebugInfo([]);
    
    try {
      addLog('🔍 Starting Supabase diagnostics...');
      
      // Step 1: Validate credentials
      addLog('📋 Step 1: Validating credentials...');
      const credentialsValid = validateSupabaseCredentials();
      addLog(credentialsValid ? '✅ Credentials are valid' : '❌ Credentials are invalid');
      
      if (!credentialsValid) {
        addLog('💡 Please check your Supabase URL and anon key');
        return;
      }
      
      // Step 2: Test network connectivity
      addLog('🌐 Step 2: Testing network connectivity...');
      const networkOk = await testNetworkConnectivity();
      addLog(networkOk ? '✅ Network connectivity OK' : '❌ Network connectivity failed');
      
      if (!networkOk) {
        addLog('💡 Possible solutions:');
        addLog('   - Check internet connection');
        addLog('   - Try running on device instead of simulator');
        addLog('   - Check firewall/VPN settings');
        return;
      }
      
      // Step 3: Test Supabase client
      addLog('🗄️ Step 3: Testing Supabase client...');
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        addLog(`❌ Supabase client error: ${error.message}`);
        addLog(`🔍 Error code: ${error.code}`);
        addLog(`🔍 Error details: ${error.details}`);
      } else {
        addLog('✅ Supabase client working correctly');
        addLog(`📊 Test query result: ${JSON.stringify(data)}`);
      }
      
      // Step 4: Check database schema
      addLog('📋 Step 4: Checking database schema...');
      const schema = await checkDatabaseSchema();
      addLog(`📊 Schema check results:`);
      addLog(`   - Users table: ${schema.users ? '✅ Exists' : '❌ Missing'}`);
      addLog(`   - Chirps table: ${schema.chirps ? '✅ Exists' : '❌ Missing'}`);
      addLog(`   - Follows table: ${schema.follows ? '✅ Exists' : '❌ Missing'}`);
      
      if (!schema.users || !schema.chirps || !schema.follows) {
        addLog('💡 Missing tables detected!');
        addLog('   Run the SQL commands from SUPABASE_SETUP_GUIDE.md');
        addLog('   in your Supabase SQL Editor to create the tables.');
      }
      
      addLog('🎉 Diagnostics complete!');
      
    } catch (error) {
      addLog(`❌ Diagnostic error: ${error.message}`);
      console.error('Diagnostic error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setDebugInfo([]);
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Supabase Debugger
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <TouchableOpacity
          onPress={runDiagnostics}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#007AFF',
            padding: 15,
            borderRadius: 8,
            flex: 1
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {isLoading ? 'Running...' : 'Run Diagnostics'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={clearLogs}
          style={{
            backgroundColor: '#FF3B30',
            padding: 15,
            borderRadius: 8,
            flex: 1
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Clear Logs
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          borderRadius: 8, 
          padding: 15,
          borderWidth: 1,
          borderColor: '#ddd'
        }}
      >
        {debugInfo.length === 0 ? (
          <Text style={{ color: '#666', fontStyle: 'italic' }}>
            No diagnostic logs yet. Tap "Run Diagnostics" to start.
          </Text>
        ) : (
          debugInfo.map((log, index) => (
            <Text key={index} style={{ marginBottom: 5, fontFamily: 'monospace', fontSize: 12 }}>
              {log}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}
