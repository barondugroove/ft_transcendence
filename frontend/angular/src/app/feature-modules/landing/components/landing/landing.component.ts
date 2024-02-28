import { Component, OnInit, booleanAttribute } from '@angular/core';
import { Router } from '@angular/router';

import { map } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../../../services/auth.service';
import { CookieService } from '../../../../services/cookie.service';

import { AuthenticationComponent } from '../authentication/authentication.component';

@Component({
  selector: 'landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})

export class LandingComponent implements OnInit {

	constructor(
		private authService: AuthService,
		private router: Router,
		private modalService: NgbModal,
		private cookieService: CookieService
	) { }

	ngOnInit() {
		if (this.router.url.includes('?token=')) {
			console.log('token:', this.router.url.split('=')[1]);
			this.cookieService.saveCookie('authToken', this.router.url.split('=')[1]);
			this.isAuth();
		}
		else {
			this.isAuth();
		}
	}

	isAuth(): void {
		this.authService.isAuth$.subscribe(isAuth => {
			console.log('isAuth:', isAuth);
		});
		this.authService.isAuth$.subscribe(isAuth => {
			if (isAuth) {
				this.router.navigate(['../home']);
			}
		});
	}

	signup(): void {
		this.modalService.open(AuthenticationComponent, { centered: true });
	}
}