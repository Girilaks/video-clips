import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { IClip } from 'src/app/models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnChanges {

  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();

  clipID = new FormControl('');
  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  })

  showAlert = false;
  alertMsg = "Please wait! Updating clip";
  alertColor = "blue";
  inSubmission = false;

  constructor(private modelService: ModelService, private clipService: ClipService) {

  }

  ngOnInit() {
    this.modelService.register('editClip')
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return
    }
    this.inSubmission = false;
    this.showAlert = false;
    this.clipID.setValue(this.activeClip.docID as string);
    this.title.setValue(this.activeClip.title);
  }

  async submit() {
    if(!this.activeClip){
      return;
    }
    this.showAlert = true;
    this.alertMsg = "Please wait! Updating clip";
    this.alertColor = "blue";
    this.inSubmission = true;

    try {
      await this.clipService.updateClip(this.clipID.value as string, this.title.value as string)
    }
    catch (error) {
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong! Please try again later';
      this.inSubmission = false;
      return;
    }
    
    this.activeClip.title = this.title.value as string;
    this.update.emit(this.activeClip);
    this.inSubmission = true;
    this.alertColor = 'green';
      this.alertMsg = 'Success';
  }

  ngOnDestroy() {
    this.modelService.unregister('editClip');
  }
}
