import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, BehaviorSubject, tap } from 'rxjs';

import { CookieService } from './cookie.service';

import { User } from '../models/user.model';
import { HTTP_MODE, IP_SERVER } from '../../env';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
	private friendsSubject = new BehaviorSubject<User[]>([]);
	friends$ = this.friendsSubject.asObservable();
	private sentRequestsSubject = new BehaviorSubject<any[]>([]);
	sentRequests$ = this.sentRequestsSubject.asObservable();
	private rcvdRequestsSubject = new BehaviorSubject<any[]>([]);
	rcvdRequests$ = this.rcvdRequestsSubject.asObservable();

	constructor(
		private readonly http: HttpClient, 
		private readonly cookieService: CookieService
	) { 
		this.getUserFriends();
		this.getReceivedFriendRequests();
		this.getSentFriendRequests();
	}

	public getUserFriends(): void {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		this.http.get<User[]>(HTTP_MODE + IP_SERVER + '/users/getUserFriends/', { headers }).subscribe(
			(res: User[]) => {
				this.friendsSubject.next(res);
			}
		);
	}
	
	public getReceivedFriendRequests(): void {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		this.http.get<any>(HTTP_MODE + IP_SERVER + '/users/getReceivedRequests/', { headers }).subscribe(
			(res: any) => {
				this.rcvdRequestsSubject.next(res);
			}
		);
	}

	public getSentFriendRequests(): void {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		this.http.get<any>(HTTP_MODE + IP_SERVER + '/users/getSentRequests/', { headers }).subscribe(
			(res: any) => {
				this.sentRequestsSubject.next(res);
			}
		);
	}

	public addFriend(username: string): Observable<any | null> {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		return this.http.post(HTTP_MODE + IP_SERVER + '/users/sendFriendRequest/', username, { headers });
	}

	public acceptFriendRequest(username: string): Observable<any | null> {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		const body = { "username": username };

		return this.http.post(HTTP_MODE + IP_SERVER + '/users/acceptFriendRequest/', body, { headers });
	}


	public blockFriend(user: User): Observable<any | null> {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		return this.http.post(HTTP_MODE + IP_SERVER + '/users/blockUser/', user, { headers });
	}

	public unBlockFriend(user: User): Observable<any | null> {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		return this.http.post(HTTP_MODE + IP_SERVER + '/users/unBlockUser/', user, { headers });
	}

	public getBlockedUsers(): Observable<any | null> {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		return this.http.get(HTTP_MODE + IP_SERVER + '/users/getBlockedUsers/', { headers });
	}


}
