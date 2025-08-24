import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { MasterAppService } from '../../Services/master-app.service';
import { CloudPosService } from '../../Services/cloud-pos.service';
import { App } from '../../Models/AppResponse';

@Component({
  selector: 'app-master-app',
  standalone: false,

  templateUrl: './master-app.component.html',
  styleUrl: './master-app.component.scss',
})
export class MasterAppComponent implements OnInit {
  allUsers: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  isOpenAction: number | null = null;
  isEditMode: boolean = false;
  userForm!: FormGroup;
  projectForm!: FormGroup;
  swalOptions: SweetAlertOptions = {};
  isSubmitting: boolean;
  spin: boolean;
  apps: App[] = [];
  windowObj: any = window;
  fileUrl = this.windowObj.__env.fileUrl;
  isEdit: boolean = false;
  constructor(
    private readonly masterAppService: MasterAppService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly cloudPosService: CloudPosService,
    private _modalService: NgbModal
  ) {}
  @ViewChild('noticeSwal', { static: false }) noticeSwal!: SwalComponent;
  ngOnInit(): void {
    this.getAllMasterUser();
    this.inituserForm();
    this.initProjectForm();
  }
  public initProjectForm(): void {
    this.projectForm = this.fb.group({
      userID: [],
      ProjectListId: [''],
    });
  }

  private inituserForm(): void {
    this.userForm = this.fb.group({
      userID: [''],
      userName: ['', Validators.required],
      password: [''],
      shopID: [''],
      employeeID: [''],
      fullName: [''],
      email: ['', Validators.email],
      designationID: [''],
      mobileNo: [''],
      address: [''],
      inActive: [false],
    });
  }
  careateOrEditModalPopUp(createOrUpdateModal: any, data?: any): void {
    debugger;
    this.isEditMode = !!data?.userID; // <-- add this line
    if (this.isEditMode) {
      this.userForm.patchValue({
        userID: data.userID,
        userName: data.userName,
        fullName: data.fullName,
        email: data.email,
        mobileNo: data.mobileNo,
        address: data.address,
        password: data.password,
        designationID: data.designationID,
        shopID: data.shopID,
        employeeID: data.employeeID,
        inActive: data.inActive,
      });
    } else {
      this.userForm.reset({ inActive: false });
    }

    this._modalService.open(createOrUpdateModal, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  onProjectCheckChange(app: any, event: Event) {
    const input = event.target as HTMLInputElement;
    app.isChecked = input.checked;

    // Rebuild list of selected ids
    const selectedIds = this.apps.filter((x) => x.isChecked).map((x) => x.id);

    this.projectForm.patchValue({
      ProjectListId: selectedIds.join(','),
    });

    console.log('Updated ProjectListId:', this.projectForm.value.ProjectListId);
  }

  onAddProject(projectModal: any, user: any) {
    this.projectForm.patchValue({
      userID: user,
    });
    this.isEdit = true;
    this.getProjects(user);
    this._modalService.open(projectModal, {
      size: 'lg',
      backdrop: 'static',
    });
  }
  closeDropdown(): void {
    this.isOpenAction = null;
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

  onProjectSubmit() {
    if (!this.projectForm.valid) {
      return;
    }

    const dto = {
      userID: this.projectForm.value.userID,
      projectListId: this.projectForm.value.ProjectListId,
    };

    const request = this.masterAppService.UserProjectUpdate(dto);

    request.subscribe({
      next: (res: any) => {
        debugger;
        const isSuccess = res?.succeeded === true;
        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.Messages?.[0] ?? 'User updated successfully.';
          this.swalOptions.icon = 'success';
          this.getAllMasterUser();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.Messages?.[0] ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
        this.userForm.reset({ InActive: false });
      },
      error: () => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text = 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
      },
    });
  }

  onSubmit(): void {
    debugger;
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const isEdit =  this.isEditMode;

    // Create a plain JavaScript object matching the DTO
    const userDto = {
      UserID: this.userForm.get('userID')?.value,
      UserName: this.userForm.get('userName')?.value,
      Password: this.userForm.get('password')?.value,
      ShopID: this.userForm.get('shopID')?.value,
      EmployeeID: this.userForm.get('employeeID')?.value,
      FullName: this.userForm.get('fullName')?.value,
      Email: this.userForm.get('email')?.value,
      DesignationID: this.userForm.get('designationID')?.value,
      MobileNo: this.userForm.get('mobileNo')?.value,
      Address: this.userForm.get('address')?.value,
      InActive: this.userForm.get('inActive')?.value,
    };

    const request = isEdit
      ? this.masterAppService.updateUser(userDto) // Assuming updateUser also expects JSON
      : this.masterAppService.createUser(userDto); // Pass the JSON object

    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.succeeded === true;
        if (isSuccess) {
          if (isEdit) {
            this.swalOptions.title = 'Success!';
            this.swalOptions.text =
              res?.Messages?.[0] ?? 'User updated successfully.';
            this.swalOptions.icon = 'success';
            this.getAllMasterUser();
          } else {
            this.swalOptions.title = 'Created!';
            this.swalOptions.text =
              res?.Messages?.[0] ?? 'User created successfully.';
            this.swalOptions.icon = 'success';
            this.getAllMasterUser();
          }
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.Messages?.[0] ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
        this.userForm.reset({ InActive: false });
      },
      error: () => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text = 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
      },
    });
  }

  getProjects(userId: string) {
    this.cloudPosService.getProjects(userId).subscribe({
      next: (res: any) => {
        this.apps = res ?? [];

        // collect pre-checked IDs into comma-separated string
        const selectedIds = this.apps
          .filter((x) => x.isChecked)
          .map((x) => x.id)
          .join(',');

        // update form with userId + ProjectListId
        this.projectForm.patchValue({
          userID: userId,
          ProjectListId: selectedIds,
        });

        console.log(
          'Initial ProjectListId:',
          this.projectForm.value.ProjectListId
        );
        console.log('Projects loaded:', this.apps);
      },
      error: (err) => {
        console.error('Failed to load projects', err);
      },
    });
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
