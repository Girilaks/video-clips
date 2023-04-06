import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { IClip } from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, map } from 'rxjs/operators';
import { of, BehaviorSubject, combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipCollection: AngularFirestoreCollection<IClip>;
  pageClips: IClip[] = [];
  pendingReq = false;

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth,
    private storage: AngularFireStorage) {
    this.clipCollection = db.collection('clips');
  }

  //  async createClip(clip: IClip){
  //   await this.clipCollection.add(clip)
  //  }

  // It returns 'DocumentReference', so no need to use async, await
  // After uploading, clip(video) will display using this reference
  createClip(clip: IClip): Promise<DocumentReference<IClip>> {
    return this.clipCollection.add(clip)
  }

  // Add combineLatestWith to get latest result when sort or getUserClips called
  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([
      this.afAuth.user,
      sort$]).pipe(
        switchMap(values => {
          const [user, sort] = values;
          if (!user) {
            return of([]);
          }

          const query = this.clipCollection.ref.where(
            'uid', '==', user.uid
          ).orderBy(
            'timeStamp',
            sort == '1' ? 'desc' : 'asc'
          )
          return query.get(); // initiate query
        }),
        map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
      )
  }

  // getUserClips() {
  //   return this.afAuth.user.pipe(
  //     switchMap(user => {
  //       if(!user) {
  //         return of([]);
  //       }

  //       const query = this.clipCollection.ref.where(
  //         'uid', '==', user.uid
  //       )
  //       return query.get(); // initiate query
  //     }),
  //     map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
  //   )
  // }

  updateClip(id: string, title: string) {
    return this.clipCollection.doc(id).update({
      title
    })
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    await clipRef.delete();
    await this.clipCollection.doc(clip.docID).delete();
  }

  async getClips(){
    if(this.pendingReq){
      return;
    }

    this.pendingReq = true;
    let query = this.clipCollection.ref.orderBy('timeStamp', 'desc')
    .limit(6);

    const { length } = this.pageClips;

    if(length) {
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await this.clipCollection.doc(lastDocID)
      .get()
      .toPromise()

      query = query.startAfter(lastDoc);
    }
    this.pendingReq = false;
  }
}
