import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ChirpCard from "@/components/ChirpCard";

export default function ChirpDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  // Get the chirp details
  const { data: chirp, isLoading: chirpLoading } = useQuery({
    queryKey: [`/api/chirps/${id}`],
    enabled: !!id,
  });

  // Get the replies
  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: [`/api/chirps/${id}/replies`],
    enabled: !!id,
  });

  if (chirpLoading) {
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
        {repliesLoading ? (
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