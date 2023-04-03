import { Component } from '@angular/core';
import { ModelService } from '../services/model.service';
import { AuthService } from '../services/auth.service';
//import { AngularFireAuth } from '@angular/fire/compat/auth';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  isAuthenticate = false;
  constructor(public model: ModelService, public auth: AuthService){
    auth.isAuthenticate$.subscribe(status => {
      this.isAuthenticate = status;
    })
  }
  modelOpen($event: Event){
    $event.preventDefault();
    this.model.toggleModel('auth');
  }

  // async logout(event: Event) {
  //   event.preventDefault();
  //   await this.afAuth.signOut();

  //   await this.router.navigateByUrl('/');
  // }
}
