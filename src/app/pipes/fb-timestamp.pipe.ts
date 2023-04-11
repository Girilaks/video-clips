import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'fbTimestamp'
})
export class FbTimestampPipe implements PipeTransform {

  constructor(private datepipe: DatePipe){}
  transform(value: firebase.firestore.FieldValue | undefined) {
    if(!value) {
      return '';
    }
    //const date = value.toDate(); // General method
    const date = (value as firebase.firestore.Timestamp).toDate(); // for firebase
    return this.datepipe.transform(date, 'mediumDate');
  }

}
