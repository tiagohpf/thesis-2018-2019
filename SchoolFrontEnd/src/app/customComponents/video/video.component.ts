import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

  @Input() inputParameters ;
  //@Input() parameters;

  public videoPath = '';
  public autoplay = false;
  public isMuted = false;
  public controls = true;

  constructor() { }

  public ngOnInit() {

    this.videoPath = this.inputParameters.value;
    //this.autoplay = this.parameters["configurations"].value;
    let configurations = this.inputParameters.parameters.find(x => x.key == "configurations");
    if(configurations){
      this.autoplay = configurations.value.autoplay ? configurations.value.autoplay : false;
      this.isMuted = configurations.value.muted ? configurations.value.muted : false;
      this.controls = configurations.value.controls ? configurations.value.controls : true;
      console.log('configurations.value.muted -----> ',configurations.value.muted );
      console.log('configurations.value.autoplay -----> ',configurations.value.autoplay );

    }
  }

}
