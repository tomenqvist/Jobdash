import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SearchService } from '../../search.service';

@Component({
  selector: 'app-jobad',
  templateUrl: './jobad.component.html',
  styleUrl: './jobad.component.css',
})
export class JobadComponent implements OnInit {
  id: string | undefined;
  ad: any;
  ad_text: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private searchService: SearchService
  ) {}
  ngOnInit() {
    this.id = this.data.id;
    console.log(this.id);
    if (this.id) {
      this.searchService.getJobAd(this.id).subscribe((response) => {
        console.log(response);
        this.ad = response;
        this.ad_text = this.ad.description.text_formatted;
        console.log(this.ad_text);
      });
    }
  }
}
