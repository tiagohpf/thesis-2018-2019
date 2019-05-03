import {
  Component,
  OnInit,
  Input,
  SimpleChange
} from '@angular/core';

import { PageService } from 'foundations-webct-robot/robot/pageComponent/page.service';
import { Utils } from 'foundations-webct-robot/robot/utils/utils.service';

@Component({
  selector: '[profile-picture-component]',
  templateUrl: 'profile-picture.component.html',
  styles: [`

  `]
})
export class ProfilePictureComponent implements OnInit {

  @Input() id;
  @Input() cx = '50%';
  @Input() cy = '50%';
  @Input() x = '50%';
  @Input() y = '50%';
  @Input() r = '50%';
  @Input() color;
  @Input() text;
  @Input() icon;
  @Input() showAcronym = true;
  @Input() fontSize;
  @Input() img;
  @Input() imgId;
  @Input() size;
  @Input() borderWidth;
  @Input() applyUploadPhotoMask;
  @Input() applyViewDetailMask;
  @Input() shape;
  @Input() width = '100%';
  @Input() height = '100%';
  @Input() entity;

  @Input() inputDataRecs;

  public acronym;
  public defaultPictureColor;
  public isLocalImage;
  public iconCode = "&#xe91a;";
  public iconFontSize;

  public inputColor: string;

  private baseUrl = "";
  private basePath = "";

  public ShapeKind = {
    circle: 'circle',
    rectangle: 'rectangle'
  };

  public colorArray = [
    { letter: '0', color: '#990000' },
    { letter: '1', color: '#994C00' },
    { letter: '2', color: '#999900' },
    { letter: '3', color: '#4C9900' },
    { letter: '4', color: '#009900' },
    { letter: '5', color: '#00994C' },
    { letter: '6', color: '#009999' },
    { letter: '7', color: '#004C99' },
    { letter: '8', color: '#000099' },
    { letter: '9', color: '#4C0099' },
    { letter: 'A', color: '#990000' },
    { letter: 'B', color: '#994C00' },
    { letter: 'C', color: '#999900' },
    { letter: 'D', color: '#4C9900' },
    { letter: 'E', color: '#009900' },
    { letter: 'F', color: '#00994C' },
    { letter: 'G', color: '#009999' },
    { letter: 'H', color: '#004C99' },
    { letter: 'I', color: '#000099' },
    { letter: 'J', color: '#4C0099' },
    { letter: 'K', color: '#990099' },
    { letter: 'L', color: '#99004C' },
    { letter: 'M', color: '#3F3F3F' },
    { letter: 'N', color: '#DEA502' },
    { letter: 'O', color: '#FFB266' },
    { letter: 'P', color: '#A0A000' },
    { letter: 'Q', color: '#E6AD0C' },
    { letter: 'R', color: '#64EC64' },
    { letter: 'S', color: '#349664' },
    { letter: 'T', color: '#11BBFF' },
    { letter: 'U', color: '#66B2FF' },
    { letter: 'V', color: '#6666FF' },
    { letter: 'W', color: '#B266FF' },
    { letter: 'X', color: '#FF66FF' },
    { letter: 'Y', color: '#FF66B2' },
    { letter: 'Z', color: '#949494' }
  ];

  public defaultPictureColorArray = [
    '#990000',
    '#994C00',
    '#999900',
    '#4C9900',
    '#009900',
    '#00994C',
    '#009999',
    '#004C99',
    '#000099',
    '#4C0099'
  ];

  constructor(
    public pageService: PageService,
    public utils: Utils) {

  }

  public ngOnInit() {
    console.log(this.shape);
    this._startComponent();
  }

  public ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes['img'] || changes['text'] || changes['id']) {
      this._startComponent();
    }
  }

  public ngOnDestroy() {
  }

  private _startComponent() {

    if (this.text) {
      this.getAcronym(this.text);
      this.getColor(this.acronym);
      if (!this.showAcronym)
        this.acronym = this.text;
    }
    else if (this.color) {
      this.defaultPictureColor = this.color;
    }
    else {
      this.getDefaultPictureColor(this.id);
    }

    //set icon font size
    if (this.fontSize) {
      this.iconFontSize = parseFloat(this.fontSize) + 1.2;
    }

    //set icon
    if (this.icon) {
      this.iconCode = this.icon;
    }

    //set shape
    this.shape = this.shape && (this.shape == this.ShapeKind.circle || this.shape == this.ShapeKind.rectangle) ? this.shape : this.ShapeKind.circle;

    //is image from local assets
    //this.baseUrl = this.pageService.getUrlFromConfig(this.utils.replaceTagVars(this.basePath, this.inputDataRecs));
    if (this.img && this.img.indexOf("/assets/images/") == -1)
      this.isLocalImage = false;
    else
      this.isLocalImage = true;

    //generate image unique id
    this.imgId = 'image_' + this.id + Date.now();

  }

  private getAcronym(text) {

    var name = text.trim();
    var initials = name.match(/\b\w/g) || [];
    var str = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    this.acronym = str;
  }

  private getColor(acronym) {
    let colorObj = this.colorArray.find(i => i.letter === acronym.substring(0, 1).toUpperCase());
    if (colorObj == null) {
      this.getDefaultPictureColor(this.id);
    } else {
      this.inputColor = colorObj.color;
    }
  }

  private getDefaultPictureColor(id) {
    let pos = id % 10;
    this.defaultPictureColor = this.defaultPictureColorArray[pos];
  }

}