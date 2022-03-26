import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Firestore, getFirestore, collection, query, where, getDocs, getDoc, doc, addDoc } from "firebase/firestore";
import { FirebaseApp, initializeApp } from '@firebase/app';
import { firebaseConfig } from 'src/app/credentials';
import { getAuth, onAuthStateChanged, Unsubscribe } from '@firebase/auth';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  firebaseApp: FirebaseApp;
  db: Firestore;

  authSubscription?: Unsubscribe;
  sub: Subscription;

  games: Game[] = [];

  constructor(private router: Router, private authService: AuthService) {
    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
    let auth = getAuth(this.firebaseApp);

    this.sub = router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authSubscription = onAuthStateChanged(auth, user => {
          if (user) {
            this.updateData();
          }
        });
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription();
    };
    this.sub.unsubscribe();
  }

  updateData() {
    getDocs(collection(this.db, "Games")).then(docs => {
      docs.forEach(doc => {
        let data = doc.data() as GameFirestore
        this.games.push({
          board: this.arrayToMatrix(data.board),
          completed: data.completed,
          gameId: data.gameId,
          players: data.players
        })
      })
    })
  }

  arrayToMatrix(arr: string[]): string[][] {
    let size = Math.sqrt(arr.length);
    let matrix: string[][] = [];
    for(let i = 0; i < arr.length; ++i) {
      if(i % size === 0) {
        matrix.push([]);
      }
      matrix[Math.floor(i / size)].push(arr[i]);
    }

    return matrix;
  }
}

interface Game {
  board: string[][],
  completed: boolean,
  gameId: string,
  players: string[],
}

interface GameFirestore {
  board: string[],
  completed: boolean,
  gameId: string,
  players: string[],
}