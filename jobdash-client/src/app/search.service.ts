import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}

  public getJobAd(id: string): Observable<any> {
    const url = 'https://jobsearch.api.jobtechdev.se/ad/' + id;
    return this.http.get(url);
  }

  public getAllJobs(
    query: string,
    offset: number,
    occupation: string
  ): Observable<any> {
    let url = '';
    let occupation_text = '?occupation-field=apaJ_2ja_LuF';
    let query_text = '&q=' + query.toLowerCase();
    if (occupation !== '') {
      occupation_text = '?occupation-name=' + occupation;
    }

    //console.log('Occupation: ' + occupation_text);

    url =
      'https://jobsearch.api.jobtechdev.se/search' +
      occupation_text +
      query_text +
      '&offset=' +
      offset +
      '&limit=100&request-timeout=300';

    //console.log(url);
    //console.log('Occupation: ' + occupation_text);
    const res = this.http.get(url);
    //console.log(res);
    return res;
  }

  readJsonFile(): Observable<any> {
    return this.http.get('assets/github_repos_list.json');
  }
}
