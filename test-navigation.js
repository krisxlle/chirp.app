// Test navigation by injecting a click event
console.log('Testing profile navigation...');

// Wait for page to load
setTimeout(() => {
  // Look for avatar images and try clicking one
  const avatarImages = document.querySelectorAll('img[src*="avatar"]');
  console.log('Found avatar images:', avatarImages.length);
  
  if (avatarImages.length > 0) {
    console.log('Clicking first avatar for navigation test...');
    avatarImages[0].click();
  } else {
    console.log('No avatar images found to test navigation');
  }
}, 3000);