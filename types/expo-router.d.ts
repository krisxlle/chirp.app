declare module 'expo-router' {
  import { ComponentType, ReactNode } from 'react';
  import { NavigationProp } from '@react-navigation/native';

  export interface Router {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    canGoBack: () => boolean;
    dismiss: () => void;
    dismissAll: () => void;
    setParams: (params: Record<string, any>) => void;
  }

  export interface LinkProps {
    href: string;
    asChild?: boolean;
    children: ReactNode;
  }

  export interface RedirectProps {
    href: string;
  }

  export const router: Router;
  export const useRouter: () => Router;
  export const useLocalSearchParams: () => Record<string, string | string[]>;
  export const useGlobalSearchParams: () => Record<string, string | string[]>;
  export const useSegments: () => string[];
  export const usePathname: () => string;
  export const useNavigation: () => NavigationProp<any>;
  export const Link: ComponentType<LinkProps>;
  export const Redirect: ComponentType<RedirectProps>;
  export const Stack: ComponentType<any>;
  export const Tabs: ComponentType<any>;
  export const Slot: ComponentType<any>;
  export const UnstableLayout: ComponentType<any>;
}
