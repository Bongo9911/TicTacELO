import { Injectable, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import "firebase/compat/auth";
import {
	getAuth, onAuthStateChanged, Auth, User, setPersistence, browserLocalPersistence,
	browserSessionPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
	sendEmailVerification, sendPasswordResetEmail, updatePassword, updateEmail, signOut, Unsubscribe,
	signInAnonymously
} from "firebase/auth";
import { initializeApp, FirebaseApp } from "firebase/app"
import { firebaseConfig } from '../credentials';

@Injectable({
	providedIn: 'root'
})
export class AuthService implements OnDestroy {
	user?: User;
	credential: any;
	redirect: string = '';

	durationInSeconds = 2;

	authSubscription: Unsubscribe;
	firebaseApp: FirebaseApp;
	auth: Auth;

	//https://www.techiediaries.com/angular-firebase/angular-9-firebase-authentication-email-google-and-password/

	constructor(public router: Router) {
		this.firebaseApp = initializeApp(firebaseConfig);
		//Checks the local storage to see if the user is logged in, if they are, it grabs their information.
		this.auth = getAuth(this.firebaseApp);
		this.authSubscription = onAuthStateChanged(this.auth, user => {
			if (user) {
				this.user = user;
				localStorage.setItem('user', JSON.stringify(this.user));
			} else {
				this.loginAsGuest();
				//localStorage.setItem('user', null);
			}
		})
	}

	ngOnDestroy(): void {
		this.authSubscription(); //unsubscribe from subscription
	}

	//Logs a user into their account
	async login(email: string, password: string): Promise<any> {
		//Sets the authentication state to persist forever
		return new Promise((resolve, reject) => {
			setPersistence(this.auth, browserLocalPersistence).then(async () => {

				let result = signInWithEmailAndPassword(this.auth, email, password).then(async (res) => {
					await res.user;
					if (res.user) {
						console.log("Logged in!")
						this.user = res.user
						await delay(1);
						this.router.navigate([this.redirect]);
						this.redirect = ''
					}
					resolve(1);
				}).catch(() => {
					console.log("Test")

					resolve(0);
				});
			});
		})
	}

	//Logs a user into a guest account
	async loginAsGuest() {
		//Sets the authentication state to persist until the window is closed
		setPersistence(this.auth, browserSessionPersistence).then(async () => {
			let result = await signInAnonymously(this.auth).then(async (res) => {
				await res.user;
				if (res.user) {
					this.user = res.user;
					localStorage.setItem('user', JSON.stringify(this.user));
					await delay(1);
					//this.router.navigate([this.redirect]);
					//this.redirect = ''
				}
			}).catch(() => {
				localStorage.removeItem('user')
			});
		})
	}

	//Creates a new user with an email and password
	async register(email: string, password: string, displayName: string) {
		let result = await createUserWithEmailAndPassword(this.auth, email, password);

		let user = await this.auth.currentUser;

		if (user) {
			updateProfile(user, {
				displayName: displayName,
				//photoUrl: "url"
			});
			this.sendEmailVerification();
		}
	}

	//Sends an email to user when they sign up to verify their account
	async sendEmailVerification() {
		let user = await this.auth.currentUser;
		if (user) {
			sendEmailVerification(user);
		}
		this.router.navigate(['verify-email']);
	}

	//Sends a reset email to the provided email so they can change their password.
	async sendPasswordResetEmail(passwordResetEmail: string) {
		return await sendPasswordResetEmail(this.auth, passwordResetEmail);
	}

	//Logs a user out of their account
	async logout() {
		localStorage.removeItem('user');

		let authsub = onAuthStateChanged(this.auth, user => {
			if (!user) {
				let url = this.router.url;
				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate([url]));
					authsub();
			}
		});

		//this.router.navigate(['login']);
		signOut(this.auth);
	}

	//Checks if a user is logged in.
	isLoggedIn(): boolean {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user !== null;
	}

	//Checks if a user is a guest account.
	isGuest(): boolean {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.isAnonymous;
	}

	//Returns the diplay name for the user
	displayName(): string {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.displayName;
	}

	//Returns the email for the user
	email(): string {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.email;
	}

	//Returns the UID for the user
	uid(): string {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.uid;
	}

	//Checks if a user is logged in using normal login or a special service like Google.
	isNormalAccount(): boolean {
		let userdata = localStorage.getItem('user');
		const user = userdata ? JSON.parse(userdata) : null;
		return user.providerData[0].providerId !== "google.com";
	}

	setRedirect(page: string): void {
		this.redirect = page;
	}
}

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
