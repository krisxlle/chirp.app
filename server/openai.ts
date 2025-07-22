import OpenAI from "openai";
import { downloadAndSaveImage } from "./imageStorage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function generateWeeklySummary(
  userId: string, 
  chirpCount: number, 
  topChirp: string, 
  topReactions: Array<{ emoji: string; count: number }>,
  commonWords: string[],
  weeklyTone: string
): Promise<{
  summary: string;
  analysis: {
    tone: string;
    topChirps: string[];
    topReactions: Array<{ emoji: string; count: number }>;
    commonWords: string[];
    weeklyVibes: string;
  };
}> {
  try {
    // Generate comprehensive weekly analysis
    const analysisPrompt = `Analyze this week's social media activity:
    - ${chirpCount} chirps posted
    - Top engaging post: "${topChirp}"
    - Most used reactions: ${topReactions?.map(r => `${r.emoji} (${r.count})`).join(', ') || 'none'}
    - Common words: ${commonWords?.join(', ') || 'none'}
    - Overall tone: ${weeklyTone}
    
    Provide analysis in JSON format with:
    - tone: overall emotional tone (happy, thoughtful, energetic, etc.)
    - weeklyVibes: 2-3 word description of the week's energy
    - insights: brief encouraging insight about their posting patterns`;

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');
    
    // Generate summary chirp - make it funny and shareable but HALF THE LENGTH!
    const summaryPrompt = `Create a short, hilarious weekly summary (under 140 characters)! Include:
    - Posted ${chirpCount} chirps this week
    - Their vibe: ${analysis.weeklyVibes || weeklyTone}
    
    Style: Quick, witty, Gen Z humor. Like a bestie roasting you in one perfect line.
    
    Examples:
    - "Posted ${chirpCount} times this week giving main character energy but make it chaotic 💀"
    - "Your ${chirpCount} posts screamed 'I'm fine' this week bestie"
    - "Week summary: ${chirpCount} posts of pure chaos energy ✨"
    
    Keep it SHORT (under 140 chars), punchy, and shareable!`;

    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: summaryPrompt }],
      max_tokens: 75,
    });

    const funnySummary = summaryResponse.choices[0].message.content || getFallbackFunnySummary(chirpCount, topChirp);

    return {
      summary: funnySummary,
      analysis: {
        tone: analysis.tone || weeklyTone,
        topChirps: [topChirp],
        topReactions,
        commonWords,
        weeklyVibes: analysis.weeklyVibes || "chaotic energy"
      }
    };
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return {
      summary: getFallbackFunnySummary(chirpCount, topChirp),
      analysis: {
        tone: weeklyTone,
        topChirps: [topChirp],
        topReactions,
        commonWords,
        weeklyVibes: "chaotic energy"
      }
    };
  }
}

// Fallback funny summaries when AI fails - HALF LENGTH
function getFallbackFunnySummary(chirpCount: number, topChirp: string): string {
  const funnySummaries = [
    `Posted ${chirpCount} times this week giving chaotic energy 💀`,
    `Week recap: ${chirpCount} posts of pure unhinged vibes ✨`,
    `This week I chose chaos and posted ${chirpCount} times`,
    `POV: ${chirpCount} posts was apparently normal for me`,
    `Weekly summary: ${chirpCount} posts of me being iconic`,
    `Me this week: ${chirpCount} posts like I'm the main character`
  ];
  
  return funnySummaries[Math.floor(Math.random() * funnySummaries.length)];
}

