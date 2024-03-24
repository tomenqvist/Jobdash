import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../search.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { JobadComponent } from '../jobad/jobad.component';
import { occupation_map } from './occupations';
import { skills } from './skills';

//MD imports
import { MatDialog } from '@angular/material/dialog';

// Types for the data
type DataLabel = string;
type DataValue = number;

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
  skills = skills;
  occupations = new Array<any>();
  locationMap = new Map();
  occupationMap = new Map();
  skillsMap = new Map();

  locationData = {
    labels: [] as DataLabel[],
    datasets: [
      {
        data: [] as DataValue[],
        label: 'Ort',
      },
    ],
  };

  occupationData = {
    labels: [] as DataLabel[],
    datasets: [
      {
        data: [] as DataValue[],
        label: 'Jobbtitel',
      },
    ],
  };

  skillsData = {
    labels: [] as DataLabel[],
    datasets: [
      {
        data: [] as DataValue[],
        label: 'Skills',
      },
    ],
  };

  ngOnInit(): void {
    this.occupations = Object.entries(occupation_map).map(
      ([label, concept_id]) => ({
        label,
        concept_id,
      })
    );
    console.log(this.skills);
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
                // Empty the maps
                this.locationMap = new Map();
                this.occupationMap = new Map();
                this.skillsMap = new Map();
                // Save region and their count in a map
                if (offset >= numberOfHits) {
                  for (let i = 0; i < this.jobads.length; i++) {
                    let region = this.jobads[i].workplace_address.region;
                    let occupation =
                      this.jobads[i].occupation.label.slice(0, 15) + '...';
                    let adtext = this.jobads[i].description.text.toLowerCase();
                    //console.log(adtext);
                    // REGION
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

                    // OCCUPATION
                    if (this.occupationMap.has(occupation)) {
                      this.occupationMap.set(
                        occupation,
                        this.occupationMap.get(occupation) + 1
                      );
                    } else {
                      this.occupationMap.set(occupation, 1);
                    }

                    // SKILLS
                  }
                  for (let skill of this.skills) {
                    let skillCount = 0;
                    for (let i = 0; i < this.jobads.length; i++) {
                      let adtext =
                        this.jobads[i].description.text.toLowerCase();
                      if (adtext.includes(skill)) {
                        skillCount++;
                      }
                    }
                    this.skillsMap.set(skill, skillCount);
                  }

                  //console.log('Sista loopen', offset);
                  //console.log(this.occupationMap);
                  //console.log(this.skillsMap);
                }
                this.updateLocationData();
                this.updateOccupationData();
                this.updateSkillsData();
              });
            offset += 100;
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

  updateOccupationData(): void {
    let sortedArray = Array.from(this.occupationMap.entries());
    sortedArray.sort((a, b) => b[1] - a[1]);
    let sortedMap = new Map(sortedArray.slice(0, 10));
    let length = sortedMap.size;
    let newLabels = Array.from(sortedMap.keys());
    let newData = Array.from(sortedMap.values());
    if (sortedMap.size === 0) {
      newLabels = [];
      newData = [];
    }
    this.occupationData = {
      labels: newLabels,
      datasets: [
        {
          data: newData,
          label: 'Top ' + length + ' yrken',
        },
      ],
    };
  }

  updateSkillsData(): void {
    let sortedArray = Array.from(this.skillsMap.entries());
    sortedArray.sort((a, b) => b[1] - a[1]);
    let sortedMap = new Map(sortedArray.slice(0, 10));
    //console.log(sortedMap);
    let length = sortedMap.size;
    let newLabels = Array.from(sortedMap.keys());
    let newData = Array.from(sortedMap.values());
    if (sortedMap.size === 0) {
      newLabels = [];
      newData = [];
    }
    this.skillsData = {
      labels: newLabels,
      datasets: [
        {
          data: newData,
          label: 'Top ' + length + ' skills',
        },
      ],
    };
  }

  openJobAdDialog(id: string): void {
    const dialogRef = this.jobadDialog.open(JobadComponent, {
      data: { id: id },
    });
  }
}
