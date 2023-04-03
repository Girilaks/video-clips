import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/compat/auth";


@Injectable({
    providedIn: 'root'
})
export class EmailTaken implements AsyncValidator {

    constructor(private afAuth: AngularFireAuth){}

    // validate(control: AbstractControl): Promise<ValidationErrors | null> {
    // Validate func convert into error function
    validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
        return this.afAuth.fetchSignInMethodsForEmail(control.value).then(
            response => response.length ? { emailTaken : true } : null
        )
    }
}
