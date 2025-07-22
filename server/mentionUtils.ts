import { storage } from "./storage";

// Extract mentions from text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // Extract handle without @
  }

  return [...new Set(mentions)]; // Remove duplicates
}

// Find valid users from mentions and create notifications
export async function processMentions(
  text: string, 
  fromUserId: string, 
  type: 'mention' | 'mention_bio',
  chirpId?: number
): Promise<void> {
  const handles = extractMentions(text);
  
  for (const handle of handles) {
    try {
      // Find user by handle
      const mentionedUser = await storage.getUserByHandle(handle);
      
      if (mentionedUser && mentionedUser.id !== fromUserId) {
        // Create notification for the mentioned user
        await storage.createNotification({
          userId: mentionedUser.id,
          type,
          fromUserId,
          chirpId,
        });
      }
    } catch (error) {
      console.error(`Error processing mention for handle ${handle}:`, error);
    }
  }
}