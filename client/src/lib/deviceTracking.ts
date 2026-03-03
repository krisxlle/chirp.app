// Device and browser fingerprinting for identity inference
// Complies with privacy policy section on "Inferred Identity"

interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  platform: string;
  screenResolution: string;
  language: string;
  timezone: string;
  lastSeen: string;
  ipAddress?: string; // Would need backend to populate
}

/**
 * Generate a device fingerprint based on browser characteristics
 */
export function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.hardwareConcurrency || 'unknown',
  ];
  
  // Simple hash function
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `device_${Math.abs(hash).toString(36)}`;
}

/**
 * Get detailed device information
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    deviceId: generateDeviceFingerprint(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    lastSeen: new Date().toISOString(),
  };
}

/**
 * Store device association with user account
 */
export async function associateDeviceWithUser(userId: string, supabase: any): Promise<void> {
  try {
    const deviceInfo = getDeviceInfo();
    
    console.log('🔍 Associating device with user:', {
      userId: userId.substring(0, 8) + '...',
      deviceId: deviceInfo.deviceId,
      platform: deviceInfo.platform
    });
    
    // Check if device association already exists
    const { data: existingDevice } = await supabase
      .from('user_devices')
      .select('id, device_id')
      .eq('user_id', userId)
      .eq('device_id', deviceInfo.deviceId)
      .single();
    
    if (existingDevice) {
      // Update last seen time
      const { error: updateError } = await supabase
        .from('user_devices')
        .update({
          last_seen: deviceInfo.lastSeen,
          user_agent: deviceInfo.userAgent
        })
        .eq('id', existingDevice.id);
      
      if (updateError) {
        console.error('Error updating device info:', updateError);
      } else {
        console.log('✅ Device last_seen updated');
      }
    } else {
      // Create new device association
      const { error: insertError } = await supabase
        .from('user_devices')
        .insert({
          user_id: userId,
          device_id: deviceInfo.deviceId,
          user_agent: deviceInfo.userAgent,
          platform: deviceInfo.platform,
          screen_resolution: deviceInfo.screenResolution,
          language: deviceInfo.language,
          timezone: deviceInfo.timezone,
          first_seen: deviceInfo.lastSeen,
          last_seen: deviceInfo.lastSeen,
          is_active: true
        });
      
      if (insertError) {
        // If table doesn't exist, fail silently (migration not run yet)
        if (insertError.code === '42P01') {
          console.warn('⚠️ user_devices table does not exist. Run migration to enable device tracking.');
        } else {
          console.error('Error creating device association:', insertError);
        }
      } else {
        console.log('✅ New device associated with user account');
      }
    }
    
    // Store device ID in localStorage for quick access
    localStorage.setItem('chirp_device_id', deviceInfo.deviceId);
    
  } catch (error) {
    console.error('Error in device tracking:', error);
  }
}

/**
 * Get all devices associated with a user
 */
export async function getUserDevices(userId: string, supabase: any): Promise<DeviceInfo[]> {
  try {
    const { data, error } = await supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen', { ascending: false });
    
    if (error) {
      if (error.code === '42P01') {
        console.warn('⚠️ user_devices table does not exist. Run migration to enable device tracking.');
        return [];
      }
      console.error('Error fetching user devices:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user devices:', error);
    return [];
  }
}

/**
 * Track anonymous session before user signs in
 * This allows inferring identity when user later signs in
 */
export function trackAnonymousSession(): void {
  const deviceId = generateDeviceFingerprint();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store anonymous session data
  const anonymousData = {
    sessionId,
    deviceId,
    startTime: new Date().toISOString(),
    deviceInfo: getDeviceInfo()
  };
  
  localStorage.setItem('chirp_anonymous_session', JSON.stringify(anonymousData));
  console.log('🔍 Anonymous session tracked:', sessionId);
}

/**
 * Get current device ID (for identity inference)
 */
export function getCurrentDeviceId(): string {
  let deviceId = localStorage.getItem('chirp_device_id');
  
  if (!deviceId) {
    deviceId = generateDeviceFingerprint();
    localStorage.setItem('chirp_device_id', deviceId);
  }
  
  return deviceId;
}
