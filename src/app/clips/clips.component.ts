import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-clips',
  templateUrl: './clips.component.html',
  styleUrls: ['./clips.component.scss']
})
export class ClipsComponent {

  id: string = '';
  constructor(private aRoute: ActivatedRoute) {

  }

  ngOnInit() {
    //this.id = this.aRoute.snapshot.params.id; for static value
    this.aRoute.params.subscribe((params: Params) => {
      this.id = params.id;
    })
  }
}
