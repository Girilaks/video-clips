import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app'; // interface
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnDestroy{
  isDragOver = false;
  file: File | null = null;
  nextStep = false;

  showAlert = false;
  alertMsg = "Please wait! your clip is being uploded";
  alertColor = "blue";
  inSubmission = false;
  percentageCompleted = 0;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;

  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  uploadForm = new FormGroup({
    title: this.title
  })

  constructor(private storage: AngularFireStorage, protected afAuth: AngularFireAuth,
    private clipService: ClipService, private router: Router,
    public ffmpegService: FfmpegService) {
    afAuth.user.subscribe(user => this.user = user);
    ffmpegService.init(); // disable form until ffmpeg to load
  }

  storeFile($event: Event) {
    this.isDragOver = false;

    // Drag and drop, input type="file"
    this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null : 
      ($event.target as HTMLInputElement).files?.item(0) ?? null; // ?? useed to avoid undefined error 

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, '')); // rmove extenson from file
    this.nextStep = true;
    console.log(this.file)
  }

  uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertMsg = "Please wait! your clip is being uploded";
    this.alertColor = "blue";
    this.inSubmission = true;

    const clipFileName = uuid(); // firebase overwrite duplicate file name, so uuid is used
    const clipPath = `clips-lg/${clipFileName}.mp4`;
    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    this.task.percentageChanges().subscribe(percent => {
      this.percentageCompleted = percent as number / 100;
    })

    // Get document reference to diplay the uploaded video
    this.task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      // next: (snapshot) => { // last snapshot return
      next: async (url) => { // after switchMap, inner subscribe return url but it also after video upload
        this.alertMsg = "Success! Your clip is ready to share";
        this.alertColor = "green";
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value as string,
          fileName: `${clipFileName}.mp4`,
          url,
          timeStamp: firebase.firestore.FieldValue.serverTimestamp()
        }
        const clipDocRef = await this.clipService.createClip(clip);
        setTimeout(() => {
          this.router.navigate(
            ['clip', clipDocRef.id]
          )
        }, 1000);
      },
      error: (error) => {
        this.uploadForm.enable();
        this.alertColor = 'red';
        this.alertMsg = 'Upload failed! Please try again later';
        this.inSubmission = true;
        // Using errorCode to display proper msg if required
      }
    })
    
    // this.task.snapshotChanges().pipe(
    //   last(),
    //   switchMap(() => clipRef.getDownloadURL())
    // ).subscribe({
    //   // next: (snapshot) => { // last snapshot return
    //   next: (url) => { // after switchMap, inner subscribe return url but it also after video upload
    //     this.alertMsg = "Success! Your clip is ready to share";
    //     this.alertColor = "green";
    //     const clip = {
    //       uid: this.user?.uid as string,
    //       displayName: this.user?.displayName as string,
    //       title: this.title.value as string,
    //       fileName: `${clipFileName}.mp4`,
    //       url
    //     }
    //     this.clipService.createClip(clip);
    //   },
    //   error: (error) => {
    //     this.uploadForm.enable();
    //     this.alertColor = 'red';
    //     this.alertMsg = 'Upload failed! Please try again later';
    //     this.inSubmission = true;
    //     // Using errorCode to display proper msg if required
    //   }
    // })
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }
}
