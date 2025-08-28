import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { App } from '../Models/AppResponse';
import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class VATProService {
  onCollegeCreated: Subject<any> = new Subject<any>();

  constructor(private readonly httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly baseUrl = environment.vatProBaseUrl;
  private readonly key =environment.vatProEncryptionKey;
  private blockSize = 16;
decrypt(base64Cipher: string): string {
    try {
      if (!base64Cipher) {
        throw new Error('Cipher text cannot be empty');
      }

      // Convert Base64 to bytes
      const fullCipherBytes = CryptoJS.enc.Base64.parse(base64Cipher);
      
      // Extract IV (first 16 bytes) and cipher (remaining bytes)
      const ivWords = CryptoJS.lib.WordArray.create(
        fullCipherBytes.words.slice(0, 4) // 16 bytes = 4 words (32-bit each)
      );
      
      const cipherWords = CryptoJS.lib.WordArray.create(
        fullCipherBytes.words.slice(4), // Remaining bytes
        fullCipherBytes.sigBytes - 16 // Adjust signature bytes
      );

      // Convert string key to WordArray
      const keyWordArray = CryptoJS.enc.Utf8.parse(this.key);

      // Decrypt using AES-CBC with PKCS7 padding
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: cipherWords } as CryptoJS.lib.CipherParams,
        keyWordArray,
        {
          iv: ivWords,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      const plainText = decrypted.toString(CryptoJS.enc.Utf8);
      console.log('Decrypted text:', plainText);
      if (!plainText) {
        throw new Error('Failed to decrypt - invalid key or corrupted data');
      }

      return plainText;
      
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const len = wordArray.sigBytes;
    const u8_array = new Uint8Array(len);
    let offset = 0;
    for (let i = 0; i < wordArray.words.length; i++) {
      let word = wordArray.words[i];
      for (let j = 3; j >= 0; j--) {
        if (offset < len) {
          u8_array[offset++] = (word >> (j * 8)) & 0xff;
        }
      }
    }
    return u8_array;
  }
  
createRole(rolePayload: any): Observable<any> {
  const token = localStorage.getItem('vatProToken');
debugger
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  return this.httpClient.post(
    `${this.baseUrl}/Setup/UserRole_Insert`,
    rolePayload, // ✅ send correct payload
    { headers }
  );
}


vatProToken(username:any,password:any){
return this.httpClient.post<any>(
      `http://192.168.0.159/api/token?username=${username}&password=${password}`,
      {}
    );
}
  createNav(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/CreateNav`,
      project
    );
  }
    assignedUserMenus(UserDto: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/AssignUserMenu`,
      UserDto
    );
  }
assignMenu(ID:any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetRoleWiseMenuCloudPosDBKMART`,
      ID
    );
  }
  GetParentNav(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetParentNav`,
      {}
    );
  }
 getRole(): Observable<any> {
  const token = localStorage.getItem('vatProToken'); // 👈 retrieve token from localStorage

  const headers = {
    Authorization: `Bearer ${token}`, // 👈 attach token
    'Content-Type': 'application/json'
  };

  console.log('Base URL:', this.baseUrl);

  return this.httpClient.get(
    `${this.baseUrl}/Setup/GetAllUserRole`,
    { headers } // ✅ options only (no body for GET)
  );
}
  updateNav(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/UpdateNav`,
      project
    );
  }
    updateRole(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/updateRole`,
      project
    );
  }
   updateRolePerUser(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/UpdateUserRole`,
      project
    );
  }
 
  getAllNav(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetNav`,
      {}
    );
  }
   getAllUser(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetAllUser`,
      {}
    );
  }
  getAllPrivilege(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetAllRole`,
      {}
    );
  }
 getCompanyInfo(): Observable<App> {
  return this.httpClient
    .get<App>(`${this.baseUrl}/BillingSoftware/getCompanyInfo`)
    .pipe(catchError(this.handleError));
}

  updateCheckedNavItems(checkedMenus: any[]): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/UpdateDatabaseNav`,
      checkedMenus
    );
  }
getRoleByRoleID(roleId: number) {
  return this.httpClient
        .get<any[]>(`${this.baseUrl}/BillingSoftware/RoleWiseMenu?RoleId=${roleId}`)
        .pipe(
          catchError(this.handleError)
        );
}
  getNavs() {
    return this.httpClient
      .get<any>(`${this.baseUrl}Navs/GetAll`, {})
      .pipe(map((response: any) => response));
  }

  updateNavs(data: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}navs/Update`, data);
  }
  addRole(dto: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/BillingSoftware/RoleCreateCloudPosDBKMART`, dto);
 
  }
  menuOnSubmit(dto: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/BillingSoftware/UpdateMenuIdToTheRoleCloudPosDBKMART`, dto);
 
  }
  delete(MenuId: number): Observable<any> {
    return this.httpClient
      .delete<void>(this.baseUrl + 'navs/Delete?MenuId=' + MenuId)
      .pipe(map((response: any) => response));
  }



  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.error('Client Side Error: ', errorResponse.error);
    } else {
      console.error('Server Side error', errorResponse);
    }
    return throwError('There is a problem with the service');
  }
}

