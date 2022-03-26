import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tic-tac-toe-game',
  templateUrl: './tic-tac-toe-game.component.html',
  styleUrls: ['./tic-tac-toe-game.component.scss']
})
export class TicTacToeGameComponent implements OnInit {

  gameBoard: Board;

  size: number = 3;

  playerLetter: string = 'X';
  turn: string = 'X';

  constructor() {

    this.gameBoard = {
      spaces: [],
      ended: false,
      winner: ""
    }

    let emptyarray: string[] = [];
    for (let i = 0; i < this.size; ++i) {
      emptyarray.push("");
    }
    for (let i = 0; i < this.size; ++i) {
      this.gameBoard.spaces.push([...emptyarray]);
    }

    // this.gameBoard.spaces[1][1] = "X";
    // this.gameBoard.spaces[0][0] = "O";
  }

  ngOnInit(): void {
  }

  setSpace(x: number, y: number) {
    if (this.gameBoard.spaces[y][x] === "" && this.turn === this.playerLetter && !this.gameBoard.ended) {
      this.gameBoard.spaces[y][x] = this.playerLetter;
      this.turn = this.playerLetter === 'X' ? 'O' : 'X';

      for (let i = 0; i < this.size; ++i) {
        if (this.gameBoard.spaces[i].every(s => s === this.playerLetter)) {
          console.log('test');
          this.gameBoard.ended = true;
          this.gameBoard.winner = this.playerLetter;
        }
      }

      if (!this.gameBoard.ended) {
        for (let i = 0; i < this.size; ++i) {
          let won: boolean = true;
          for (let j = 0; j < this.size; ++j) {
            if (this.gameBoard.spaces[j][i] !== this.playerLetter) {
              won = false;
              break;
            }
          }
          if (won) {
            this.gameBoard.ended = true;
            this.gameBoard.winner = this.playerLetter;
            break;
          }
        }
      }

      if (!this.gameBoard.ended) {
        let won: boolean = true;
        for(let i = 0; i < this.size; ++i) {
          if(this.gameBoard.spaces[i][i] !== this.playerLetter) {
            won = false;
            break;
          }
        }
        if(won) {
          this.gameBoard.ended = true;
          this.gameBoard.winner = this.playerLetter;
        }
      }

      if (!this.gameBoard.ended) {
        let won: boolean = true;
        for(let i = 0; i < this.size; ++i) {
          if(this.gameBoard.spaces[this.size - i - 1][i] !== this.playerLetter) {
            won = false;
            break;
          }
        }
        if(won) {
          this.gameBoard.ended = true;
          this.gameBoard.winner = this.playerLetter;
        }
      }


      this.playerLetter = this.playerLetter === 'X' ? 'O' : 'X';

    }
  }
}

interface Board {
  spaces: string[][],
  ended: boolean,
  winner: string
}
