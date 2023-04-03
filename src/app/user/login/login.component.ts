import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  showAlert = false;
  alertMsg = "Please wait! We are logging in";
  alertColor = "blue";
  inSubmission = false;

  credentials = {
    email: '',
    password: ''
  }

  constructor(private auth: AngularFireAuth) {

  }

  async login() {
    this.showAlert = true;
    this.alertMsg = "Please wait! We are logging in";
    this.alertColor = "blue";
    this.inSubmission = true;
    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email, this.credentials.password
      )
    }
    catch (err) {
      this.alertMsg = "Error occured";
      this.alertColor = "red";
      this.inSubmission = false;
      return;
    }
    this.alertMsg = "Success";
    this.alertColor = "green";
  }
}
