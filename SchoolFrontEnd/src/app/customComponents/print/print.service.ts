import { Injectable } from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  isPrinting = false;
  data: any = {};


  constructor(private router: Router) { }


  //printDocument(documentName: string, documentData: string[]) {
    printDocument(studentId: string, paymentId: any) {
  
      console.info("printDocument: " + studentId + " " + paymentId);
  
      this.isPrinting = true;
      this.router.navigate(['/',
      { outlets: {
        'print': ['students', studentId, 'print', 'payments', paymentId]
      }}], { skipLocationChange: true });
   
  
    }

  printDocument_original(documentName: string, documentData: string[]) {
    this.isPrinting = true;
    this.router.navigate(['/',
    { outlets: {
      'print': ['print', documentName, documentData.join()]
    }}], { skipLocationChange: true });


  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate([{ outlets: { print: null }}]);
    });
  }
}
