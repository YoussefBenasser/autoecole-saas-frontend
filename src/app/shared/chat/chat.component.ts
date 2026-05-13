import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { interval, Subscription } from 'rxjs';

interface Contact {
  userId: string;
  name: string;
  email: string;
  role: string;
  lastMessage?: string;
  lastAt?: string;
  unread: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  read: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <!-- Contacts Panel -->
      <div class="contacts-panel" [class.hidden-mobile]="activeContact">
        <div class="contacts-header">
          <div class="header-icon">💬</div>
          <div>
            <h2 class="contacts-title">Messages</h2>
            <p class="contacts-sub">{{ contacts.length }} conversation(s)</p>
          </div>
        </div>

        <div *ngIf="isLoadingContacts" class="loading-center">
          <div class="spinner"></div>
        </div>

        <div *ngIf="!isLoadingContacts && contacts.length === 0" class="empty-contacts">
          <div class="empty-icon">💬</div>
          <p>Aucune conversation</p>
          <span>Démarrez une nouvelle conversation ci-dessous</span>
        </div>

        <div class="contact-list">
          <div
            *ngFor="let c of contacts"
            class="contact-item"
            [class.active]="activeContact?.userId === c.userId"
            (click)="openConversation(c)"
          >
            <div class="contact-avatar" [style.background]="getAvatarColor(c.name)">
              {{ getInitials(c.name) }}
            </div>
            <div class="contact-info">
              <div class="contact-name-row">
                <span class="contact-name">{{ c.name }}</span>
                <span *ngIf="c.unread > 0" class="unread-badge">{{ c.unread }}</span>
              </div>
              <span class="contact-role">{{ getRoleLabel(c.role) }}</span>
              <span class="contact-last" *ngIf="c.lastMessage">{{ c.lastMessage | slice:0:40 }}{{ c.lastMessage.length > 40 ? '...' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- New message -->
        <div class="new-message-section">
          <div class="new-msg-title">Nouveau message</div>
          <input
            type="email"
            [(ngModel)]="newContactEmail"
            placeholder="Email du destinataire..."
            class="new-contact-input"
            (keyup.enter)="startNewConversation()"
          />
          <button class="btn-start" (click)="startNewConversation()" [disabled]="!newContactEmail">
            Démarrer
          </button>
        </div>
      </div>

      <!-- Conversation Panel -->
      <div class="conversation-panel" [class.hidden-mobile]="!activeContact">
        <div *ngIf="!activeContact" class="no-chat-selected">
          <div class="no-chat-icon">💬</div>
          <h3>Sélectionnez une conversation</h3>
          <p>Choisissez un contact à gauche pour commencer</p>
        </div>

        <ng-container *ngIf="activeContact">
          <!-- Header -->
          <div class="conv-header">
            <button class="back-btn" (click)="activeContact = null">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="conv-avatar" [style.background]="getAvatarColor(activeContact.name)">
              {{ getInitials(activeContact.name) }}
            </div>
            <div class="conv-info">
              <div class="conv-name">{{ activeContact.name }}</div>
              <div class="conv-role">{{ getRoleLabel(activeContact.role) }}</div>
            </div>
          </div>

          <!-- Messages -->
          <div class="messages-area" #messagesArea>
            <div *ngIf="isLoadingMessages" class="loading-center">
              <div class="spinner"></div>
            </div>
            <div *ngIf="!isLoadingMessages && messages.length === 0" class="no-messages">
              Aucun message. Envoyez le premier message !
            </div>
            <div *ngFor="let msg of messages" class="message-wrapper" [class.sent]="msg.senderId === currentUserId">
              <div class="message-bubble" [class.bubble-sent]="msg.senderId === currentUserId" [class.bubble-received]="msg.senderId !== currentUserId">
                {{ msg.content }}
                <span class="msg-time">{{ formatTime(msg.sentAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="input-area">
            <textarea
              [(ngModel)]="newMessage"
              placeholder="Tapez votre message..."
              class="msg-input"
              (keydown.enter)="$event.preventDefault(); sendMessage()"
              rows="1"
            ></textarea>
            <button class="send-btn" (click)="sendMessage()" [disabled]="!newMessage.trim() || isSending">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .chat-container {
      display: grid;
      grid-template-columns: 320px 1fr;
      height: calc(100vh - 120px);
      min-height: 500px;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      overflow: hidden;
    }

    /* Contacts Panel */
    .contacts-panel {
      border-right: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: rgba(255,255,255,0.02);
    }

    .contacts-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .header-icon {
      font-size: 1.5rem;
    }

    .contacts-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }

    .contacts-sub {
      font-size: 0.78rem;
      color: rgba(255,255,255,0.45);
      margin: 0;
    }

    .contact-list {
      flex: 1;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 0.9rem 1.25rem;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    .contact-item:hover { background: rgba(255,255,255,0.05); }
    .contact-item.active { background: rgba(79,70,229,0.12); border-left: 3px solid #6366f1; }

    .contact-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .contact-info { flex: 1; min-width: 0; }

    .contact-name-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .contact-name {
      font-weight: 600;
      color: #fff;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .unread-badge {
      background: #6366f1;
      color: white;
      border-radius: 10px;
      padding: 0.1rem 0.5rem;
      font-size: 0.72rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .contact-role {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.4);
      display: block;
    }

    .contact-last {
      font-size: 0.78rem;
      color: rgba(255,255,255,0.5);
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .new-message-section {
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .new-msg-title {
      font-size: 0.78rem;
      font-weight: 600;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .new-contact-input {
      padding: 0.6rem 0.9rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      color: white;
      font-size: 0.85rem;
      outline: none;
      transition: border 0.2s;
      font-family: inherit;
    }

    .new-contact-input:focus { border-color: rgba(99,102,241,0.5); }
    .new-contact-input::placeholder { color: rgba(255,255,255,0.3); }

    .btn-start {
      padding: 0.6rem;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .btn-start:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Conversation Panel */
    .conversation-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .no-chat-selected {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: rgba(255,255,255,0.4);
    }

    .no-chat-icon { font-size: 3rem; }
    .no-chat-selected h3 { color: rgba(255,255,255,0.6); margin: 0; font-size: 1.1rem; }
    .no-chat-selected p { margin: 0; font-size: 0.875rem; }

    .conv-header {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.02);
    }

    .back-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      padding: 0.3rem;
      border-radius: 8px;
      transition: all 0.15s;
    }

    .back-btn:hover { background: rgba(255,255,255,0.08); color: white; }

    .conv-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .conv-name { font-weight: 700; color: white; font-size: 0.95rem; }
    .conv-role { font-size: 0.78rem; color: rgba(255,255,255,0.45); }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }

    .message-wrapper {
      display: flex;
      &.sent { justify-content: flex-end; }
    }

    .message-bubble {
      max-width: 70%;
      padding: 0.65rem 1rem;
      border-radius: 16px;
      font-size: 0.9rem;
      line-height: 1.5;
      position: relative;
    }

    .bubble-sent {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .bubble-received {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.9);
      border: 1px solid rgba(255,255,255,0.1);
      border-bottom-left-radius: 4px;
    }

    .msg-time {
      display: block;
      font-size: 0.68rem;
      margin-top: 0.25rem;
      opacity: 0.65;
      text-align: right;
    }

    .input-area {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.02);
    }

    .msg-input {
      flex: 1;
      padding: 0.75rem 1rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      color: white;
      font-size: 0.9rem;
      outline: none;
      resize: none;
      font-family: inherit;
      line-height: 1.5;
      transition: border 0.2s;
    }

    .msg-input:focus { border-color: rgba(99,102,241,0.5); }
    .msg-input::placeholder { color: rgba(255,255,255,0.3); }

    .send-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .loading-center {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-contacts, .no-messages {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      color: rgba(255,255,255,0.4);
      text-align: center;
      font-size: 0.85rem;
      gap: 0.5rem;
    }

    .empty-icon { font-size: 2rem; }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .chat-container { grid-template-columns: 1fr; }
      .hidden-mobile { display: none; }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() currentUserId!: string;
  @ViewChild('messagesArea') messagesArea!: ElementRef;

  contacts: Contact[] = [];
  activeContact: Contact | null = null;
  messages: Message[] = [];

  isLoadingContacts = false;
  isLoadingMessages = false;
  isSending = false;

  newMessage = '';
  newContactEmail = '';

  private pollSub?: Subscription;
  private shouldScrollToBottom = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadContacts();
    // Poll for new messages every 5 seconds
    this.pollSub = interval(5000).subscribe(() => {
      this.loadContacts();
      if (this.activeContact) {
        this.loadMessages(this.activeContact.userId, false);
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesArea) {
      const el = this.messagesArea.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollToBottom = false;
    }
  }

  loadContacts(): void {
    this.isLoadingContacts = true;
    this.http.get<Contact[]>(`${environment.apiUrl}/messages/contacts`).subscribe({
      next: (data) => {
        this.contacts = data;
        this.isLoadingContacts = false;
      },
      error: () => { this.isLoadingContacts = false; }
    });
  }

  openConversation(contact: Contact): void {
    this.activeContact = contact;
    this.loadMessages(contact.userId, true);
  }

  loadMessages(otherUserId: string, scroll = false): void {
    if (scroll) this.isLoadingMessages = true;
    this.http.get<Message[]>(`${environment.apiUrl}/messages/conversation?with=${otherUserId}`).subscribe({
      next: (data) => {
        this.messages = data;
        this.isLoadingMessages = false;
        if (scroll) {
          this.shouldScrollToBottom = true;
          // Update unread count in contact
          if (this.activeContact) {
            this.activeContact.unread = 0;
          }
        }
      },
      error: () => { this.isLoadingMessages = false; }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.activeContact || this.isSending) return;
    this.isSending = true;
    const content = this.newMessage.trim();
    this.newMessage = '';

    this.http.post<Message>(`${environment.apiUrl}/messages`, {
      receiverId: this.activeContact.userId,
      content
    }).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.isSending = false;
        this.shouldScrollToBottom = true;
      },
      error: () => { this.isSending = false; this.newMessage = content; }
    });
  }

  startNewConversation(): void {
    const email = this.newContactEmail.trim();
    if (!email) return;
    
    // First check if the contact is already in our list
    const existingContact = this.contacts.find(c => c.email === email);
    if (existingContact) {
      this.openConversation(existingContact);
      this.newContactEmail = '';
      return;
    }

    // Otherwise, try to find the user by email
    this.http.get<Contact>(`${environment.apiUrl}/messages/find-user?email=${encodeURIComponent(email)}`).subscribe({
      next: (user) => {
        // Add to contacts and open conversation
        this.contacts.unshift(user);
        this.openConversation(user);
        this.newContactEmail = '';
      },
      error: () => {
        alert('Utilisateur non trouvé avec cet email. Veuillez vérifier l\'adresse.');
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #4f46e5)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
      'linear-gradient(135deg, #ef4444, #dc2626)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'STUDENT': 'Élève',
      'MONITOR': 'Moniteur',
      'ADMIN': 'Admin École',
      'TENANT_ADMIN': 'Admin École',
      'SUPER_ADMIN': 'Super Admin',
    };
    return labels[role] || role;
  }

  formatTime(ts: string): string {
    if (!ts) return '';
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' ' +
           d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
