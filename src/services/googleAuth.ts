import { UserProfile } from '../types';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const STORAGE_KEY = 'commute_user_session';

export function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT', e);
    return null;
  }
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function logout(): void {
  saveUser(null);
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
}

export function createDemoUser(): UserProfile {
  const demoUser: UserProfile = {
    id: 'demo-user-123',
    name: 'Elias (Demo-Modus)',
    email: 'elias.test@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isDemo: true,
  };
  saveUser(demoUser);
  return demoUser;
}

export function initGoogleSignIn(
  clientId: string,
  elementId: string,
  onSuccess: (user: UserProfile) => void
): boolean {
  if (!window.google?.accounts?.id || !clientId) {
    return false;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        const payload = decodeJwt(response.credential);
        if (payload) {
          const user: UserProfile = {
            id: payload.sub,
            name: payload.name || payload.email.split('@')[0],
            email: payload.email,
            avatarUrl: payload.picture,
            isDemo: false,
          };
          saveUser(user);
          onSuccess(user);
        }
      },
    });

    const targetEl = document.getElementById(elementId);
    if (targetEl) {
      window.google.accounts.id.renderButton(targetEl, {
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        locale: 'de',
      });
    }
    return true;
  } catch (err) {
    console.error('Error initializing Google Sign-In:', err);
    return false;
  }
}
