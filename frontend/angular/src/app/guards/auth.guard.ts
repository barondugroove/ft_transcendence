import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { CookieService } from '../services/cookie.service';



export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any => {
	const authService = inject(AuthService);
	const router = inject(Router);
	const cookieService = inject(CookieService);

	if (cookieService.getCookie('authToken') === '') {
		return false
	}
	else {
		return true;
	}
}