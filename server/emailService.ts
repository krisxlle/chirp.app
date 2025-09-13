import nodemailer from 'nodemailer';

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

async function sendFeedbackEmailViaGmail(feedback: any, userClaims?: any): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    const userName = feedback.name || 'Anonymous User';
    const userEmail = feedback.email || userClaims?.email || 'Not provided';
    const submissionTime = new Date().toLocaleString();

    const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 24px; text-align: center;">
        <div style="display: inline-block; background: white; border-radius: 12px; padding: 8px; margin-bottom: 12px;">
          <div style="font-size: 24px;">🐤</div>
        </div>
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">New Feedback Received</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Someone shared their thoughts about Chirp</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 24px;">
        <!-- User Info -->
        <div style="background: #f8f9ff; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #7c3aed;">
          <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px;">👤 Submission Details</h3>
          <div style="display: grid; gap: 8px;">
            <div><strong style="color: #4b5563;">Name:</strong> <span style="color: #1f2937;">${userName}</span></div>
            <div><strong style="color: #4b5563;">Email:</strong> <span style="color: #1f2937;">${userEmail}</span></div>
            <div><strong style="color: #4b5563;">Category:</strong> <span style="color: #1f2937;">${feedback.category}</span></div>
            <div><strong style="color: #4b5563;">Submitted:</strong> <span style="color: #1f2937;">${submissionTime}</span></div>
          </div>
        </div>
        
        <!-- Message -->
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">💭 Message</h3>
          <div style="background: #f9fafb; border-radius: 6px; padding: 16px; border-left: 4px solid #d1d5db;">
            <p style="margin: 0; line-height: 1.6; color: #374151; white-space: pre-wrap; font-size: 15px;">${feedback.message}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>📋 Next Steps:</strong> ${userEmail !== 'Not provided' ? 'Consider responding to the user within 24 hours.' : 'No email provided - this is anonymous feedback.'}
          </p>
        </div>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'joinchirp@gmail.com',
      subject: `🐤 New Chirp Feedback: ${feedback.category}`,
      html: emailHtml
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to send feedback email via Gmail:', error);
    return false;
  }
}

export async function sendFeedbackNotification(feedback: any, userClaims?: any): Promise<boolean> {
  try {
    // Log the feedback details to console for immediate visibility
    console.log("🐤 NEW CHIRP FEEDBACK RECEIVED:");
    console.log("==================================");
    console.log('Name:', feedback.name || 'Anonymous');
    console.log('Category:', feedback.category);
    console.log('Email:', feedback.email || 'Not provided');
    console.log('User:', userClaims ? userClaims.email + ' (ID: ' + userClaims.sub + ')' : 'Anonymous');
    console.log('Time:', new Date().toLocaleString());
    console.log("----------------------------------");
    console.log('Message:\n' + feedback.message);
    console.log("==================================");
    
    // Check Gmail credentials
    console.log('🔍 Gmail User:', process.env.GMAIL_USER ? 'SET' : 'NOT SET');
    console.log('🔍 Gmail Password:', process.env.GMAIL_PASSWORD ? 'SET' : 'NOT SET');
    
    // Send email via Gmail if credentials are configured
    if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
      console.log("📧 Gmail credentials detected, sending feedback email...");
      const emailSent = await sendFeedbackEmailViaGmail(feedback, userClaims);
      if (emailSent) {
        console.log("✅ Feedback email sent successfully to joinchirp@gmail.com");
      } else {
        console.warn("⚠️ Email sending failed, but feedback was still saved to database");
      }
      return emailSent;
    } else {
      console.log("📝 Gmail credentials not configured, only logging to console");
      return false;
    }
  } catch (error) {
    console.error("Error processing feedback notification:", error);
    return false;
  }
}

export async function sendSupportNotificationEmail(supportRequest: any): Promise<boolean> {
  try {
    // Check Gmail credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.log("📝 Gmail credentials not configured for support notifications");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
      <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🐤 New Support Request</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">📋 Support Details</h2>
        <p><strong>Category:</strong> ${escapeHtml(supportRequest.category)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(supportRequest.subject)}</p>
        <p><strong>Contact Email:</strong> ${escapeHtml(supportRequest.email || 'Not provided')}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="background: white; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #333; margin-top: 0;">💬 Message</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(supportRequest.message)}</p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e;">
          <strong>Next Steps:</strong> Please respond to the user within 24 hours if they provided an email address.
        </p>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'joinchirp@gmail.com',
      subject: `🐤 New Support Request: ${escapeHtml(supportRequest.subject)}`,
      html: emailHtml
    });

    console.log('✅ Support notification email sent to joinchirp@gmail.com');
    return true;
  } catch (error) {
    console.error('❌ Failed to send support notification email:', error);
    return false;
  }
}

