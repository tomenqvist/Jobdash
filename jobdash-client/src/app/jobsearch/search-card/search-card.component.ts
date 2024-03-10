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

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private jobadDialog: MatDialog
  ) {}
  jobads = new Array<any>();

  onSearch(): void {
    const queryControl = this.searchForm.get('query');
    if (queryControl) {
      const query_text = queryControl.value ?? '';
      console.log(query_text);
      this.searchService.getJobs(query_text).subscribe((response) => {
        this.jobads = response.hits;
        console.log(response.positions);
        console.log(response);
        console.log(this.jobads);

        this.jobads.sort((a, b) => {
          // Convert publication_date strings to Date objects for comparison
          let dateA = new Date(a.publication_date);
          let dateB = new Date(b.publication_date);

          // Compare the dates
          return +dateB - +dateA;
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
