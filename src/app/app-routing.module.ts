import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './screens/home/home.component';
import { LoginComponent } from './screens/login/login.component';
import { RegisterComponent } from './screens/register/register.component';
import { TicTacToeGameComponent } from './screens/tic-tac-toe-game/tic-tac-toe-game.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "game/ttt/:id", component: TicTacToeGameComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
