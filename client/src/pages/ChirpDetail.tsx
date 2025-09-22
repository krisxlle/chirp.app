import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import ChirpCard from "../components/ChirpCard";
import { useState, useEffect } from "react";

export default function ChirpDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [chirp, setChirp] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chirp and replies using Supabase
  useEffect(() => {
    const fetchChirpData = async () => {
      if (!id) return;
      
      try {
        console.log('🔍 Fetching chirp details for ID:', id);
        
        // Create Supabase client directly for web
        const { createClient } = await import('@supabase/supabase-js');
        
        const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
        
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            storage: {
              getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
              setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
              removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key))
            },
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          },
        });

        // Fetch the main chirp
        const { data: chirpData, error: chirpError } = await supabase
          .from('chirps')
          .select(`
            id,
            content,
            created_at,
            reply_to_id,
            author:users!chirps_author_id_fkey (
              id,
              first_name,
              last_name,
              email,
              handle,
              custom_handle,
              profile_image_url,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (chirpError) {
          console.error('❌ Error fetching chirp:', chirpError);
          setIsLoading(false);
          return;
        }

        if (chirpData) {
          // Transform the chirp data to match expected format
          const transformedChirp = {
            id: chirpData.id,
            content: chirpData.content,
            createdAt: chirpData.created_at,
            replyToId: chirpData.reply_to_id,
            author: {
              id: chirpData.author.id,
              firstName: chirpData.author.first_name,
              lastName: chirpData.author.last_name,
              email: chirpData.author.email,
              handle: chirpData.author.handle,
              customHandle: chirpData.author.custom_handle,
              profileImageUrl: chirpData.author.profile_image_url,
              avatarUrl: chirpData.author.avatar_url,
              isChirpPlus: false,
              showChirpPlusBadge: false
            },
            replyCount: 0, // Will be updated below
            reactionCount: 0, // Default value
            userHasLiked: false, // Default value
            isWeeklySummary: false,
            imageUrl: null,
            imageAltText: null,
            imageWidth: null,
            imageHeight: null,
            isDirectReply: false,
            isNestedReply: false,
            isThreadedChirp: false
          };

          setChirp(transformedChirp);

          // Fetch replies to this chirp
          const { data: repliesData, error: repliesError } = await supabase
            .from('chirps')
            .select(`
              id,
              content,
              created_at,
              reply_to_id,
              author:users!chirps_author_id_fkey (
                id,
                first_name,
                last_name,
                email,
                handle,
                custom_handle,
                profile_image_url,
                avatar_url
              )
            `)
            .eq('reply_to_id', id)
            .order('created_at', { ascending: true });

          if (repliesError) {
            console.error('❌ Error fetching replies:', repliesError);
          } else if (repliesData) {
            // Transform replies data
            const transformedReplies = repliesData.map(reply => ({
              id: reply.id,
              content: reply.content,
              createdAt: reply.created_at,
              replyToId: reply.reply_to_id,
              author: {
                id: reply.author.id,
                firstName: reply.author.first_name,
                lastName: reply.author.last_name,
                email: reply.author.email,
                handle: reply.author.handle,
                customHandle: reply.author.custom_handle,
                profileImageUrl: reply.author.profile_image_url,
                avatarUrl: reply.author.avatar_url,
                isChirpPlus: false,
                showChirpPlusBadge: false
              },
              replyCount: 0,
              reactionCount: 0,
              userHasLiked: false,
              isWeeklySummary: false,
              imageUrl: null,
              imageAltText: null,
              imageWidth: null,
              imageHeight: null,
              isDirectReply: true,
              isNestedReply: false,
              isThreadedChirp: false
            }));

            setReplies(transformedReplies);
            
            // Update the main chirp's reply count
            setChirp(prev => ({
              ...prev,
              replyCount: transformedReplies.length
            }));
          }

          console.log('✅ Chirp details loaded:', transformedChirp.content.substring(0, 50) + '...');
          console.log('✅ Replies loaded:', repliesData?.length || 0);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error in fetchChirpData:', error);
        setIsLoading(false);
      }
    };

    fetchChirpData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Chirp</h1>
          </div>
        </header>

        <main className="pb-20">
          <div className="p-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!chirp) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Chirp</h1>
          </div>
        </header>

        <main className="pb-20">
          <div className="text-center py-8">
            <p className="text-gray-500">Chirp not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Thread</h1>
        </div>
      </header>

      <main className="pb-20">
        {/* Main chirp */}
        <div className="bg-white dark:bg-gray-900">
          <ChirpCard chirp={chirp} />
        </div>

        {/* Replies */}
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : replies.length > 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Replies ({replies.length})
            </h2>
            <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
              {replies.map((reply: any, index: number) => (
                <div key={reply.id} className={index > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""}>
                  <ChirpCard chirp={reply} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No replies yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
