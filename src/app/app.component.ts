import { Component, OnDestroy } from '@angular/core';
import { FirebaseApp, initializeApp } from '@firebase/app';
import { getAuth, onAuthStateChanged, Unsubscribe } from '@firebase/auth';
import { AuthService } from './auth/auth.service';
import { firebaseConfig } from './credentials';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'TicTacELO';
  authSubscription?: Unsubscribe;

  firebaseApp: FirebaseApp;
  isAnonymous: boolean = true;
  username: string = "";

  constructor(private authService: AuthService) {

    this.firebaseApp = initializeApp(firebaseConfig);
    let auth = getAuth(this.firebaseApp);

    this.authSubscription = onAuthStateChanged(auth, user => {
      if (user) {
        this.isAnonymous = authService.isGuest();
        if(!this.isAnonymous) {
          this.username = authService.displayName();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription();
    }
  }
}
