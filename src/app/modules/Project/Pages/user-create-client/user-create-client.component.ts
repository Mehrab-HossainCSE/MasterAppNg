import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RoleCreateClientService } from '../../Services/role-create-client.service';
import { MasterAppService } from '../../Services/master-app.service';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-user-create-client',

  templateUrl: './user-create-client.component.html',
  styleUrl: './user-create-client.component.scss',
})
export class UserCreateClientComponent implements OnInit {
  allUsers: any[] = [];
  getAllRole: any[] = [];
  userForm!: FormGroup;
  swalOptions: SweetAlertOptions = {};
  isOpenAction: number | null = null;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  @ViewChild('noticeSwal', { static: false }) noticeSwal!: SwalComponent;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private readonly roleCreateClientService: RoleCreateClientService,
    private readonly cdr: ChangeDetectorRef,
    private readonly masterAppService: MasterAppService
  ) {}

  ngOnInit(): void {
    this.userFormInit();
    this.getAllRoles();
    this.getAllMasterUser();
  }
  userFormInit() {
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
    });
  }
  getAllRoles(): void {
    this.roleCreateClientService.getAllRoles().subscribe({
      next: (res) => {
        this.getAllRole = res ?? [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      },
    });
  }
  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  openUserModal(content: any, userData: any = null) {
    this.modalService.open(content, { size: 'md', backdrop: 'static' });
  }

  getAllMasterUser(): void {
    this.masterAppService.getAllUser().subscribe({
      next: (res) => {
        this.allUsers = res.data ?? [];
        this.cdr.detectChanges();
        console.error('Fetched users successfully:', this.allUsers);
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }
  onSubmit(modal: any) {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      console.log('✅ User Form Data:', formData);

      // Declare projectIds outside so it’s accessible later
      let projectIds: string = '';

      const projects = localStorage.getItem('masterAppMenuList');
      if (projects) {
        const projectArray = JSON.parse(projects);
        const idArray = Array.isArray(projectArray)
          ? projectArray.map((p: any) => p.id)
          : [];

        projectIds = idArray.join(','); // 🔹 Convert to comma-separated string

        console.log('✅ Project IDs (string):', projectIds);
      }

      const userDto = {
        UserName: this.userForm.get('userName')?.value,
        Password: this.userForm.get('password')?.value,
        Role: this.userForm.get('role')?.value,
        ProjectListId: projectIds, // "1,2,4"
      };

      const request = this.isEditMode
        ? this.masterAppService.updateUser(userDto)
        : this.masterAppService.createUser(userDto);

      request.subscribe({
        next: (res: any) => {
          debugger;
          const successful = res?.data?.successfulProjects ?? [];
          const failed = res?.data?.failedProjects ?? [];
          const topMessage = res?.messages?.[0] ?? '';

          let messageText = '';

          if (successful.length > 0) {
            messageText += '✅ Successful Projects:\n';
            successful.forEach((p: any) => {
              messageText += `- Project ${p.projectId}: ${p.message}\n`;
            });
          }

          if (failed.length > 0) {
            messageText += '\n❌ Failed Projects:\n';
            failed.forEach((p: any) => {
              messageText += `- Project ${p.projectId}: ${p.message}\n`;
            });
          }

          // Add the backend top-level message at the end
          if (topMessage) {
            messageText += `\nℹ️ ${topMessage}`;
          }

          // Decide Swal icon based on results
          if (failed.length === 0 && successful.length > 0) {
            this.swalOptions.title = 'Success!';
            this.swalOptions.icon = 'success';
          } else if (failed.length > 0 && successful.length > 0) {
            this.swalOptions.title = 'Partial Success';
            this.swalOptions.icon = 'warning';
          } else {
            this.swalOptions.title = 'Error';
            this.swalOptions.icon = 'error';
          }

          this.swalOptions.text = messageText.trim();
          this.showAlert(this.swalOptions);
          this.getAllMasterUser();
          this.isSubmitting = false;
          this.userForm.reset({ InActive: false });
          this.userForm.reset({ StatusBilling: false });
        },
        error: () => {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = 'Server error occurred. Please try again.';
          this.swalOptions.icon = 'error';
          this.showAlert(this.swalOptions);
          this.isSubmitting = false;
        },
      });

      modal.close(); // Close modal
      this.userForm.reset();
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  showAlert(swalOptions: SweetAlertOptions) {
    debugger;
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    } else if (swalOptions.icon === 'warning') {
      style = 'warning';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }
}
