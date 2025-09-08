// find-user-id.js
// Run this script to help find your user ID

console.log('🔍 How to find your user ID:');
console.log('');
console.log('Method 1 - Browser Console:');
console.log('1. Open your app in the browser');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Run this command:');
console.log('');
console.log('const { data: { user } } = await supabase.auth.getUser();');
console.log('console.log("Your user ID:", user?.id);');
console.log('');
console.log('Method 2 - Check Console Logs:');
console.log('1. Look for logs that show your user ID when you log in');
console.log('2. The logs will show something like: "✅ User validation complete - ID: 12345678-1234-1234-1234-123456789abc"');
console.log('');
console.log('Method 3 - Use the Debug Component:');
console.log('1. Add the ChirpInteractionsDebug component to your app');
console.log('2. It will automatically use your current user ID');
console.log('');
console.log('Your user ID will look like: 12345678-1234-1234-1234-123456789abc');
console.log('');
console.log('Once you have your user ID, replace "YOUR_USER_ID" in the SQL queries with your actual ID.');
