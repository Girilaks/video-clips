import { Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnDestroy {

  @Input() modelID = ''

  constructor(public model: ModelService, public el: ElementRef){

  }

  ngOnInit(){
    //move the element after the component initialized. This avoid inheriting parent element css
    document.body.appendChild(this.el.nativeElement); 
  }

  closeModel() {
    this.model.toggleModel(this.modelID);
  }

  ngOnDestroy(): void {
    document.body.removeChild(this.el.nativeElement)
  }
}
