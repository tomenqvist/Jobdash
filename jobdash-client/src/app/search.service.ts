import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}

  public getJobs(query: string): Observable<any> {
    const url =
      'https://jobsearch.api.jobtechdev.se/search?q=' +
      query.toLowerCase() +
      '&offset=0&limit=100&request-timeout=300';
    return this.http.get(url);
  }

  public getJobAd(id: string): Observable<any> {
    const url = 'https://jobsearch.api.jobtechdev.se/ad/' + id;
    return this.http.get(url);
  }

  public getAllJobs(query: string, offset: number): Observable<any> {
    const url =
      'https://jobsearch.api.jobtechdev.se/search?q=' +
      query.toLowerCase() +
      '&offset=' +
      offset +
      '&limit=100&request-timeout=300';
    console.log(url);
    const res = this.http.get(url);
    console.log(res);
    return res;
  }
}
