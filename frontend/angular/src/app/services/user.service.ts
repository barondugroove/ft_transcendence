import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, BehaviorSubject } from 'rxjs';

import { CookieService } from './cookie.service';

import { Game } from 'src/app/models/game.model';
import { User } from '../models/user.model';
import { HTTP_MODE, IP_SERVER } from '../../env';

@Injectable({
  providedIn: 'root'
})
export class UserService {

	private userInfoSubject = new BehaviorSubject<User>({} as User);
	userInfo$ = this.userInfoSubject.asObservable();

	constructor(
		private readonly http: HttpClient, 
		private readonly cookieService: CookieService,
		private readonly router: Router
	) {}

	public cleanUserAvatar(ft_auth: boolean, avatar: string): string {
		if (avatar === undefined || ft_auth === undefined) {
			return '';
		}
		let avatarUrl: string = '';
		if (ft_auth === false) {
			avatarUrl = HTTP_MODE + IP_SERVER.slice(0) + avatar;
		}
		else {
			avatar = avatar.slice(10);
			avatarUrl = avatar;
			avatarUrl = 'https://' + avatarUrl;
		}
		console.log('avatar url before replace in cleanuseravatar is ', avatarUrl)
		avatarUrl = avatarUrl.replace('/api/media', '');
		console.log('avatar url after replace in cleanuseravatar is ', avatarUrl)
		return avatarUrl;
	}


	public nextUserInfo(user: User): void {
		this.userInfoSubject.next(user);
	}

	public getUserInfos(): Observable<User> {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
		
		return this.http.get<User>(HTTP_MODE + IP_SERVER + '/users/getUserInfo', { headers });
	}

	public getUserInfosById(id: number): Observable<User> {
		if (id === undefined || Number.isInteger(id) === false) {
			id = 900000;
		}
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		let params = new HttpParams().set('id', id.toString());

		return this.http.get<User>(HTTP_MODE + IP_SERVER + '/users/getUserInfoById', { headers, params });
	}

	public getUserMatches(id: number): Observable<Game[]> {
		if (id === undefined || Number.isInteger(id) === false) {
			id = 900000;
		}
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		let params = new HttpParams().set('id', id.toString());

		return this.http.get<Game[]>(HTTP_MODE + IP_SERVER + '/users/getUserMatches/', { headers, params });
	}

	public getUserAvatar(): Observable<any> {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		return this.http.get<any>(HTTP_MODE + IP_SERVER + '/users/getUserAvatar/', { headers });
	}

	public updateUserInfos(data: any): Observable<any> {
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

		return this.http.post(HTTP_MODE + IP_SERVER + '/users/updateCredential/', data, { headers });
	}

	public updateProfilePicture(data: any): void {
		if (data === null || data === undefined) {
			return;
		}
		const token = this.cookieService.getCookie('authToken');
		const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
		this.http.post(HTTP_MODE + IP_SERVER + '/users/uploadAvatar/', data, { headers }).subscribe({
			next: () => {
				this.getUserInfos();
			},
			error: (error) => {
				console.error('User information update failed:', error);
			},
		});
	}
}