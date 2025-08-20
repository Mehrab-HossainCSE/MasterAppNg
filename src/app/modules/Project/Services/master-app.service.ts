import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MasterAppService {
  constructor(private readonly httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly baseUrl = environment.apiUrl;
  getAllUser(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/ProjectList/getMasterAppUser`,
      {}
    );
  }
}
