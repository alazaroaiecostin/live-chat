import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../services/socket.service';

interface ChatMessage {
  userName: string;
  message: string;
  timestamp: string;
  own: boolean;
  system?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  @ViewChild('chatBox') chatBox!: ElementRef;

  username = '';
  message = '';
  messages: ChatMessage[] = [];
  users: string[] = [];
  connected = false;
  theme: 'light' | 'dark' = 'light';

  audio = new Audio('/notify.mp3');

  constructor(
    private socket: SocketService,
    private cdr: ChangeDetectorRef
  ) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') this.theme = 'dark';
  }

  connect() {
    if (!this.username.trim()) return;

    this.socket.connect(this.username);
    this.connected = true;

    this.socket.onMessage().subscribe((data: any) => {
      console.log('Mesaj primit:', data);

      this.messages.push({
        userName: data.userName,
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        own: false
      });

      this.audio.play().catch(() => {}); 
      this.scrollBottom();
      this.cdr.detectChanges();
    });

    this.socket.onUserList().subscribe(users => {
      this.users = users;
      this.cdr.detectChanges();
    });

    this.socket.onUserJoined().subscribe(user => {
      this.messages.push({
        userName: 'System',
        message: `${user} joined the chat`,
        timestamp: new Date().toLocaleTimeString(),
        own: false,
        system: true
      });
      this.scrollBottom();
      this.cdr.detectChanges();
    });

    this.socket.onUserLeft().subscribe(user => {
      this.messages.push({
        userName: 'System',
        message: `${user} left the chat`,
        timestamp: new Date().toLocaleTimeString(),
        own: false,
        system: true
      });
      this.scrollBottom();
      this.cdr.detectChanges();
    });
  }

  send() {
    if (!this.message.trim()) return;

    this.messages.push({
      userName: this.username,
      message: this.message,
      timestamp: new Date().toLocaleTimeString(),
      own: true
    });

    this.socket.sendMessage(this.message);
    this.message = '';
    this.scrollBottom();
    this.cdr.detectChanges();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.cdr.detectChanges();
  }

  scrollBottom() {
    setTimeout(() => {
      if (this.chatBox?.nativeElement) {
        this.chatBox.nativeElement.scrollTo({
          top: this.chatBox.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 50);
  }
}
