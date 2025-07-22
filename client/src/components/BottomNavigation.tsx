import { Home, Search, Bell, User } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      isActive: location === "/",
    },
    {
      icon: Search,
      label: "Search", 
      path: "/search",
      isActive: location === "/search",
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/notifications", 
      isActive: location === "/notifications",
      badge: unreadCount?.count > 0 ? unreadCount.count : null,
    },
    {
      icon: User,
      label: "Profile",
      path: `/profile/${user?.id}`,
      isActive: location.startsWith("/profile"),
    },
  ];

  return (
    <TooltipProvider>
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 px-1 py-1">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Tooltip key={item.path} delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setLocation(item.path)}
                  className={`relative p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                    item.isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                      {item.badge > 99 ? "99+" : item.badge}
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}
