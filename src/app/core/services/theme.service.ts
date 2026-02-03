import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { themePreference } from '../../shared/signals/signals';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
   private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setTheme(isDark: boolean) {
    if (isDark) {
      this.renderer.addClass(document.body, 'dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
      localStorage.setItem('theme', 'light');
    }
    themePreference.set(localStorage.getItem('theme'))
  }

  initTheme() {
    const saved = localStorage.getItem('theme');

    if (saved) {
      this.setTheme(saved === 'dark');
      return;
    }

    // fallback to OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark);
  }
}
