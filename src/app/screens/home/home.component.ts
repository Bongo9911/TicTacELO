import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Firestore, getFirestore, collection, query, where, getDocs, getDoc, doc, addDoc, setDoc, onSnapshot } from "firebase/firestore";
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

  yourgames: Game[] = [];
  allgames: Game[] = [];

  searching: boolean = false;

  isAnonymous: boolean = true;

  constructor(private router: Router, private authService: AuthService) {
    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
    let auth = getAuth(this.firebaseApp);

    this.sub = router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authSubscription = onAuthStateChanged(auth, user => {
          if (user) {
            this.updateData();
            this.isAnonymous = this.authService.isGuest();
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
    onSnapshot(query(collection(this.db, "Games"), where("completed", "==", false), where("players", "array-contains", this.authService.displayName())), docs => {
      this.yourgames = [];
      docs.forEach(doc => {
        let data = doc.data() as GameFirestore
        this.yourgames.push({
          board: this.arrayToMatrix(data.board),
          completed: data.completed,
          gameId: data.gameId,
          players: data.players,
          turn: data.turn,
          winner: data.winner
        })
      })
    })
    onSnapshot(query(collection(this.db, "Games"), where("completed", "==", false)), docs => {
      this.allgames = [];
      docs.forEach(doc => {
        let data = doc.data() as GameFirestore
        this.allgames.push({
          board: this.arrayToMatrix(data.board),
          completed: data.completed,
          gameId: data.gameId,
          players: data.players,
          turn: data.turn,
          winner: data.winner
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

  findMatch() {
    this.searching = true;
    addDoc(collection(this.db, "matchmaking"), {user: this.authService.displayName(), code: "", found: false}).then(matchdoc => {
      const unsub = onSnapshot(doc(this.db, "matchmaking", matchdoc.id), (updatedoc) => {
        let data = updatedoc.data() as Match;
        console.log(updatedoc.data());
        if(data.found) {
          unsub();
          this.router.navigate(["/game/ttt/" + data.code]);
        }
    });
    })
  }
}

interface Game {
  board: string[][],
  completed: boolean,
  gameId: string,
  players: string[],
  turn: string,
  winner: string
}

interface GameFirestore {
  board: string[],
  completed: boolean,
  gameId: string,
  players: string[],
  turn: string,
  winner: string
}

interface Match {
  user: string,
  code: "",
  found: boolean
}