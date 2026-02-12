import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  private username!: string;

  connect(username: string) {
    this.username = username;
    this.socket = io('http://localhost:3000', {
       query: { userName: username }
});

  }

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }

  onMessage(): Observable<any> {
    return new Observable(obs => {
      this.socket.on('message-broadcast', data => obs.next(data));
    });
  }

  onUserList(): Observable<string[]> {
    return new Observable(obs => {
      this.socket.on('user-list', users => obs.next(users));
    });
  }

  onUserJoined(): Observable<string> {
    return new Observable(obs => {
      this.socket.on('user-joined', user => obs.next(user));
    });
  }

  onUserLeft(): Observable<string> {
    return new Observable(obs => {
      this.socket.on('user-left', user => obs.next(user));
    });
  }

  getUsername() {
    return this.username;
  }
}
