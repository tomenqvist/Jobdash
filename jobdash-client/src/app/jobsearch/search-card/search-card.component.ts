import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../search.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { JobadComponent } from '../jobad/jobad.component';
//MD imports

import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-search-card',
  templateUrl: './search-card.component.html',
  styleUrl: './search-card.component.css',
})
export class SearchCardComponent implements OnInit {
  searchForm = new FormGroup({
    query: new FormControl(''),
    occupation: new FormControl(''),
  });

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private jobadDialog: MatDialog
  ) {}
  jobads = new Array<any>();
  lang_list = new Array<any>();
  occupation_list = new Array<any>();
  occupations = new Array<any>();

  ngOnInit(): void {
    this.searchService.readJsonFile().subscribe((response) => {
      this.lang_list = response;
    });
    console.log(this.lang_list);
    this.searchService.getAllOccupations().subscribe((response) => {
      this.occupation_list = response;
    });
    //build occupations from occupation_list
    for (const key in this.occupation_list) {
      if (Object.prototype.hasOwnProperty.call(this.occupation_list, key)) {
        const value = this.occupation_list[key];
        this.occupations.push({ id: key, name: value });
      }
    }
  }

  onSearch(): void {
    this.jobads = [];
    const queryControl = this.searchForm.get('query');
    const occupationControl = this.searchForm.get('occupation');
    if (queryControl && occupationControl) {
      const query_text = queryControl.value ?? '';
      console.log(query_text);
      const occupation_id = occupationControl.value ?? '';
      console.log(occupation_id);
      let offset = 0;
      let numberOfHits = 0;
      this.searchService
        .getAllJobs(query_text, offset, occupation_id)
        .subscribe((response) => {
          numberOfHits = response.positions;
          console.log('numberOfHits: ' + numberOfHits);

          while (offset < numberOfHits) {
            this.searchService
              .getAllJobs(query_text, offset, occupation_id)
              .subscribe((response) => {
                this.jobads = this.jobads.concat(response.hits);
              });
            offset += 100;
            console.log('offset: ' + offset);
          }
        });
    }
  }

  onSearch_backup(): void {
    const queryControl = this.searchForm.get('query');
    if (queryControl) {
      const query_text = queryControl.value ?? '';
      console.log(query_text);

      this.searchService.getAllJobs(query_text, 0, '').subscribe((response) => {
        this.jobads = response.hits;
        console.log(this.jobads);
        //console.log(response.positions);
        //console.log(response);
        //console.log(this.jobads);

        this.jobads.sort((a, b) => {
          // Convert publication_date strings to Date objects for comparison
          let dateA = new Date(a.application_deadline);
          let dateB = new Date(b.application_deadline);

          // Compare the dates
          return +dateA - +dateB;
        });
      });
    }
  }
  openJobAdDialog(id: string): void {
    const dialogRef = this.jobadDialog.open(JobadComponent, {
      data: { id: id },
    });
  }
}
