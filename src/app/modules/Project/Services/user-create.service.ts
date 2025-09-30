import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserCreateService {
  windowObj: any = window;
  private readonly baseUrl = environment.apiUrl;
  constructor(private readonly httpClient: HttpClient) { }

  createUser(userCreate: any): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}/ProjectList/ClientAdminUserCreate/`,
      userCreate, 
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  
}
