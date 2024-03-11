import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { WebSocketService } from './websocket.service';
import { CookieService } from './cookie.service';

import { Message } from '../models/chat.model';
import { HTTP_MODE, IP_SERVER } from '../../env';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
	private _messages: Message[] = [];
	public messages$ = this.webSocketService.chatMessages$;

	constructor (
		private readonly http: HttpClient,
		private readonly webSocketService: WebSocketService,
		private readonly cookieService: CookieService
	) { }

	// passer en observable sur un tableau de messages, c'est mieux
	ngOnInit(): void {
		this.webSocketService.chatMessages$.subscribe((message: Message[]) => {
			this._messages = message
		});
	}

	connectChat(roomId: string): void {
		this.webSocketService.connectChat(roomId);
	}

	getRoomName(username: string) : any {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		const body = { "username" : username };

		return this.http.post(HTTP_MODE + IP_SERVER + '/chat/getRoomName/', body, { headers });
	}

	sendMessage(message: Message): void {
		this.webSocketService.sendChatMessage(JSON.stringify(message));
	}

	disconnectChat(): void {
		this.webSocketService.disconnectChat();
	}
}
