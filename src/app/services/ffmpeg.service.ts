import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {

  isReady = false;
  private ffmpeg;
  isRunning = false;

  constructor() { 
    this.ffmpeg = createFFmpeg({log: true});
    }

  async init() {
    if(this.isReady) {
      return;
    }
    await this.ffmpeg.load(); // It is time consuming task so we initialize function as async
    this.isReady = true;
  }

  async generateScreenShots(file: File) {
    this.isRunning = true;
    let data = await fetchFile(file);
    this.ffmpeg.FS("writeFile", file.name, data); // File System which allow read and write option

    // Processing stored ffmpeg and generating 1 image
    // Values inside the run() are commands
    // await this.ffmpeg.run(
    //   //Input
    //   '-i', file.name,
    //   // Output options
    //   '-ss', '00:00:01',
    //   '-frames:v', "1",
    //   '-filter:v', "scale=500:-1",
    //   //Output
    //   'output_01.png'
    // )

    // Generating multiple images
    const seconds = [1, 2, 3];
    const commands: string[] = [];
    seconds.forEach(second => {
      commands.push(
        //Input
        '-i', file.name,
        // Output options
        '-ss', `00:00:0${second}`,
        '-frames:v', "1",
        '-filter:v', "scale=500:-1",
        //Output
        `output_0${second}.png`
      )
    })

    await this.ffmpeg.run(
      ...commands
    );

    // Generating screenshots
    const screenshots: string[] = [];
    seconds.forEach(second => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile', `output_0${second}.png`
      )

      // Convert binary data to blob(Binary Large OBject) is another format of storing binary array.
      // Also BLOB helps to create url for image
      const screenShotBlob = new Blob(
        [screenshotFile.buffer], {
        type: 'image/png'
      })

      // Create url from blob obj
      const screenShotURL = URL.createObjectURL(screenShotBlob);

      screenshots.push(screenShotURL);
    })

    this.isRunning = false;
    return screenshots;
  }

  async blobFromUrl(url: string){
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
  }
}
