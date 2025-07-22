// AI profile generation for mobile app using OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export async function generateAIProfile(personalityAnswers: string[]): Promise<{
  avatar?: string;
  banner?: string;
  bio?: string;
  interests?: string[];
}> {
  try {
    console.log('Generating AI profile with OpenAI...');
    
    // Generate bio
    const bioResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `Create a fun, authentic bio for a social media profile based on these personality traits: ${personalityAnswers.join(', ')}. Make it 1-2 sentences, casual and engaging. No emojis.`
        }],
        max_tokens: 100
      })
    });

    const bioData = await bioResponse.json();
    const bio = bioData.choices?.[0]?.message?.content || 'Passionate about sharing authentic moments and connecting with amazing people.';

    // Generate interests
    const interestsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `Based on these personality traits: ${personalityAnswers.join(', ')}, suggest 5 relevant interests as single words or short phrases. Return as JSON array: ["interest1", "interest2", ...]`
        }],
        max_tokens: 100,
        response_format: { type: "json_object" }
      })
    });

    const interestsData = await interestsResponse.json();
    let interests = ['Technology', 'Art', 'Music', 'Travel', 'Food'];
    try {
      const parsed = JSON.parse(interestsData.choices?.[0]?.message?.content || '{}');
      if (Array.isArray(parsed.interests)) {
        interests = parsed.interests.slice(0, 5);
      }
    } catch (e) {
      console.log('Using fallback interests');
    }

    // Generate avatar image
    const avatarResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Create a maximalist, explosively detailed cartoon avatar representing someone with these traits: ${personalityAnswers.slice(0, 3).join(', ')}. Hyper-detailed collage aesthetic with layered symbols, patterns, textures, floating elements, and rich visual density. Soft pastels and harmonious jewel tones. Square format, no text.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });

    const avatarData = await avatarResponse.json();
    const avatar = avatarData.data?.[0]?.url;

    // Generate banner image
    const bannerResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Create a maximalist banner image reflecting these personality traits: ${personalityAnswers.slice(0, 3).join(', ')}. Explosively detailed landscape with layered visual elements, floating symbols, rich textures, and dense visual composition. Soft pastels and jewel tones. Wide banner format 1792x1024, no text.`,
        n: 1,
        size: '1792x1024',
        quality: 'standard'
      })
    });

    const bannerData = await bannerResponse.json();
    const banner = bannerData.data?.[0]?.url;

    console.log('AI profile generation completed successfully');
    
    return {
      avatar,
      banner,
      bio,
      interests
    };
  } catch (error) {
    console.error('AI profile generation failed:', error);
    
    // Return fallback data
    return {
      bio: 'Passionate about sharing authentic moments and connecting with amazing people.',
      interests: ['Technology', 'Art', 'Music', 'Travel', 'Food']
    };
  }
}

export function generateFallbackAvatar(initials: string): string {
  // Generate SVG avatar with rich visual elements
  const colors = ['#7c3aed', '#d946ef', '#ec4899', '#f97316', '#06b6d4'];
  const symbols = ['●', '◆', '▲', '■', '⬟', '⭐', '🌟', '✨', '💎', '🔮'];
  
  const bgColor = colors[Math.floor(Math.random() * colors.length)];
  const accentColor = colors[Math.floor(Math.random() * colors.length)];
  const symbol1 = symbols[Math.floor(Math.random() * symbols.length)];
  const symbol2 = symbols[Math.floor(Math.random() * symbols.length)];
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#grad)"/>
      <text x="50" y="35" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${symbol1}</text>
      <text x="50" y="65" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${initials}</text>
      <text x="50" y="85" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${symbol2}</text>
    </svg>
  `)}`;
}

export function generateFallbackBanner(): string {
  const colors = ['#7c3aed', '#d946ef', '#ec4899', '#f97316', '#06b6d4'];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  const color3 = colors[Math.floor(Math.random() * colors.length)];
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:0.8" />
          <stop offset="50%" style="stop-color:${color2};stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:${color3};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill="url(#bannerGrad)"/>
      <circle cx="80" cy="30" r="15" fill="white" opacity="0.3"/>
      <circle cx="320" cy="90" r="20" fill="white" opacity="0.2"/>
      <polygon points="200,20 220,60 180,60" fill="white" opacity="0.25"/>
      <rect x="300" y="20" width="30" height="30" fill="white" opacity="0.2"/>
    </svg>
  `)}`;
}