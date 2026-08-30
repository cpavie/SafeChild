import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'safechild-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private mode$ = new BehaviorSubject<ThemeMode>(this.readStoredMode());

  constructor() {
    this.systemQuery.addEventListener('change', () => {
      if (this.mode$.value === 'system') {
        this.applyTheme();
      }
    });
    this.applyTheme();
  }

  private readStoredMode(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  }

  getMode() {
    return this.mode$.asObservable();
  }

  getCurrentMode(): ThemeMode {
    return this.mode$.value;
  }

  isDark(): boolean {
    const mode = this.mode$.value;
    return mode === 'dark' || (mode === 'system' && this.systemQuery.matches);
  }

  setMode(mode: ThemeMode) {
    localStorage.setItem(STORAGE_KEY, mode);
    this.mode$.next(mode);
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-theme', this.isDark());
  }
}
