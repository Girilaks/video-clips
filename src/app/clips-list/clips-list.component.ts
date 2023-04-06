import { Component, OnInit, OnDestroy } from '@angular/core';
import { log } from 'console';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.scss']
})
export class ClipsListComponent implements OnInit, OnDestroy {

  constructor(){

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
      
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScrollEvnt)
  }

}