async function sendEmailViaGmail(feedback: any, userClaims?: any): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD // Use app password, not regular password
      }
    });

    const userInfo = userClaims ? `${userClaims.email || 'Anonymous'} (ID: ${userClaims.sub})` : 'Anonymous user';
    
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
      <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🐤 New Chirp Feedback</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">📋 Feedback Details</h2>
        <p><strong>Category:</strong> ${feedback.category}</p>
        <p><strong>Subject:</strong> ${feedback.subject}</p>
        <p><strong>Submitted by:</strong> ${userInfo}</p>
        <p><strong>Contact Email:</strong> ${feedback.email || 'Not provided'}</p>
        <p><strong>Location:</strong> ${feedback.location || 'Not specified'}</p>
        <p><strong>Submitted:</strong> ${new Date(feedback.createdAt).toLocaleString()}</p>
      </div>
      
      <div style="background: white; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #333; margin-top: 0;">💬 Message</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${feedback.message}</p>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'kriselle.t@gmail.com',
      subject: `🐤 Chirp Feedback: ${feedback.subject}`,
      html: emailHtml
    });

    console.log("✅ Email notification sent via Gmail");
    return true;
  } catch (error) {
    console.error("Gmail SMTP error:", error);
    return false;
  }
}

// Simple email fallback - just log feedback for now
// We can implement SMTP later if needed

interface WeeklyStats {
  userId: string;
  userEmail: string;
  userName: string;
  userHandle: string;
  weekStartDate: string;
  weekEndDate: string;
  
  // Content metrics
  chirpsPosted: number;
  repliesReceived: number;
  totalReactions: number;
  topChirp: {
    content: string;
    reactions: number;
    replies: number;
  } | null;
  
  // Growth metrics
  newFollowers: number;
  totalFollowers: number;
  followersGrowthPercent: number;
  newFollowing: number;
  
  // Engagement metrics
  avgReactionsPerChirp: number;
  avgRepliesPerChirp: number;
  topReactions: Array<{ emoji: string; count: number }>;
  engagementRate: number;
  
  // AI insights
  aiSummary: string;
  viralPotential: number; // 1-10 score
  recommendations: string[];
}

export async function sendWeeklyAnalyticsEmail(stats: WeeklyStats): Promise<boolean> {
  try {
    // Log to console first
    console.log('📊 WEEKLY ANALYTICS for', stats.userName, ':');
    console.log("=====================================");
    console.log('User:', stats.userName, '(@' + stats.userHandle + ')');
    console.log('Week:', stats.weekStartDate, '-', stats.weekEndDate);
    console.log('Chirps Posted:', stats.chirpsPosted);
    console.log('New Followers:', stats.newFollowers, '(Total:', stats.totalFollowers + ')');
    console.log('Engagement Rate:', stats.engagementRate + '%');
    console.log('Viral Potential:', stats.viralPotential + '/10');
    console.log("=====================================");

    // Send email if Gmail is configured
    if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
      console.log('📧 Sending weekly analytics email to', stats.userEmail, '...');
      const emailSent = await sendWeeklyEmailViaGmail(stats);
      if (emailSent) {
        console.log('✅ Weekly analytics email sent to', stats.userEmail);
      } else {
        console.warn('⚠️ Failed to send weekly analytics email to', stats.userEmail);
      }
      return emailSent;
    } else {
      console.log("📝 Gmail not configured, only logging weekly analytics");
      return true;
    }
  } catch (error) {
    console.error("Error processing weekly analytics:", error);
    return false;
  }
}

