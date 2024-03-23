import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../search.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { JobadComponent } from '../jobad/jobad.component';

@Component({
  selector: 'app-search-card',
  templateUrl: './search-card.component.html',
  styleUrl: './search-card.component.css',
})
export class SearchCardComponent {
  searchForm = new FormGroup({
    query: new FormControl(''),
  });
  Math: any;

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private jobadDialog: MatDialog
  ) {}
  jobads = new Array<any>();

  onSearch(): void {
    this.jobads = [];
    const queryControl = this.searchForm.get('query');
    if (queryControl) {
      const query_text = queryControl.value ?? '';
      console.log(query_text);
      let offset = 0;
      let numberOfHits = 0;
      this.searchService
        .getAllJobs(query_text, offset)
        .subscribe((response) => {
          numberOfHits = response.positions;
          console.log('numberOfHits: ' + numberOfHits);

          while (offset < numberOfHits) {
            this.searchService
              .getAllJobs(query_text, offset)
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

      this.searchService.getAllJobs(query_text, 0).subscribe((response) => {
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
