import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { getAuth, onAuthStateChanged, Unsubscribe } from '@firebase/auth';
import { AuthService } from 'src/app/auth/auth.service';
import { Firestore, getFirestore, collection, query, where, getDocs, getDoc, doc, addDoc } from "firebase/firestore";
import { FirebaseApp, initializeApp } from '@firebase/app';
import { firebaseConfig } from 'src/app/credentials';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  email = new FormControl('', [Validators.required, Validators.email]);
  name = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  confirm = new FormControl('', [Validators.required]);

  firebaseApp: FirebaseApp;
  db: Firestore;

  constructor(private authService: AuthService) { 
    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
  }

  ngOnInit(): void {
  }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  register() {
    console.log("WOW")
    if (this.email.valid && this.name.valid && this.password.valid && this.confirm.valid &&
      this.password.value === this.confirm.value) {
      this.authService.register(this.email.value, this.password.value, this.name.value).then(() => { //Fulfilled
        addDoc(collection(this.db, "Users"), {email: this.email.value, username: this.name.value});
      },
      () => { //Rejected

      })
    }
  }

}
