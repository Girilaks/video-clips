import { Injectable } from '@angular/core';
import { createFFmpeg } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {

  isReady = false;
  private ffmpeg;
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
}
