import { Component, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player'

@Component({
  selector: 'app-clips',
  templateUrl: './clips.component.html',
  styleUrls: ['./clips.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClipsComponent implements AfterViewInit {

  id: string = '';
  @ViewChild('videoPlayer', {static: true}) target?: ElementRef;
  player?: Player

  constructor(private aRoute: ActivatedRoute) {

  }

  ngOnInit() {
    //this.id = this.aRoute.snapshot.params.id; for static value
    this.aRoute.params.subscribe((params: Params) => {
      this.id = params.id;
    })
    this.player = videojs(this.target?.nativeElement)
  }

  ngAfterViewInit(): void {
  }
}
