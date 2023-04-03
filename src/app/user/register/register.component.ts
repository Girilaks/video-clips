import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import IUser from 'src/app/models/user.model';
import { RegisterValidator } from '../validators/register-validator';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  showAlert = false;
  alertMsg = "Please wait! your account is beiing created";
  alertColor = "blue";
  inSubmission = false;

  constructor(private auth: AuthService, private emailTaken: EmailTaken) {
  }

  // Form control - Start
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  email = new FormControl('', [
    Validators.required,
    Validators.email
  ], [ this.emailTaken.validate]);
  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18),
    Validators.max(120)
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  ]);
  confirm_password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  ]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13)
  ]);

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber,
  }, [RegisterValidator.match('password', 'confirm_password')]);

   // Form control - End

  async register() {
    this.showAlert = true;
    this.alertMsg = "Please wait! your account is beiing created";
    this.alertColor = "blue";
    this.inSubmission = true;

    // const { email, password } = this.registerForm.value;
    try {
      // createUserWithEmailAndPassword is promise return type so async, await is used here
    // const userCred = await this.auth.createUserWithEmailAndPassword(
    //   email as string, password as string
    // )

      this.auth.createUser(this.registerForm.value as IUser);
    }
    catch(error) {
      console.error(error);
      
      this.alertMsg = 'Something went wrong'
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
      
    }
    this.alertMsg = 'Success!Account created'
    this.alertColor = 'green';
  }
}
