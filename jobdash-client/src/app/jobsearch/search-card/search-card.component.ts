import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../search.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { JobadComponent } from '../jobad/jobad.component';
import { occupation_map } from './occupations';

//MD imports

import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
type LocationLAbel = string;
type LocationValue = number;
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
  occupations = new Array<any>();
  locationMap = new Map();

  locationData = {
    labels: [] as LocationLAbel[],
    datasets: [
      {
        data: [] as LocationValue[],
        label: 'Series A',
      },
    ],
  };

  ngOnInit(): void {
    this.searchService.readJsonFile().subscribe((response) => {
      this.lang_list = response;
    });
    console.log(this.lang_list);
    this.occupations = Object.entries(occupation_map).map(
      ([label, concept_id]) => ({
        label,
        concept_id,
      })
    );
  }

  onSearch(): void {
    this.jobads = [];
    const queryControl = this.searchForm.get('query');
    const occupationControl = this.searchForm.get('occupation');
    if (queryControl && occupationControl) {
      const query_text = queryControl.value ?? '';
      //console.log(query_text);
      const occupation_id = occupationControl.value ?? '';
      //console.log(occupation_id);
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
                this.locationMap = new Map();
                // Save region and there count in a map
                if (offset >= numberOfHits) {
                  for (let i = 0; i < this.jobads.length; i++) {
                    let region = this.jobads[i].workplace_address.region;
                    if (region === undefined || region === null) {
                      region = 'Okänd ort';
                    }
                    if (this.locationMap.has(region)) {
                      this.locationMap.set(
                        region,
                        this.locationMap.get(region) + 1
                      );
                    } else {
                      this.locationMap.set(region, 1);
                    }
                    //console.log(this.jobads[i].workplace_address.region);
                  }

                  console.log('Sista loopen', offset);
                  console.log(this.locationMap);
                  // this.locationData.labels = Array.from(
                  //   this.locationMap.keys()
                  // );
                }
                this.updateLocationData();
              });
            offset += 100;
            //console.log('offset: ' + offset);
          }
        });
    }
  }

  updateLocationData(): void {
    let sortedArray = Array.from(this.locationMap.entries());
    sortedArray.sort((a, b) => b[1] - a[1]);
    let sortedMap = new Map(sortedArray.slice(0, 10));
    let length = sortedMap.size;
    let newLabels = Array.from(sortedMap.keys());
    let newData = Array.from(sortedMap.values());
    if (sortedMap.size === 0) {
      newLabels = [];
      newData = [];
    }
    this.locationData = {
      labels: newLabels,
      datasets: [
        {
          data: newData,
          label: 'Top ' + length + ' regioner',
        },
      ],
    };
    console.log(this.locationData);
  }

  openJobAdDialog(id: string): void {
    const dialogRef = this.jobadDialog.open(JobadComponent, {
      data: { id: id },
    });
  }
}
