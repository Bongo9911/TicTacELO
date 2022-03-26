import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Firestore, getFirestore, collection, query, where, getDocs, getDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { initializeApp, FirebaseApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { FirebaseStorage, getStorage, ref, getDownloadURL } from "firebase/storage";
import { SubscriptionLike } from 'rxjs';
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-tic-tac-toe-game',
  templateUrl: './tic-tac-toe-game.component.html',
  styleUrls: ['./tic-tac-toe-game.component.scss']
})
export class TicTacToeGameComponent implements OnInit {

  gameData: Game;

  size: number = 3;

  playerLetter: string = 'X';

  gameId: string = "";

  firebaseApp: FirebaseApp;
  db: Firestore;
  storage: FirebaseStorage;

  authSubscription?: Unsubscribe;
  sub: SubscriptionLike;

  playerElos: number[] = [1000, 1000];

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.route.params.subscribe(params => {
      this.gameId = params.id;
    });

    console.log(this.gameId);

    this.gameData = {
      board: [],
      gameId: this.gameId,
      players: ["", ""],
      turn: "X",
      completed: false,
      winner: "",
    }

    let emptyarray: string[] = [];
    for (let i = 0; i < this.size; ++i) {
      emptyarray.push("");
    }
    for (let i = 0; i < this.size; ++i) {
      this.gameData.board.push([...emptyarray]);
    }

    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
    this.storage = getStorage(this.firebaseApp)
    let auth = getAuth(this.firebaseApp);
    this.sub = router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authSubscription = onAuthStateChanged(auth, user => {
          if (user) {
            getDoc(doc(this.db, 'Games', this.gameId)).then(gamedoc => {
              let data = gamedoc.data() as GameFirestore
              this.gameData.board = this.arrayToMatrix(data.board);
                this.gameData.completed = data.completed
                this.gameData.players = data.players
                this.gameData.turn = data.turn
                this.gameData.winner = data.winner

                this.playerLetter = this.gameData.players[0] === this.authService.displayName() ? "X" : "O";
                console.log(this.playerLetter);
                console.log(this.gameData)

                getDocs(query(collection(this.db, "Users"), where("username", "==", this.gameData.players[0]))).then(playerDocs => {
                  if(playerDocs.docs.length) {
                    let data = playerDocs.docs[0].data() as {elo: number};
                    this.playerElos[0] = data.elo
                    onSnapshot(doc(this.db, "Users", playerDocs.docs[0].id), player => {
                      let data = player.data() as {elo: number};
                      this.playerElos[0] = data.elo
                    })
                  }
                })

                getDocs(query(collection(this.db, "Users"), where("username", "==", this.gameData.players[1]))).then(playerDocs => {
                  if(playerDocs.docs.length) {
                    let data = playerDocs.docs[0].data() as {elo: number};
                    this.playerElos[1] = data.elo
                    onSnapshot(doc(this.db, "Users", playerDocs.docs[0].id), player => {
                      let data = player.data() as {elo: number};
                      this.playerElos[1] = data.elo
                    })
                  }
                })
            })
            onSnapshot(doc(this.db, 'Games', this.gameId), (gamedoc) => {
              if(gamedoc.exists()) {
                let data = gamedoc.data() as GameFirestore

                this.gameData.board = this.arrayToMatrix(data.board);
                this.gameData.completed = data.completed
                this.gameData.turn = data.turn
                this.gameData.winner = data.winner

                console.log(data.turn);

                this.updateData();
                console.log(gamedoc.data());
              }
              else {
                this.router.navigate([""]);
              }
            });
          }
        });
      }
    });

    // this.gameBoard.spaces[1][1] = "X";
    // this.gameBoard.spaces[0][0] = "O";
  }

  ngOnInit(): void {
  }

  updateData() {

  }

  setSpace(x: number, y: number) {
    if (this.gameData.board[y][x] === "" && this.gameData.turn === this.playerLetter && !this.gameData.completed) {
      this.gameData.board[y][x] = this.playerLetter;

      for (let i = 0; i < this.size; ++i) {
        if (this.gameData.board[i].every(s => s === this.playerLetter)) {
          console.log('test');
          this.gameData.completed = true;
          this.gameData.winner = this.playerLetter;
        }
      }

      if (!this.gameData.completed) {
        for (let i = 0; i < this.size; ++i) {
          let won: boolean = true;
          for (let j = 0; j < this.size; ++j) {
            if (this.gameData.board[j][i] !== this.playerLetter) {
              won = false;
              break;
            }
          }
          if (won) {
            this.gameData.completed = true;
            this.gameData.winner = this.playerLetter;
            break;
          }
        }
      }

      if (!this.gameData.completed) {
        let won: boolean = true;
        for(let i = 0; i < this.size; ++i) {
          if(this.gameData.board[i][i] !== this.playerLetter) {
            won = false;
            break;
          }
        }
        if(won) {
          this.gameData.completed = true;
          this.gameData.winner = this.playerLetter;
        }
      }

      if (!this.gameData.completed) {
        let won: boolean = true;
        for(let i = 0; i < this.size; ++i) {
          if(this.gameData.board[this.size - i - 1][i] !== this.playerLetter) {
            won = false;
            break;
          }
        }
        if(won) {
          this.gameData.completed = true;
          this.gameData.winner = this.playerLetter;
        }
      }

      if(!this.gameData.completed) {
        let draw: boolean = true;
        for(let i = 0; i < this.gameData.board.length; ++i) {
          if(!this.gameData.board[i].every(s => s !== "")) {
            draw = false;
            break;
          }
        }
        if(draw) {
          this.gameData.completed = true;
          this.gameData.winner = "D"
        }
      }

      if(this.gameData.completed) {
        let pOneExp = 1 / (1 + Math.pow(10, ((this.playerElos[1] - this.playerElos[0])/40)))
        let pTwoExp = 1 / (1 + Math.pow(10, ((this.playerElos[0] - this.playerElos[1])/40)))
        let pOneNew = Math.round(this.playerElos[0] + 32 * ((this.gameData.winner === 'X' ? 1 : this.gameData.winner === 'O' ? 0 : 0.5) - pOneExp));
        let pTwoNew = Math.round(this.playerElos[1] + 32 * ((this.gameData.winner === 'O' ? 1 : this.gameData.winner === 'X' ? 0 : 0.5) - pTwoExp));
      
        getDocs(query(collection(this.db, "Users"), where("username", "==", this.gameData.players[0]))).then(playerDocs => {
          if(playerDocs.docs.length) {
            setDoc(doc(this.db, "Users", playerDocs.docs[0].id), {elo: pOneNew}, {merge: true})
          }
        })

        getDocs(query(collection(this.db, "Users"), where("username", "==", this.gameData.players[1]))).then(playerDocs => {
          if(playerDocs.docs.length) {
            setDoc(doc(this.db, "Users", playerDocs.docs[0].id), {elo: pTwoNew}, {merge: true})

          }
        })
        console.log(pOneNew);
        console.log(pTwoNew);
      }

      setDoc(doc(this.db, "Games", this.gameId), {
        board: this.matrixToArray(this.gameData.board),
        completed: this.gameData.completed,
        gameId: this.gameId,
        players: this.gameData.players,
        turn: this.playerLetter === 'X' ? 'O' : 'X',
        winner: this.gameData.winner
      })


      //this.playerLetter = this.playerLetter === 'X' ? 'O' : 'X';

    }
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

  matrixToArray(matrix: string[][]): string[] {
    let arr: string[] = [];
    for(let i = 0; i < matrix.length; ++i) {
      arr.push(...matrix[i]);
    }
    return arr;
  }
}

interface Board {
  spaces: string[][],
  ended: boolean,
  winner: string
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