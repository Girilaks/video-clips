import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';
import { IClip } from 'src/app/models/clip.model';
import { ModelService } from 'src/app/services/model.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit{

  videoOrder = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;

  constructor(private aRoute: ActivatedRoute,
    private router: Router, private clipService: ClipService,
    private modelService: ModelService) {
      this.sort$ = new BehaviorSubject(this.videoOrder); 
  }
  ngOnInit(): void {
    //this.aRoute.data.subscribe(console.log)
    this.aRoute.queryParamMap.subscribe((params: Params) => { // Trigger whenever new value get updated
      this.videoOrder = params.sort === '2' ? params.sort : '1';
      this.sort$.next(this.videoOrder);
    })
    this.clipService.getUserClips(this.sort$).subscribe(docs => {
      this.clips = [];
      docs.forEach(doc => {
        
        this.clips.push({
          docID : doc.id,
          ...doc.data()
        })
      })
    });
  }

  sort(event: Event){
    const { value } = event.target as HTMLSelectElement;
    //this.router.navigateByUrl(`/manage?sort=${value}`)

    this.router.navigate([],
      {
        relativeTo: this.aRoute,
        queryParams: {
          sort: value
        }
      })
  }

  openModel($event: Event, clip: IClip){
    $event.preventDefault();
    this.activeClip = clip;
    this.modelService.toggleModel('editClip');
  }

  update($event: IClip){
    this.clips.forEach((element, index) => {
      if(element.docID === $event.docID){
        this.clips[index].title = $event.title;
      }
    })
  }

  deleteClip($event: Event, clip: IClip) {
    $event.preventDefault()
    this.clipService.deleteClip(clip);

    this.clips.forEach((element,index) => {
      if(element.docID === clip.docID) {
        this.clips.splice(index, 1)
      }
    })
  }
}
