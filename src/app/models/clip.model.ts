import firebase from 'firebase/compat/app'; // interface

export interface IClip {
    docID?: string,
    uid: string,
    displayName: string,
    title: string,
    fileName: string,
    url: string,
    screenshotUrl: string,
    timeStamp: firebase.firestore.FieldValue
}