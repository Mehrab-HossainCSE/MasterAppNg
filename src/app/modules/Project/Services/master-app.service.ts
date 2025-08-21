import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  updateUser(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/ProjectList/UpdateProject/`,
      project
    );
  }
// createUser(UserCreate: any): Observable<any> {
  

//   return this.httpClient.post<any>(
//     `${this.baseUrl}/ProjectList/UserCreate/`,
//     { UserCreate }
//   );
// }

createUser(userCreate: any): Observable<any> {
  return this.httpClient.post<any>(
    `${this.baseUrl}/ProjectList/UserCreate/`,
    userCreate, // ✅ send the DTO directly
    { headers: { 'Content-Type': 'application/json' } }
  );
}


  getAllUser(): Observable<any> {
    return this.httpClient.get<any>(
      `${this.baseUrl}/ProjectList/getMasterAppUser`,
      {}
    );
  }

}
