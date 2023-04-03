import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { delay, map, Observable, filter, switchMap, of } from 'rxjs';
import IUser from '../models/user.model';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userCollection: AngularFirestoreCollection<IUser>;
  isAuthenticate$: Observable<boolean>;
  public isAuthenticateWithDelay$: Observable<boolean>;
  private reDirect = false;

  constructor(private auth: AngularFireAuth, private db: AngularFirestore,
    private router : Router, private aRoute: ActivatedRoute) { 
    this.userCollection = db.collection('users');
    this.isAuthenticate$ = auth.user.pipe(
      map(user => !!user)
    )
    this.isAuthenticateWithDelay$ = this.isAuthenticate$.pipe(
      delay(1000)
    )

    // to get data in route
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => this.aRoute.firstChild),
      switchMap(route => route?.data ?? of({})) // get the latest observable value after complete old
    ).subscribe(data => {
      this.reDirect = data.authOnly ?? false;
    })

  }

  public async createUser(userData: IUser) {
    // To avoid string | undefined error
    if(!userData.password) { // or simply use 'as string'
      throw new Error('password my be provide');
    }
    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email, userData.password as string
    )

    await this.userCollection.doc(userCred.user?.uid).set({ // update uid from auth to user db instead of auto generated uid
    //await this.userCollection.add({
    //await this.db.collection<IUser>('users').add({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber
    });

    await userCred.user?.updateProfile({
      displayName: userData.name
    })
  }

  async logout(event: Event) {
    event.preventDefault();
    await this.auth.signOut();

    if(this.reDirect) { // Used to avoid display login/register page - check again
      await this.router.navigateByUrl('/');
    } 
  }
}
