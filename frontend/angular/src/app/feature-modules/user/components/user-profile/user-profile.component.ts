import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';

import { NgbOffcanvas, NgbOffcanvasRef} from '@ng-bootstrap/ng-bootstrap';

import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { LocalDataManagerService } from 'src/app/services/local-data-manager.service';

import { Game } from 'src/app/models/game.model';
import { User } from 'src/app/models/user.model';

import { EditOffcanvasComponent } from '../edit-offcanvas/edit-offcanvas.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserProfileComponent implements OnInit {
	isItMe: boolean = false;
	id: number = 0;
	user: User = {} as User;
	gameList: Game[] | null = null;

	private edit!: NgbOffcanvasRef;

	subscription: Subscription = new Subscription();

	constructor(
		private offcanvas: NgbOffcanvas,
		private userService: UserService,
		private router: Router,
		private route: ActivatedRoute,
		private localDataManager: LocalDataManagerService
	) { }

	ngOnInit(): void {
		this.subscription.add(
			this.router.events.subscribe((event) => {
				if (event instanceof NavigationStart) {
					this.route.url.subscribe({
						next: (url) => {
							this.id = parseInt(url[1].path);
							this.getUserById();
						},
						error: (error) => {
							console.error('Bad Id:', error);
						},
					});
				}
			})
		);

		this.subscription.add(
			this.route.url.subscribe({
				next: (url) => {
					this.id = parseInt(url[1].path);
				},
				error: (error) => {
				console.error('Bad Id:', error);
				},
			})
		);

		this.getUserById();
		
		this.subscription.add(
			this.userService.getUserMatches(this.id).subscribe({
				next: (response: any) => {
					this.gameList = response;
				},
				error: (error) => {
					console.error('Fetch data game list failed:', error);
				},
			})
		)
	}

	private getUserById(): void {
		this.subscription.add(
			this.userService.getUserInfos().subscribe({
				next: (user: User) => {
					if (user.id === this.id) {
						this.isItMe = true;
					}
				},
				error: (error) => {
					console.error('Error:', error);
				},
			})
		)
		this.subscription.add(
			this.userService.getUserInfosById(this.id).subscribe({
				next: (response: any) => {
					if (this.id != 0) {
						this.user = response;
						this.user.avatar = this.userService.cleanUserAvatar(this.user.ft_auth, response.avatar.image);
						this.SetPongoProgressBar();
					}
				},
				error: (error) => {
					console.error('Fetch data user failed.');
					this.router.navigate(['/userNotFound']);
				},
			})
		);
	}

	public editProfile(): void {
		this.edit = this.offcanvas.open(EditOffcanvasComponent, { animation: true, backdrop: true, panelClass: 'edit' });
		this.edit.componentInstance.avatar = this.user?.avatar;
		this.edit.result.then(
			(result) => {
				this.offcanvas.dismiss();
				this.refreshUserInfos();
			},
			(error) => {
				this.offcanvas.dismiss();
			}
		);
	}

	public refreshUserInfos(): void {
		this.subscription.add(	
			this.userService.getUserInfosById(this.user.id).subscribe({
				next: (user) => {
					this.userService.nextUserInfo(user);
					this.localDataManager.saveData('userName', user.username);
					this.localDataManager.saveData('userAvatar', user.avatar);
				},
				error: (error) => {
					this.router.navigate(['/userNotFound']);
					console.error('User information retrieval failed:', error);
				}
			})
		);
	}

	private SetPongoProgressBar(): void {
		let nbrGames: number = 5;

		let pongoBar: HTMLElement | null = document.getElementById('pongoProgress');
		this.user.asWon = false;

		if (this.user.wonMatchesCount as number >= nbrGames)
			this.user.asWon = true;
		else if (pongoBar)
			pongoBar.style.width = (this.user.wonMatchesCount as number / nbrGames) * 100 + "%";
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

}