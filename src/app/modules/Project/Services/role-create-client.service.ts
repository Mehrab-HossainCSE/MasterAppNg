import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleCreateClientService {


  constructor(private readonly httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly baseUrl = environment.apiUrl;


    createRoleMaster(project: any): Observable<any> {
      return this.httpClient.post(
        `${this.baseUrl}/ProjectList/MasterRoleCreate`,
        project
      );
    }

    getAllRoles(): Observable<any> {
      return this.httpClient.get(`${this.baseUrl}/ProjectList/GetRoleMaster`);
    }
}
