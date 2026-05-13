import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChatComponent } from '../../../shared/chat/chat.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-monitor-chat',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">💬</div>
        <div>
          <h1 class="page-title">Messagerie</h1>
          <p class="page-subtitle">Communiquez avec vos élèves</p>
        </div>
      </div>
      <app-chat *ngIf="userId" [currentUserId]="userId"></app-chat>
      <div *ngIf="!userId" class="loading-state">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-wrapper { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .header-icon { font-size: 2rem; }
    .page-title { font-size: 1.6rem; font-weight: 800; margin: 0;
      background: linear-gradient(135deg, #fff 0%, #a7f3d0 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .page-subtitle { margin: 0.15rem 0 0; color: rgba(255,255,255,0.55); font-size: 0.875rem; }
    .loading-state { display: flex; justify-content: center; padding: 4rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class MonitorChatComponent implements OnInit {
  userId: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => { this.userId = profile.userId; },
      error: () => {}
    });
  }
}
