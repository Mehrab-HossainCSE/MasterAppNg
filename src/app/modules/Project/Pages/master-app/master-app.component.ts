import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { MasterAppService } from '../../Services/master-app.service';
import { CloudPosService } from '../../Services/cloud-pos.service';
import { App } from '../../Models/AppResponse';
import { VATProService } from '../../Services/vat-pro.service';
import { SorolSoftService } from '../../Services/sorol-soft.service';
import { BillingSoftwareService } from '../../Services/billing-software.service';

@Component({
  selector: 'app-master-app',
  standalone: false,

  templateUrl: './master-app.component.html',
  styleUrl: './master-app.component.scss',
})
export class MasterAppComponent implements OnInit {
  allUsers: any[] = [];
  allPrivilegeSorol: any[] = [];
  branchList: any[] = [];
  allDesignations: any[] = [];
  allRoleVatPro: any[] = [];
  allRoleBilling: any[] = [];
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
  loadCompnayListSorol: any[] = [];
  windowObj: any = window;
  fileUrl = this.windowObj.__env.fileUrl;
  isEdit: boolean = false;
   currentStep: number = 1;
  totalSteps: number = 2;
  constructor(
    private readonly masterAppService: MasterAppService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly cloudPosService: CloudPosService,
    private _modalService: NgbModal,
    private readonly vatProService: VATProService,
    private readonly  sorolSoftService: SorolSoftService,
    private readonly billingSoft: BillingSoftwareService,
    private readonly sorolSoftwareServie: SorolSoftService,
  ) {}
  @ViewChild('noticeSwal', { static: false }) noticeSwal!: SwalComponent;
  ngOnInit(): void {
debugger;
 const vatToken = localStorage.getItem('vatProToken');
  if (vatToken) {
    const tokenData = JSON.parse(vatToken);
    const now = new Date().getTime();
    console.log('Current Time:', now);
    console.log('Token Expiry:', tokenData.expiry);
    
    if (now > tokenData.expiry) {     
      localStorage.removeItem('vatProToken');        
       const menuListJson = localStorage.getItem('masterAppMenuList');
    if (!menuListJson) return;
    debugger;
    const menuList = JSON.parse(menuListJson);
    const vatPro = menuList.find((p: any) => p.id === 30);
    if (!vatPro) return;

    const username = vatPro.userName;
    const encryptedPassword = vatPro.password;

    const decryptedPassword = this.vatProService.decrypt(encryptedPassword);
    console.log('Decrypted Password:', decryptedPassword); // For debugging only, remove in production
    this.getTokenVatPro(username, decryptedPassword);
    } 
  }
else{
      const menuListJson = localStorage.getItem('masterAppMenuList');
       if (!menuListJson) return;
       const menuList = JSON.parse(menuListJson);
    const vatPro = menuList.find((p: any) => p.id === 30);
    if (!vatPro) return;

    const username = vatPro.userName;
    const encryptedPassword = vatPro.password;

    const decryptedPassword = this.vatProService.decrypt(encryptedPassword);
    console.log('Decrypted Password:', decryptedPassword); // For debugging only, remove in production
    this.getTokenVatPro(username, decryptedPassword);
    }
  


    this.getAllMasterUser();
    this.initCombinedForm();
    this.loadAllDesignation();
    this.loadAllBranch();
    this.getRole();
    this.getCompanyListSorol();
    this.getRoleBilling();
    this.getAllPrivilegeSorol();

   



  }
getTokenVatPro(username: any, password: any) {
  debugger;
    this.vatProService.vatProToken(username, password).subscribe({
      next: (data: any) => {
        const now = new Date();
        const expiry = now.getTime() + 15 * 60 * 1000; // 15 minutes in ms

        const tokenData = {
          token: data.token,
          expiry: expiry,
        };
        debugger;
        localStorage.setItem('vatProToken', JSON.stringify(tokenData));
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }


  getCompanyListSorol() {
    debugger;
    this.sorolSoftService.loadCompanyList().subscribe({
      next: (data: any) => {
        this.loadCompnayListSorol = data;
        console.error('Failed to load navigation list', this.loadCompnayListSorol);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
  getRole() {
    debugger;
    this.vatProService.getRole().subscribe({
      next: (data: any) => {
        this.allRoleVatPro = data.Data;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
  getRoleBilling() {
    debugger;
    this.billingSoft.getRoleBilling().subscribe({
      next: (data: any) => {
        this.allRoleBilling = data;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
   loadAllBranch(): void {
    this.vatProService.getAllBranch().subscribe({
      next: (res) => {
        this.branchList = res.Data;
      },
      error: (err) => {
        console.error('Error fetching branch menus:', err);
      },
    });
  }
   loadAllDesignation(): void {
    this.vatProService.getAllDesignation().subscribe({
      next: (res) => {
        this.allDesignations = res.Data;
      },
      error: (err) => {
        console.error('Error fetching designations:', err);
      },
    });
  }
private initCombinedForm(): void {
    this.userForm = this.fb.group({   
      userID: [''],
      userName: ['', [Validators.required,Validators.min(4)]],
      password: ['', [Validators.required]],
      fullName: [''],
      email: ['', [Validators.required, Validators.email]],
      shopID: [''],
      employeeID: [''],
      employeeName: [''],
      designationID: ['',[Validators.required]],
      mobileNo: ['',[Validators.required]],
      address: ['',[Validators.required]],
      inActive: [false],
      RoleId: [null,[Validators.required]],
      companyCode: [''],
      productPricePermission: [''],
      
      RoleIdBilling: [''],
   
      NID : ['',[Validators.required]],
      branch: ['',[Validators.required]],
      companyIdSorol: [''], 
      IMEI : [''],
      expairsOn : [''],
      RoleIdSorol: [''],
      IsMobileAppUser : [false],
      sorolMenuIdList : [''],
      ProjectListId: ['']
    });
  }

onRoleSorolChange(event: Event) {
  // find the selected role object
  const value = (event.target as HTMLSelectElement).value;
  const selectedRole = this.allPrivilegeSorol.find(r => r.rolename === value);

  if (selectedRole) {
    // collect menuIDs and prefix with "-"
  const menuIds = selectedRole.menuRoles.map((m: any) => `${m.menuID}`);
  


    // join with comma
    const joinedMenuIds = menuIds.join(",");

    // patch to form
    this.userForm.patchValue({
      sorolMenuIdList: joinedMenuIds
    });

   
    console.log("sorolMenuIdList:", joinedMenuIds);
  } else {
    this.userForm.patchValue({ sorolMenuIdList: "" });
  }
}


 getAllPrivilegeSorol(): void {
    this.sorolSoftwareServie.getAllPrivilege().subscribe({
      next: (res) => {
        this.allPrivilegeSorol = res ?? [];
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      },
    });
  }








  createOrEditModalPopUp(createOrUpdateModal: any, data?: any): void {
    this.isEditMode = !!data?.userID;
    this.currentStep = 1; // Always start from step 1
    debugger
    if (this.isEditMode) {
      // Edit mode - populate user data
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
      ProjectListId: data.projectListId,
        RoleId: data.roleId,
        companyCode: data.companyCode,
      });
        
           this.getProjects(data.projectListId);
    } else {
     
      this.userForm.reset({ inActive: false });
      this.getProjects();
    }

    this._modalService.open(createOrUpdateModal, {
      size: 'xl',
      backdrop: 'static',
      centered: true,
    });
  }
 nextStep() {
    if (this.currentStep === 1 && this.isUserFormValid()) {
      
      this.currentStep++;
    }
  }
   isUserFormValid(): boolean {
    const userFields = ['userName', 'password', 'email'];
    return userFields.every(field => {
      const control = this.userForm.get(field);
      return control && control.valid;
    });
  }

  // Get step title
  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return this.isEditMode ? 'Edit User Information' : 'Create New User';
      case 2: return 'Assign Projects';
      default: return '';
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  onProjectCheckChange(app: any, event: Event) {
    debugger;
    const input = event.target as HTMLInputElement;
    app.isChecked = input.checked;

    // Rebuild list of selected ids
    const selectedIds = this.apps.filter((x) => x.isChecked).map((x) => x.id);

    this.userForm.patchValue({
      ProjectListId: selectedIds.join(','),
    });

    console.log('Updated ProjectListId:', this.projectForm.value.ProjectListId);
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



  onSubmit(modal: any): void {
    debugger;
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
  
const selectedCompanies = this.userForm.get('companyIdSorol')?.value || [];
  console.log('Selected Companies:', selectedCompanies);

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
      inActive: this.userForm.get('inActive')?.value,
      ProjectListId: this.userForm.get('ProjectListId')?.value,
      CreateBy: 'system',
      RoleId: this.userForm.get('RoleId')?.value,
      companyCode: this.userForm.get('companyCode')?.value,
      productPricePermission: this.userForm.get('productPricePermission')?.value,
      branch: this.userForm.get('branch')?.value,      
      NID : this.userForm.get('NID')?.value,
      CreateDate: new Date().toISOString(),
      companyIdSorol: selectedCompanies.join(','), // Assuming this is a comma-separated string
      IMEI : this.userForm.get('IMEI')?.value,
      ExpairsOn: this.userForm.get('expairsOn')?.value 
  ? new Date(this.userForm.get('expairsOn')?.value).toISOString() 
  : null,
      IsMobileAppUser : this.userForm.get('IsMobileAppUser')?.value?? false,
      RoleIdBilling: this.userForm.get('RoleIdBilling')?.value,
      RoleIdSorol: this.userForm.get('RoleIdSorol')?.value,
      sorolMenuIdList : this.userForm.get('sorolMenuIdList')?.value,
    };
 
debugger;
    const request = isEdit
      ? this.masterAppService.updateUser(userDto) // Assuming updateUser also expects JSON
      : this.masterAppService.createUser(userDto); // Pass the JSON object

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

    this.isSubmitting = false;
    this.userForm.reset({ InActive: false });
    this.userForm.reset({ inActive: false });
    this.apps.forEach(app => {
      app.isChecked = false;
    });
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
selectAllProjects() {
  this.apps.forEach(app => app.isChecked = true);

  const ids = this.apps.map(app => app.id.toString()).join(",");

  this.userForm.get('ProjectListId')?.setValue(ids);
}

goToStep(step: number) {
    // Validate navigation rules
    if (step === 1) {
      // Can always go to step 1
      this.currentStep = step;
    } else if (step === 2) {
      // Can only go to step 2 if user form is valid
      if (this.isUserFormValid()) {
        this.currentStep = step;
        // Load projects when moving to step 2 (if not already loaded)
        if (!this.isEditMode && this.apps.length === 0) {
          this.getProjects();
        }
      } else {
        // Mark form as touched to show validation errors
        this.userForm.markAllAsTouched();
        console.warn('Cannot navigate to step 2: User form is invalid');
      }
    }
  }
  deselectAllProjects() {
    this.apps.forEach(app => app.isChecked = false);
    this.userForm.get('ProjectListId')?.setValue('');
  }
  // getProjects(projectListId?: string) {
  //   this.cloudPosService.getProjects().subscribe({
  //     next: (res: any) => {
  //       this.apps = res ?? [];
       
       
  //       const selectedIds = this.apps
  //         .filter((x) => x.isChecked)
  //         .map((x) => x.id)
  //         .join(',');

       

  //       console.log(
  //         'Initial ProjectListId:',
  //         this.projectForm.value.ProjectListId
  //       );
  //       console.log('Projects loaded:', this.apps);
  //     },
  //     error: (err) => {
  //       console.error('Failed to load projects', err);
  //     },
  //   });
  // }
getProjects(projectListId?: string) {
  this.cloudPosService.getProjects().subscribe((res: any[]) => {
    this.apps = res;

    if (projectListId) {
      const selectedIds = projectListId.split(',');
      this.apps.forEach(app => {
        app.isChecked = selectedIds.includes(app.id.toString());
      });
    }
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
