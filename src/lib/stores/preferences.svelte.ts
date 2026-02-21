export type ThemeMode = 'dark' | 'light';

class PreferencesState {
  theme = $state<ThemeMode>('dark');
  privacyMode = $state(true);
  allowPersistence = $state(false);

  constructor() {
    if (typeof window !== 'undefined') {
      const persisted = localStorage.getItem('vennom:prefs');
      if (persisted) {
        try {
          const parsed = JSON.parse(persisted);
          if (parsed.theme === 'dark' || parsed.theme === 'light') this.theme = parsed.theme;
          if (typeof parsed.privacyMode === 'boolean') this.privacyMode = parsed.privacyMode;
          this.allowPersistence = true;
        } catch {
          this.allowPersistence = false;
        }
      }
    }
  }

  save() {
    if (!this.allowPersistence || typeof window === 'undefined') return;
    localStorage.setItem(
      'vennom:prefs',
      JSON.stringify({
        theme: this.theme,
        privacyMode: this.privacyMode
      })
    );
  }
}

export const preferences = new PreferencesState();
