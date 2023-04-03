import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environments';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

let appInit = false;

firebase.initializeApp(environment.firebase);

firebase.auth().onAuthStateChanged(() => {
  if (!appInit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.error(err));
  }
  appInit = true;
})
