import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { MasterAppService } from '../../Services/master-app.service';

@Component({
  selector: 'app-master-app',
  standalone: false,

  templateUrl: './master-app.component.html',
  styleUrl: './master-app.component.scss',
})
export class MasterAppComponent implements OnInit {
allUsers: any[] = [];
  currentPage: number=1
  pageSize: number=10;
    isOpenAction: number | null = null;
  constructor(private readonly masterAppService: MasterAppService) {}

  ngOnInit(): void {
    this.getAllMasterUser();
  }

  onAddUser() {
    // open modal or navigate
  console.log("Add User clicked");
}
  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }
onUpdate(user: any) {
  console.log("Update clicked", user);
  // open update modal or route
}

onAddProject(user: any) {
  console.log("Add Project clicked", user);
  // open add project modal
}
closeDropdown(): void {
    this.isOpenAction = null;
  }
  getAllMasterUser(): void {
    this.masterAppService.getAllUser().subscribe({
      next: (res) => {
        this.allUsers = res.data ?? [];
        console.error('Fetched users successfully:', this.allUsers);
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }


}
