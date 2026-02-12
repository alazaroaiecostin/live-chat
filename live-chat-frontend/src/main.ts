import { bootstrapApplication } from '@angular/platform-browser';
import { ChatComponent } from './app/chat/chat.component';

bootstrapApplication(ChatComponent, {
  
  providers: [],
}).catch(err => console.error(err));