async function sendWeeklyEmailViaGmail(stats: WeeklyStats): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    const topReactionsText = stats.topReactions.length > 0 
      ? stats.topReactions.map(r => `${r.emoji} ${r.count}`).join(', ')
      : 'No reactions yet';

    const recommendationsHtml = stats.recommendations.length > 0
      ? stats.recommendations.map(rec => `<li style="margin: 8px 0; color: #374151;">${rec}</li>`).join('')
      : '<li style="margin: 8px 0; color: #6b7280; font-style: italic;">Keep posting regularly to build your audience!</li>';

    const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 30px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
          🐤 Your Weekly Chirp Report
        </h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">
          ${stats.weekStartDate} - ${stats.weekEndDate}
        </p>
      </div>

      <!-- User Info -->
      <div style="padding: 24px; border-bottom: 1px solid #f3f4f6;">
        <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
          Hey ${stats.userName}! 👋
        </h2>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          @${stats.userHandle} • Here's how your week went on Chirp
        </p>
      </div>

      <!-- Stats Grid -->
      <div style="padding: 24px; background: #f9fafb;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
          
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="color: #7c3aed; font-size: 32px; font-weight: 700; line-height: 1;">${stats.chirpsPosted}</div>
            <div style="color: #6b7280; font-size: 13px; font-weight: 500; margin-top: 4px;">Chirps Posted</div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="color: #ec4899; font-size: 32px; font-weight: 700; line-height: 1;">${stats.newFollowers}</div>
            <div style="color: #6b7280; font-size: 13px; font-weight: 500; margin-top: 4px;">New Followers</div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="color: #10b981; font-size: 32px; font-weight: 700; line-height: 1;">${stats.totalReactions}</div>
            <div style="color: #6b7280; font-size: 13px; font-weight: 500; margin-top: 4px;">Total Reactions</div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="color: #f59e0b; font-size: 32px; font-weight: 700; line-height: 1;">${stats.viralPotential}/10</div>
            <div style="color: #6b7280; font-size: 13px; font-weight: 500; margin-top: 4px;">Viral Potential</div>
          </div>
          
        </div>
      </div>

      <!-- Top Chirp -->
      ${stats.topChirp ? `
      <div style="padding: 24px; border-bottom: 1px solid #f3f4f6;">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">🔥 Your Top Chirp</h3>
        <div style="background: #f8fafc; border-left: 4px solid #7c3aed; padding: 16px; border-radius: 8px;">
          <p style="color: #374151; margin: 0 0 8px 0; line-height: 1.5; font-size: 14px;">"${stats.topChirp.content}"</p>
          <div style="color: #6b7280; font-size: 12px;">
            ${stats.topChirp.reactions} reactions • ${stats.topChirp.replies} replies
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Engagement Details -->
      <div style="padding: 24px; border-bottom: 1px solid #f3f4f6;">
        <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">📊 Engagement Breakdown</h3>
        
        <div style="margin-bottom: 16px;">
          <div style="color: #374151; font-size: 14px; margin-bottom: 4px;">
            <strong>Followers Growth:</strong> ${stats.followersGrowthPercent > 0 ? '+' : ''}${stats.followersGrowthPercent}%
          </div>
          <div style="color: #374151; font-size: 14px; margin-bottom: 4px;">
            <strong>Avg Reactions per Chirp:</strong> ${stats.avgReactionsPerChirp.toFixed(1)}
          </div>
          <div style="color: #374151; font-size: 14px; margin-bottom: 4px;">
            <strong>Top Reactions:</strong> ${topReactionsText}
          </div>
        </div>
      </div>

      <!-- AI Summary -->
      <div style="padding: 24px; border-bottom: 1px solid #f3f4f6; background: linear-gradient(135deg, #f8f9ff 0%, #f3f0ff 100%);">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">🤖 AI Weekly Summary</h3>
        <p style="color: #374151; margin: 0; line-height: 1.6; font-size: 14px; font-style: italic;">
          "${stats.aiSummary}"
        </p>
      </div>

      <!-- Recommendations -->
      <div style="padding: 24px; border-bottom: 1px solid #f3f4f6;">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">💡 Recommendations</h3>
        <ul style="margin: 0; padding: 0 0 0 20px; list-style-type: none;">
          ${recommendationsHtml}
        </ul>
      </div>

      <!-- Footer -->
      <div style="padding: 24px; text-align: center; background: #f9fafb;">
        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px;">
          Keep chirping and growing your community! 🚀
        </p>
        <p style="color: #9ca3af; margin: 0 0 12px 0; font-size: 12px;">
          This email was sent automatically from Chirp Social Platform
        </p>
        <p style="color: #9ca3af; margin: 0; font-size: 11px;">
          Don't want weekly analytics? <a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000'}/api/unsubscribe/weekly-analytics?email=${encodeURIComponent(stats.userEmail)}" style="color: #7c3aed; text-decoration: underline;">Unsubscribe here</a>
        </p>
      </div>

    </div>
    `;

    await transporter.sendMail({
      from: `"Chirp Analytics" <${process.env.GMAIL_USER}>`,
      to: stats.userEmail,
      subject: `🐤 Your Weekly Chirp Report - ${stats.weekStartDate}`,
      html: emailHtml
    });

    return true;
  } catch (error) {
    console.error("Gmail SMTP error for weekly analytics:", error);
    return false;
  }
}