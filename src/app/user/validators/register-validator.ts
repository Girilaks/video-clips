import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";


// Below function is similar to Validators.required

// export class RegisterValidator {
//     static match(group: AbstractControl): ValidationErrors | null {
//         const passwordCtrl = group.get('password');
//         const passwordMatchCtrl = group.get('confirm_password');

//         if (!passwordCtrl || !passwordMatchCtrl) {
//             return { CtrlValueNotFound: true };
//         }

//         const error = passwordCtrl.value === passwordMatchCtrl.value ? null :
//             { noMatch: true }

//         return error;
//     }
// }

// Using factory function for customization option - Using ValidatorFn
// outer function - accept the input value
// inner function - for access the information
// Below function is similar to Validators.min(value) 

export class RegisterValidator {
    static match(controlName: string, matchControlName: string) : ValidatorFn {
        return (group: AbstractControl) : ValidationErrors | null  => {
            const passwordCtrl = group.get(controlName);
            const passwordMatchCtrl = group.get(matchControlName);
    
            if (!passwordCtrl || !passwordMatchCtrl) {
                return { CtrlValueNotFound: true };
            }
    
            const error = passwordCtrl.value === passwordMatchCtrl.value ?
                null : { noMatch: true };

            passwordMatchCtrl.setErrors(error);
            return error;
        }
       
    }
}
