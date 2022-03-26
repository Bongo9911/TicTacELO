import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { Firestore, getFirestore, collection, query, where, getDocs, getDoc, doc, addDoc } from "firebase/firestore";
import { FirebaseApp, initializeApp } from '@firebase/app';
import { firebaseConfig } from 'src/app/credentials';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  name = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);

  firebaseApp: FirebaseApp;
  db: Firestore;

  constructor(private authService: AuthService) {
    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
  }

  ngOnInit(): void {
  }

  async login() {
    let email = this.name.value;
    if (email.indexOf("@") === -1) {
      let docs = await getDocs(query(collection(this.db, "Users"), where("username", "==", email)));
      if (docs.docs.length) {
        let userdata = docs.docs[0].data() as user;
        email = userdata.email;
      }
    }

    this.authService.login(email, this.password.value);
  }
}

interface user {
  email: string,
  username: string
}
