import { Component, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player'
import { IClip } from '../models/clip.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clips',
  templateUrl: './clips.component.html',
  styleUrls: ['./clips.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
export class ClipsComponent implements AfterViewInit {

  id: string = '';
  @ViewChild('videoPlayer', {static: true}) target?: ElementRef;
  player?: Player;
  clip?: IClip;

  constructor(private aRoute: ActivatedRoute) {

  }

  ngOnInit() {
    //this.id = this.aRoute.snapshot.params.id; for static value
    this.aRoute.params.subscribe((params: Params) => {
      this.id = params.id;
    })

    this.player = videojs(this.target?.nativeElement);

    // data property contains the resolved data
    this.aRoute.data.subscribe(data => {
      this.clip = data.clip as IClip;

      this.player?.src({
        src: this.clip.url,
        type: "video/mp4"
      })
    })
  }

  ngAfterViewInit(): void {
  }
}
