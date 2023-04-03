import { Injectable } from '@angular/core';

interface IModel {
  id: string,
  visible: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ModelService {

  constructor() { }
  //private visible = false;
  private models: IModel[] = [];

  register(id: string){
    this.models.push({
      id,
      visible: false
    })
  }

  unregister(id: string) {
    this.models.splice(this.models.findIndex(model => model.id == id), 1);
  }

  isModelOpen(id: string): boolean {
    //return this.visible;
    return !!this.models.find(element => element.id == id)?.visible; // !! double indication operator
    //or
    //return Boolean(this.models.find(element => element.id = id)?.visible;);
  }

  toggleModel(id: string) {
    //this.visible = !this.visible;
    const model = this.models.find(element => element.id == id);
    if(model) {
      model.visible = !model.visible;
    }

  }
}