export async function generatePersonalizedProfile(
  userId: string, 
  name: string, 
  personality: string,
  traits: string[],
  interests: string[],
  style: string,
  customPrompts?: string,
  isChirpPlus = false
): Promise<{
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  interests: string[];
}> {
  try {
    const genZStyleMap = {
      vibrant: "Y2K vibes, neon colors, maximalist energy, main character aesthetic",
      artistic: "indie sleaze, creative chaos, artistic soul, trendsetter energy", 
      minimalist: "clean girl aesthetic, soft minimalism, intellectual vibes, Pinterest-core",
      dynamic: "adventure-core, outdoorsy vibes, active lifestyle aesthetic",
      playful: "chaotic good energy, meme culture, unhinged but cute vibes",
      dreamy: "coquette aesthetic, soft girl era, dreamy pastels, ethereal vibes",
      modern: "That Girl aesthetic, balanced vibes, effortless cool"
    };

    const avatarStyles = [
      "minimalist cartoon character with simple geometric shapes and bright colors",
      "clean illustrated portrait with flat design and vibrant color palette",
      "simple digital character design with bold outlines and cheerful colors",
      "cute minimalist avatar with basic shapes and playful bright tones",
      "friendly cartoon illustration with clean lines and colorful flat design"
    ];
    
    const bannerStyles = [
      "minimalist geometric pattern with bright gradients and clean shapes",
      "simple abstract landscape with flat colors and basic forms",
      "colorful pattern design with clean lines and vibrant flat tones",
      "cartoon nature scene with simplified shapes and cheerful colors",
      "playful geometric design with bold colors and minimal details"
    ];

    const randomAvatar = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const randomBanner = bannerStyles[Math.floor(Math.random() * bannerStyles.length)];

    const personalityAvatarMap = {
      "Main Character Energy": "simple cartoon character with geometric shapes, cute minimal animals like stylized foxes or cats, bright flat colors (lavender, mint, peach, rose), clean line art style",
      "Creative Icon": "minimalist artistic character with basic geometric animals like simple pandas or rabbits, flat color palette (lilac, sage green, butter yellow), clean art supply shapes",
      "Big Brain Energy": "cute geometric character with minimal animals like round owls or simple elephants, clean pastels (powder blue, cream, soft purple), basic book and plant shapes",
      "Touch Grass Champion": "simple outdoor character with geometric animals like triangular bears or circular deer, nature colors (seafoam, coral, mint), clean mountain and tree shapes",
      "Chaotic Good Bestie": "playful geometric character with fun minimal animals like simple ferrets or colorful parrots, bright flat colors (cotton candy pink, sky blue, lemon), basic playful shapes",
      "Soft Girl Sage": "gentle minimalist character with soft animals like round bunnies or simple doves, dreamy flat colors (blush pink, lavender, cream), clean floral shapes",
      "Balanced Bestie": "harmonious simple character with friendly geometric animals like basic dogs or minimal birds, balanced flat colors (sage, peach, soft blue), clean nature shapes"
    };

    const personalityBannerMap = {
      "Main Character Energy": "simple cartoon landscape with geometric woodland creatures (basic foxes, simple deer, minimal birds) in a clean forest setting, flat color trees, basic mushroom shapes, rainbow gradients in bright pastels (lavender, mint, peach, rose)",
      "Creative Icon": "minimalist garden scene with geometric artistic animals (simple cats with brushes, basic rabbits), clean botanical shapes, basic art supplies, flat color palette (lilac, sage, butter yellow, coral)",
      "Big Brain Energy": "clean library scene with simple wise animals (round owls, basic elephants), minimal academic elements, geometric books and plants, calm flat colors (powder blue, cream, soft purple, mint)",
      "Touch Grass Champion": "simple adventure landscape with geometric outdoor animals (basic bears, simple birds), clean mountain and meadow shapes, minimal camping elements, nature flat colors (seafoam, coral, sage, sky blue)",
      "Chaotic Good Bestie": "playful minimalist meadow with fun geometric animals (simple ferrets, basic parrots), clean flower shapes in organized chaos, bright flat colors (cotton candy pink, lemon, periwinkle, mint)",
      "Soft Girl Sage": "dreamy simple cloud scene with gentle geometric animals (round bunnies, minimal doves), basic rose and blossom shapes, clean botanical elements, soft flat colors (blush pink, lavender, cream, sage)",
      "Balanced Bestie": "harmonious simple nature scene with friendly geometric animals (basic dogs, minimal songbirds), clean herb and flower shapes, peaceful flat countryside, balanced colors (sage, peach, soft blue, cream)"
    };

    const basePrompts = {
      avatar: `Create a ${personalityAvatarMap[personality] || avatarStyles[0]} for someone with ${personality} personality. Use minimalist cartoon style with flat colors, simple geometric shapes, clean line art, and basic cute items (simple teacups, geometric books, minimal instruments). Focus on ${traits.slice(0, 3).join(", ")} traits. Cartoon/anime style with bright, cheerful colors. NO TEXT, NO LETTERS, NO WORDS - only simple, colorful visual design with 100% opacity.`,
      banner: `Create a ${personalityBannerMap[personality] || bannerStyles[0]} reflecting ${personality} and interests in ${interests.slice(0, 3).join(", ")}. Use minimalist cartoon style with flat colors, simple shapes, clean geometric animals, and basic environmental elements. Bright, colorful flat design throughout. NO TEXT, NO LETTERS, NO WORDS - only simple, cheerful visual design suitable as social media banner.`,
      bio: `Write a casual, authentic bio for someone with ${personality.toLowerCase()} personality. They're ${traits.slice(0, 3).join(", ")} and interested in ${interests.join(", ")}. Make it relatable and genuine with a friendly tone. Avoid excessive slang.`
    };

    if (customPrompts) {
      basePrompts.avatar += ` Additional requests: ${customPrompts}`;
      basePrompts.banner += ` Additional requests: ${customPrompts}`;
      basePrompts.bio += ` Additional requests: ${customPrompts}`;
    }

    // Add timestamp and random component to ensure fresh generation
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const enhancedPrompts = {
      avatar: `${basePrompts.avatar} Unique ID: ${uniqueId}`,
      banner: `${basePrompts.banner} Unique ID: ${uniqueId}`,
      bio: basePrompts.bio
    };

    const [avatarUrl, bannerUrl, bio] = await Promise.all([
      generateUserAvatar(userId, name, enhancedPrompts.avatar, isChirpPlus),
      generateUserBanner(userId, enhancedPrompts.banner, isChirpPlus),
      generateUserBio(userId, name, interests, enhancedPrompts.bio, isChirpPlus)
    ]);

    return {
      avatarUrl,
      bannerUrl,
      bio,
      interests
    };
  } catch (error) {
    console.error("Error generating personalized profile:", error);
    throw error;
  }
}

