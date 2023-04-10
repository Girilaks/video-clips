import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClipService } from '../services/clip.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.scss'],
  providers: [DatePipe] // Injected here to reduce code. Generally it inject in commonModule for datatime pipe 
  // In this case, we need to import whole module for a datetime pipe
})
export class ClipsListComponent implements OnInit, OnDestroy {

  constructor(public clipService: ClipService){
    clipService.getClips();
  }

  ngOnInit(): void {
    window.addEventListener('scroll', this.handleScrollEvnt)
  }

  handleScrollEvnt = () => {
    const { scrollTop, offsetHeight} = document.documentElement;
    const { innerHeight } = window;

    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if(bottomOfWindow) {
      console.log("bottom of win");
      this.clipService.getClips();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScrollEvnt)
  }

}
