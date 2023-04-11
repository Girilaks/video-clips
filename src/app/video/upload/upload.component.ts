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
import { combineLatest, forkJoin } from 'rxjs';

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
  screenshots: string[] = [];
  selectedScreenShot = '';
  screenshotTask?: AngularFireUploadTask;

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

  async storeFile($event: Event) {
    if(this.ffmpegService.isRunning) {
      return;
    }
    this.isDragOver = false;

    // Drag and drop, input type="file"
    this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null : 
      ($event.target as HTMLInputElement).files?.item(0) ?? null; // ?? useed to avoid undefined error 

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.generateScreenShots(this.file);
    this.selectedScreenShot = this.screenshots[0];

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, '')); // rmove extenson from file
    this.nextStep = true;
    console.log(this.file)
  }

  async uploadFile() { // blobFromUrl - async method
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertMsg = "Please wait! your clip is being uploded";
    this.alertColor = "blue";
    this.inSubmission = true;

    const clipFileName = uuid(); // firebase overwrite duplicate file name, so uuid is used
    const clipPath = `clips-lg/${clipFileName}.mp4`;

    const screenShotBlob = await this.ffmpegService.blobFromUrl(this.selectedScreenShot);
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.screenshotTask =  this.storage.upload(screenshotPath, screenShotBlob); // upload image to store

    const screenshotRef = this.storage.ref(screenshotPath);

    // Get percentage from both video and file upload
    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges()
    ])
    .subscribe(progress => {
      const [clipProgress, screenshotProgress] = progress;
      if(!clipProgress || !screenshotProgress) {
        return
      }

      const total = clipProgress + screenshotProgress;
      this.percentageCompleted = total as number / 200;
    })

    // Progress only for video
    // this.task.percentageChanges().subscribe(percent => {
    //   this.percentageCompleted = percent as number / 100;
    // })

    // Implement forkjoin to save both video and selected screenshot url
    // And also save data after coompleting both api calls
    forkJoin([this.task.snapshotChanges(),
    this.screenshotTask.snapshotChanges()]).pipe(
      //last(), // forkjoin return after coompleting process
      switchMap(() => forkJoin([clipRef.getDownloadURL(),
      screenshotRef.getDownloadURL()]))
    ).subscribe({
      // next: (snapshot) => { // last snapshot return
      next: async (urls) => { // after switchMap, inner subscribe return url but it also after video upload
        this.alertMsg = "Success! Your clip is ready to share";
        this.alertColor = "green";

        const [clipUrl, screenshotUrl] = urls;
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value as string,
          fileName: `${clipFileName}.mp4`,
          url: clipUrl,
          screenshotUrl,
          timeStamp: firebase.firestore.FieldValue.serverTimestamp()
        }
        const clipDocRef = await this.clipService.createClip(clip);
        setTimeout(() => {
          this.router.navigate(
            ['clips', clipDocRef.id]
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

    // Get document reference to diplay the uploaded video
    // this.task.snapshotChanges().pipe(
    //   last(),
    //   switchMap(() => clipRef.getDownloadURL())
    // ).subscribe({
    //   // next: (snapshot) => { // last snapshot return
    //   next: async (url) => { // after switchMap, inner subscribe return url but it also after video upload
    //     this.alertMsg = "Success! Your clip is ready to share";
    //     this.alertColor = "green";
    //     const clip = {
    //       uid: this.user?.uid as string,
    //       displayName: this.user?.displayName as string,
    //       title: this.title.value as string,
    //       fileName: `${clipFileName}.mp4`,
    //       url,
    //       timeStamp: firebase.firestore.FieldValue.serverTimestamp()
    //     }
    //     const clipDocRef = await this.clipService.createClip(clip);
    //     setTimeout(() => {
    //       this.router.navigate(
    //         ['clip', clipDocRef.id]
    //       )
    //     }, 1000);
    //   },
    //   error: (error) => {
    //     this.uploadForm.enable();
    //     this.alertColor = 'red';
    //     this.alertMsg = 'Upload failed! Please try again later';
    //     this.inSubmission = true;
    //     // Using errorCode to display proper msg if required
    //   }
    // })
    
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