export async function generateUserAvatar(userId: string, name: string, customPrompt?: string, isChirpPlus = false): Promise<string> {
  try {
    const prompt = customPrompt || `Create a minimalist cartoon avatar with simple, clean design for ${name}. 
    Style: Cute minimalist cartoon aesthetic with flat colors and geometric shapes.
    Elements: Include simple cute creatures (basic butterflies, geometric cats, simple foxes, round bears, minimal rabbits), clean flower shapes (basic cherry blossoms, simple roses), basic magical elements (geometric crystals, simple stars, clean moons), minimal artistic items (simple paintbrushes, basic books, geometric musical notes).
    Color Palette: Bright flat colors (lavender, blush pink, sky blue, mint green, warm cream, coral, sunny yellow) with clean, bold tones. Use simple, cheerful colors.
    Design: Clean line art, flat design, cartoon/anime style, simple geometric shapes, minimalist but colorful. Every element should be simple, clean, and cheerful.
    Aesthetic: Cute, friendly, approachable cartoon design that feels playful and colorful without being too detailed or complex.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: isChirpPlus ? "hd" : "standard", // Premium users get HD quality
    });

    const tempUrl = response.data[0].url;
    if (!tempUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    // Download and save the image permanently
    const permanentUrl = await downloadAndSaveImage(tempUrl, userId, 'avatar');
    return permanentUrl;
  } catch (error: any) {
    console.error("Error generating avatar:", error);
    console.error("OpenAI Avatar Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      fullError: JSON.stringify(error, null, 2)
    });
    console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
    console.log("Falling back to SVG avatar generation for user:", userId);
    // Curated aesthetic color palette - soft pastels, jewel tones, and harmonious gradients
    const colors = ['#E8B4F0', '#B4A7F0', '#A7C7F0', '#A7F0E8', '#F0E8A7', '#F0B4A7', '#DDA0DD', '#87CEEB', '#F0E68C', '#FFB6C1', '#B19CD9', '#98D8C8', '#F7DC6F', '#F1948A'];
    // Beautiful geometric symbols and elegant shapes
    const symbols = ['●', '◆', '▲', '★', '◇', '♥', '☀', '☾', '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮', '✯', '✰', '❀', '❁', '❂', '❃', '❄', '❅', '❆', '❇', '❈', '❉'];
    // Cute and aesthetic creatures - carefully selected for beauty
    const creatures = ['🦋', '🐱', '🦊', '🐻', '🐼', '🐨', '🦄', '🐝', '🐞', '🦉', '🐧', '🐰', '🐭', '🌸'];
    // Beautiful objects with aesthetic appeal
    const objects = ['🎨', '🌙', '⭐', '🌟', '💫', '✨', '💎', '🔮', '📚', '🎭', '🎻', '🌺', '🌸', '🌻', '🌹', '🌷'];
    const patterns = ['dots', 'waves', 'stars', 'mandala', 'spiral'];
    
    const color1 = colors[parseInt(userId) % colors.length];
    const color2 = colors[(parseInt(userId) + 2) % colors.length];
    const color3 = colors[(parseInt(userId) + 4) % colors.length];
    const color4 = colors[(parseInt(userId) + 6) % colors.length];
    const mainSymbol = symbols[parseInt(userId) % symbols.length];
    const creature = creatures[parseInt(userId) % creatures.length];
    const object = objects[parseInt(userId) % objects.length];
    const pattern = patterns[parseInt(userId) % patterns.length];
    
    // Create a unique timestamp-based gradient ID to prevent caching
    const gradId = `grad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create multiple intricate patterns
    let patternElement = '';
    if (pattern === 'dots') {
      patternElement = `<pattern id="dots" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
        <circle cx="7.5" cy="7.5" r="2" fill="${color2}" opacity="0.4"/>
        <circle cx="3" cy="3" r="1" fill="${color3}" opacity="0.6"/>
        <circle cx="12" cy="12" r="1.5" fill="${color4}" opacity="0.5"/>
      </pattern>`;
    } else if (pattern === 'waves') {
      patternElement = `<pattern id="waves" x="0" y="0" width="30" height="15" patternUnits="userSpaceOnUse">
        <path d="M0,7.5 Q7.5,2.5 15,7.5 T30,7.5" stroke="${color2}" stroke-width="1.5" fill="none" opacity="0.5"/>
        <path d="M0,11 Q7.5,6 15,11 T30,11" stroke="${color3}" stroke-width="1" fill="none" opacity="0.4"/>
      </pattern>`;
    } else if (pattern === 'stars') {
      patternElement = `<pattern id="stars" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
        <polygon points="12.5,3 15,10 22,10 17,15 19,22 12.5,18 6,22 8,15 3,10 10,10" fill="${color2}" opacity="0.4"/>
        <circle cx="20" cy="5" r="1" fill="${color3}" opacity="0.7"/>
        <circle cx="5" cy="20" r="1.5" fill="${color4}" opacity="0.6"/>
      </pattern>`;
    } else if (pattern === 'mandala') {
      patternElement = `<pattern id="mandala" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <g transform="translate(20,20)">
          <circle r="15" fill="none" stroke="${color2}" stroke-width="1" opacity="0.3"/>
          <circle r="10" fill="none" stroke="${color3}" stroke-width="1" opacity="0.4"/>
          <circle r="5" fill="${color4}" opacity="0.5"/>
        </g>
      </pattern>`;
    } else if (pattern === 'tribal') {
      patternElement = `<pattern id="tribal" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="${color2}" opacity="0.3"/>
        <path d="M5,10 L10,5 L15,10 L10,15 Z" fill="${color3}" opacity="0.4"/>
      </pattern>`;
    }
    
    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${gradId}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="30%" style="stop-color:${color2};stop-opacity:0.9" />
          <stop offset="60%" style="stop-color:${color3};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color4};stop-opacity:1" />
        </radialGradient>
        ${patternElement}
      </defs>
      
      <!-- Base circle with gradient -->
      <circle cx="100" cy="100" r="100" fill="url(#${gradId})" />
      
      <!-- Pattern overlay -->
      ${patternElement ? `<circle cx="100" cy="100" r="95" fill="url(#${pattern})" />` : ''}
      
      <!-- Multiple decorative circles -->
      <circle cx="100" cy="100" r="85" fill="none" stroke="${color4}" stroke-width="2" opacity="0.6"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="${color3}" stroke-width="1.5" opacity="0.5"/>
      <circle cx="100" cy="100" r="55" fill="none" stroke="${color2}" stroke-width="1" opacity="0.4"/>
      
      <!-- Main focal emoji - larger and centered -->
      <text x="100" y="110" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" fill="white">${creature}</text>
      
      <!-- Secondary accent emoji - smaller and positioned above -->
      <text x="100" y="65" font-family="Arial, sans-serif" font-size="25" text-anchor="middle" fill="white" opacity="0.8">${object}</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}

export async function generateUserBanner(userId: string, customPrompt?: string, isChirpPlus = false): Promise<string> {
  try {
    const prompt = customPrompt || `Create a minimalist cartoon banner with simple, clean landscape design.
    Style: Cute minimalist cartoon aesthetic with flat colors and basic geometric shapes.
    Landscape Elements: Simple geometric mountains, basic cloud shapes, clean flower fields, minimal forest scenes with basic trees, simple meadows, clean celestial elements.
    Characters & Creatures: Simple cartoon animals, basic butterflies, geometric woodland creatures, minimal magical beings, all with clean line art and flat colors.
    Natural Elements: Basic flower shapes, simple cloud formations, geometric stars, clean moon and sun shapes, minimal waterfalls, simple plant elements.
    Design: Clean line art, flat design, cartoon/anime style, simple geometric landscapes, minimalist but colorful. Every element should be simple, clean, and cheerful.
    Color Palette: Soft pastels (lavender, blush pink, sky blue, mint green, warm cream), jewel tones, and gentle gradients. Harmonious and Pinterest-worthy aesthetic.
    Composition: Beautifully balanced elements that flow together naturally, creating a cohesive, dreamy panoramic scene that's visually pleasing and harmonious.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: isChirpPlus ? "hd" : "standard", // Premium users get HD quality
    });

    const tempUrl = response.data[0].url;
    if (!tempUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    // Download and save the image permanently
    const permanentUrl = await downloadAndSaveImage(tempUrl, userId, 'banner');
    return permanentUrl;
  } catch (error: any) {
    console.error("Error generating banner:", error);
    console.error("OpenAI Banner Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      fullError: JSON.stringify(error, null, 2)
    });
    console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
    console.log("Falling back to SVG banner generation for user:", userId);
    // Aesthetic color palette - soft pastels and harmonious tones
    const colors = ['#E8B4F0', '#B4A7F0', '#A7C7F0', '#A7F0E8', '#F0E8A7', '#F0B4A7', '#DDA0DD', '#87CEEB', '#F0E68C', '#FFB6C1', '#B19CD9', '#98D8C8', '#F7DC6F', '#F1948A'];
    // Elegant symbols and beautiful shapes
    const symbols = ['●', '◆', '▲', '★', '◇', '♥', '☀', '☾', '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮', '✯', '✰', '❀', '❁', '❂', '❃', '❄', '❅', '❆', '❇', '❈', '❉'];
    // Cute and beautiful creatures
    const creatures = ['🦋', '🐱', '🦊', '🐻', '🐼', '🐨', '🦄', '🐝', '🐞', '🦉', '🐧', '🐰', '🐭'];
    // Aesthetic objects and beautiful items
    const objects = ['🎨', '🌙', '⭐', '🌟', '💫', '✨', '💎', '🔮', '📚', '🎭', '🎻', '🌺', '🌸', '🌻', '🌹', '🌷'];
    // Beautiful nature elements
    const nature = ['🌸', '🌺', '🌻', '🌹', '🌷', '🌿', '🍀', '🌱', '🌊', '🦋', '✨', '💫', '🌙', '⭐', '🌟'];
    
    const color1 = colors[parseInt(userId) % colors.length];
    const color2 = colors[(parseInt(userId) + 2) % colors.length];
    const color3 = colors[(parseInt(userId) + 4) % colors.length];
    const color4 = colors[(parseInt(userId) + 6) % colors.length];
    const color5 = colors[(parseInt(userId) + 8) % colors.length];
    
    // Create unique gradient ID to prevent caching
    const gradId = `bannerGrad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create an explosively detailed banner with maximum visual density
    const svg = `<svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${gradId}" cx="30%" cy="40%" r="80%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="25%" style="stop-color:${color2};stop-opacity:0.9" />
          <stop offset="50%" style="stop-color:${color3};stop-opacity:0.8" />
          <stop offset="75%" style="stop-color:${color4};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${color5};stop-opacity:1" />
        </radialGradient>
        <pattern id="complexPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="2" fill="${color3}" opacity="0.4"/>
          <circle cx="5" cy="5" r="1" fill="${color4}" opacity="0.6"/>
          <circle cx="25" cy="25" r="1.5" fill="${color5}" opacity="0.5"/>
          <polygon points="15,8 18,12 15,16 12,12" fill="${color2}" opacity="0.3"/>
        </pattern>
      </defs>
      
      <!-- Multi-layered background -->
      <rect width="800" height="200" fill="url(#${gradId})" />
      <rect width="800" height="200" fill="url(#complexPattern)" />
      
      <!-- Geometric landscape elements -->
      <polygon points="0,120 150,80 300,100 450,70 600,90 800,110 800,200 0,200" fill="${color4}" opacity="0.3"/>
      <polygon points="0,140 200,100 400,120 600,95 800,125 800,200 0,200" fill="${color3}" opacity="0.2"/>
      
      <!-- Floating geometric structures -->
      <circle cx="120" cy="60" r="25" fill="${color2}" opacity="0.4"/>
      <polygon points="120,40 135,65 105,65" fill="${color5}" opacity="0.6"/>
      <rect x="110" y="70" width="20" height="15" fill="${color1}" opacity="0.5"/>
      
      <circle cx="680" cy="70" r="20" fill="${color3}" opacity="0.4"/>
      <polygon points="680,55 690,75 670,75" fill="${color4}" opacity="0.6"/>
      <rect x="675" y="80" width="10" height="10" fill="${color2}" opacity="0.5"/>
      
      <!-- Larger, more spaced out emojis across the landscape -->
      <text x="150" y="50" font-family="Arial, sans-serif" font-size="28" fill="white" opacity="0.8">${creatures[parseInt(userId) % creatures.length]}</text>
      <text x="400" y="45" font-family="Arial, sans-serif" font-size="32" fill="white" opacity="0.9">${objects[parseInt(userId) % objects.length]}</text>
      <text x="650" y="55" font-family="Arial, sans-serif" font-size="30" fill="${color5}" opacity="0.8">${nature[parseInt(userId) % nature.length]}</text>
      
      <!-- Middle layer - bigger emojis -->
      <text x="250" y="110" font-family="Arial, sans-serif" font-size="26" fill="white" opacity="0.7">${creatures[(parseInt(userId) + 1) % creatures.length]}</text>
      <text x="550" y="95" font-family="Arial, sans-serif" font-size="24" fill="${color3}" opacity="0.8">${objects[(parseInt(userId) + 1) % objects.length]}</text>
      
      <!-- Bottom layer - larger focal emojis -->
      <text x="100" y="155" font-family="Arial, sans-serif" font-size="35" fill="white" opacity="0.9">${nature[(parseInt(userId) + 2) % nature.length]}</text>
      <text x="350" y="150" font-family="Arial, sans-serif" font-size="32" fill="${color4}" opacity="0.8">${creatures[(parseInt(userId) + 2) % creatures.length]}</text>
      <text x="600" y="160" font-family="Arial, sans-serif" font-size="30" fill="white" opacity="0.9">${objects[(parseInt(userId) + 2) % objects.length]}</text>
      <text x="750" y="145" font-family="Arial, sans-serif" font-size="28" fill="${color5}" opacity="0.8">${nature[(parseInt(userId) + 3) % nature.length]}</text>
      
      <!-- Additional decorative geometric shapes -->
      <polygon points="40,80 60,90 40,100 20,90" fill="${color3}" opacity="0.5"/>
      <polygon points="760,90 780,100 760,110 740,100" fill="${color4}" opacity="0.5"/>
      <circle cx="350" cy="130" r="8" fill="${color2}" opacity="0.6"/>
      <circle cx="450" cy="125" r="6" fill="${color5}" opacity="0.6"/>
      
      <!-- Energy streams and connecting lines -->
      <path d="M0,100 Q200,80 400,90 T800,100" stroke="${color5}" stroke-width="2" fill="none" opacity="0.4"/>
      <path d="M0,130 Q300,110 600,120 T800,130" stroke="${color4}" stroke-width="1.5" fill="none" opacity="0.3"/>
    </svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}

export async function generateUserBio(userId: string, handle: string, interests?: string[], customPrompt?: string, isChirpPlus = false): Promise<string> {
  try {
    const interestsText = interests && interests.length > 0 
      ? `with interests in ${interests.join(', ')}` 
      : '';
    
    const prompt = customPrompt || `Generate a casual, friendly bio for @${handle} ${interestsText}. 
    Make it:
    - Under 160 characters
    - Casual but not overly trendy
    - Clean, minimal text without emojis
    - Relatable and authentic
    - Natural, conversational tone
    
    Bio examples:
    - "coffee enthusiast | making art and good vibes | always learning something new"
    - "plant lover | sharing thoughts and hot takes | exploring new places"
    - "creative type | bookworm | trying to make the world a little better"
    
    Generate just the bio text, no quotes.`;

    const response = await openai.chat.completions.create({
      model: isChirpPlus ? "gpt-4o" : "gpt-3.5-turbo", // Premium users get GPT-4o
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
    });

    return response.choices[0].message.content?.trim() || "Just living my best life";
  } catch (error: any) {
    console.error("Error generating bio:", error);
    console.error("OpenAI Bio Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    const bios = [
      "creative soul | coffee enthusiast | always learning",
      "music lover | exploring new places | good vibes only",
      "bookworm | making art | trying to change the world",
      "outdoor enthusiast | digital creator | always curious",
      "creating content that matters | authentic vibes only"
    ];
    return bios[parseInt(userId) % bios.length];
  }
}

export async function generateUserInterests(userId: string, recentChirps: string[]): Promise<string[]> {
  try {
    const chirpsText = recentChirps.join(' ');
    
    const prompt = `Based on these recent social media posts, suggest 3-5 interests/hobbies this person might have. 
    Posts: "${chirpsText}"
    
    Return only a JSON array of interests (single words or short phrases), for example:
    ["photography", "travel", "coffee", "technology", "music"]
    
    If no posts are provided, suggest general popular interests.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"interests": []}');
    return result.interests || ["technology", "music", "travel", "coffee"];
  } catch (error: any) {
    console.error("Error generating interests:", error);
    console.error("OpenAI Interests Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    const defaultInterests = [
      ["technology", "music", "travel"],
      ["photography", "coffee", "books"],
      ["fitness", "cooking", "art"],
      ["movies", "gaming", "nature"],
      ["writing", "design", "sports"]
    ];
    return defaultInterests[parseInt(userId) % defaultInterests.length];
  }
}


