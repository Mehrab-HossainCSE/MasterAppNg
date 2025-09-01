import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { SorolSoftService } from '../../Services/sorol-soft.service';

@Component({
  selector: 'app-sorol-soft',
  standalone: false,
  
  templateUrl: './sorol-soft.component.html',
  styleUrl: './sorol-soft.component.scss'
})
export class SorolSoftComponent implements OnInit {
  selectedTab: string = 'nav';
  isEditMode: boolean = false;
  navList: any[] = [];
  NavCreateForm!: FormGroup;
  RoleCreateForm!: FormGroup;
  spin: boolean;
  isOpenAction: number | null = null;
  parentMenuList: any[] = [];
  isSubmitting: boolean;
   addedRoles: any[] = [];
      menusByRole: any[] = [];
   selectedRoleId:any=0;
   allUsers:any[]=[];
   currentUserId:any=0;
   currentUserName:any=null;
   roleMenu: any[] = [];
  allPrivilege: any[] = [];
    assignedMenus1: any[] = [];
  availableMenus1: any[] = [];
  currentUserID: any = null;
  currentUser: any = null;
  companyInfo: any = null;
   selectedRoles: string[] = [];
  selectedRoles1Grouped: { rolename: string; menuRoles: any[] }[] = [];

swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;
  isLoading: boolean;
  privilegeModalRef: any;
  constructor(
    private readonly sorolSoftwareServie: SorolSoftService,
    private readonly cdr: ChangeDetectorRef,
    private readonly _modalService: NgbModal,
    private readonly fb: FormBuilder
  ) {}
  ngOnInit(): void {
    this.initNavCreateForm();
    this.getNavList();
    this.loadParentMenus();
    this.getRole();
    this.initRoleCreateForm();
    this.getAllUser();
  }
 
  getNavList() {
    this.sorolSoftwareServie.getAllNav().subscribe({
      next: (data: any) => {
        this.navList = data;
        console.log('Navigation list loaded:', this.navList);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
  private initRoleCreateForm(): void {
    this.RoleCreateForm = this.fb.group({
      RoleId: [null],
      RoleName: ['', Validators.required],
      IsActive: [true],
    });
  }
  private initNavCreateForm(): void {
    this.NavCreateForm = this.fb.group({
      MenuID: [null, Validators.required],
      ParentID: [null],
      IsParent: [false],
      ModuleID: [null],
      Text: ['', Validators.required],
      URL: [
        '#',
        [Validators.required, Validators.pattern('^(https?:\\/\\/|#).+')],
      ],
      REL: ['', Validators.required],
      Serial: [null, Validators.required],
      
     
    });
  }
 createOrEditRoleModal(roleCreateOrUpdateModal: any, data?: any){
if (data?.RoleId != null) {
      this.isEditMode = true;
      this.RoleCreateForm.patchValue({
        RoleId: data.RoleId,
        RoleName: data.RoleName ?? null,
        IsActive: data.IsActive ?? false,
      });
    } else {
      this.RoleCreateForm.reset({
        RoleId: null,
        RoleName: '',  

        IsActive: true,
      });
    }

    const modalRef = this._modalService.open(roleCreateOrUpdateModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result
      .then(
        (result) => {},
        (reason) => {}
      )
      .finally(() => {
        this.isEditMode = false;
        this.RoleCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
      });
 }
 onGivePrivilege( privilegeModal: any,user: any): void {
    debugger;
    this.availableMenus1 = [];
    this.assignedMenus1 = [];

    this.currentUser = user.userId;
    this.currentUserID = user.id;
    this.privilegeModalRef = this._modalService.open(privilegeModal, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
    this.privilegeModalRef.result
      .then(
        (result: any) => {
        
        },
        (reason: any) => {
         
        }
      )
      .finally(() => {
        this.availableMenus1 = [];
        this.assignedMenus1 = [];
        this.selectedRoles1Grouped = [];
        this.NavCreateForm.reset();
        this.privilegeModalRef = null;
      });
  }
 roleSumbit(){
  debugger
  if(!this.selectedRoleId){
     Swal.fire({
    icon: 'warning',
    title: 'Oops...',
    text: ' Role not selected!',
  });
  return;
   
  }
   const payload = {
    RoleId: this.selectedRoleId,
    Id:this.currentUserId,
  };
   const request = 
     this.sorolSoftwareServie.updateRolePerUser(payload)
    

  request.subscribe({
    next: (res: any) => {
      const isSuccess = res?.succeeded === true; // note: backend uses `Succeeded`

      if (isSuccess) {
        this.swalOptions.title =  'Updated!' ;
        this.swalOptions.text =
          res?.messages?.[0] ??
          ( 'Role updated successfully.' );
        this.swalOptions.icon = 'success';

        this.getRole();
      } else {
        this.swalOptions.title = 'Error';
        this.swalOptions.text = res?.messages?.[0] ?? 'Something went wrong.';
        this.swalOptions.icon = 'error';
      }

      this.showAlert(this.swalOptions);
      this.isSubmitting = false;
      this.RoleCreateForm.reset({ isActive: false });
      this.isEditMode = false;
    },
    error: (error) => {
      this.swalOptions.title = 'Error';
      this.swalOptions.text =
        error?.error?.message || 'Server error occurred. Please try again.';
      this.swalOptions.icon = 'error';
      this.showAlert(this.swalOptions);
      this.isSubmitting = false;
    },
  });

 }

  createOrEditModalPopUp(createOrUpdateModal: any, data?: any) {
    debugger;
    if (data?.menuID != null) {
      this.isEditMode = true;
      this.NavCreateForm.patchValue({
        MenuID: data.menuID,
        ParentID: data.parentID ?? 0,
        Text: data.text || '',
        URL: data.url || '',
        Serial: data.serial || '',
        ModuleID: data.moduleID || '',
        REL: data.rel || '',
      });
    } else {
      this.NavCreateForm.reset({
        MenuID: 0,
        ParentID: 0,
        Text: '',
        URL: '',
        Serial: 0,
        ModuleID: 0,
        REL: '',
      });
       
    }

    const modalRef = this._modalService.open(createOrUpdateModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result
      .then(
        (result) => {},
        (reason) => {}
      )
      .finally(() => {
        this.isEditMode = false;
        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
      });
  }
   onRoleChange() {
    debugger;
     this.menusByRole=[];
    // 👉 in real app, call API here
     this.sorolSoftwareServie.getRoleByRoleID(this.selectedRoleId ).subscribe({
      next: (data: any) => {
        this.menusByRole = data;
        console.log('menusByRole list loaded:', this.menusByRole);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
    console.log('Selected RoleId:', this.selectedRoleId );
    
  }

  getRole() {
    this.sorolSoftwareServie.getRole().subscribe({
      next: (data: any) => {
        this.addedRoles = data;
        this.allPrivilege = data;
        console.log('Navigation list loaded:', this.navList);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
    loadParentMenus(): void {
    this.sorolSoftwareServie.GetParentNav().subscribe({
      next: (res) => {
        this.parentMenuList = res;
      },
      error: (err) => {
        console.error('Error fetching parent menus:', err);
      },
    });
  }
  toggleParentCheckbox(menu: any) {
    console.log('Toggling parent checkbox for menu:', menu);
    menu.isChecked = !menu.isChecked;
    debugger;
    if (menu.children) {
      menu.children.forEach((child: any) => {
        child.isChecked = menu.isChecked;
      });
    }
    this.cdr.detectChanges();
  }

  getAllUser(): void {
    this.sorolSoftwareServie.getAllUser().subscribe({
      next: (res) => {
        this.allUsers = res ?? [];
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }

 assignMenu( menuModal: any,ID: number): void {
    this.spin = true;
    debugger;
    this.sorolSoftwareServie.assignMenu(ID).subscribe({
      next: (data: any) => {
        this.roleMenu = data;
        console.log('Projects loaded:', this.roleMenu);
        this.spin = false;
        this.selectedRoleId = ID;
        this.cdr.detectChanges();
        this._modalService.open(menuModal, {
          size: 'xl',
          keyboard: false,
          backdrop: 'static',
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load projects', err);
        this.spin = false;
      },
    });
  }



   menuOnSubmit(event?: Event, myForm?: NgForm) {
      if (event) event.preventDefault();
      if (myForm?.invalid) return;
      debugger;
      this.isLoading = true;
  
      const selectedMenuIds: number[] = [];
  
      for (const parent of this.roleMenu) {
        if (parent.isChecked) selectedMenuIds.push(parent.menuID);
        if (parent.children?.length > 0) {
          for (const child of parent.children) {
            if (child.isChecked) selectedMenuIds.push(child.menuID);
          }
        }
      }
  
      const dto = {
        RoleId: this.selectedRoleId,
        MenuListID: selectedMenuIds.join(','),
      };

      this.sorolSoftwareServie.menuOnSubmit(dto).subscribe({
        next: (res) => {
          const isSuccess = res?.success === true;
          this.swalOptions.title = isSuccess ? 'Success!' : 'Error';
          this.swalOptions.text =
            res?.message ?? (isSuccess ? 'Updated.' : 'Failed.');
          this.swalOptions.icon = isSuccess ? 'success' : 'error';
          this.showAlert(this.swalOptions);
  
          if (isSuccess) {
            this.getNavList();
          }
  
          this.isLoading = false;
        },
        error: (error) => {
          this.swalOptions.title = 'Error';
          this.swalOptions.text =
            error?.error?.message || 'Server error occurred.';
          this.swalOptions.icon = 'error';
          this.showAlert(this.swalOptions);
          this.isLoading = false;
        },
      });
    }


  UpdateNav() {
    debugger;
    const checkedMenus = this.navList
      .map((parent) => {
        const checkedChildren = (parent.children || []).filter(
          (children: { isChecked: any }) => children.isChecked
        );

        if (parent.isChecked || checkedChildren.length > 0) {
          return {
            ...parent,
            children: checkedChildren,
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    console.log('Checked Menu:', checkedMenus);
    this.sorolSoftwareServie.updateCheckedNavItems(checkedMenus).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true ;

        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.data ?? 'Navigation updated successfully.';
          this.swalOptions.icon = 'success';

          this.getNavList();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;

        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
        this.isEditMode = false;
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
      },
    });
  }
  toggleChildCheckbox(child: any, parent: any) {
    debugger;

    child.isChecked = !child.isChecked;

    if (!Array.isArray(parent.children)) {
      console.error('parent.Children is not an array:', parent.Children);
      return;
    }

    const allChildrenChecked = parent.children.every(
      (c: { isChecked: any }) => c.isChecked
    );

    const noChildrenChecked = parent.children.every(
      (c: { isChecked: any }) => !c.isChecked
    );

    if (allChildrenChecked) {
      parent.isChecked = true;
    } else if (noChildrenChecked) {
      parent.isChecked = false;
    } else {
      parent.isChecked = true;
    }

    this.cdr.detectChanges();
  }
 roleOnSubmit(): void {
  if (this.RoleCreateForm.invalid) {
    this.RoleCreateForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  const isEdit = this.isEditMode;

  // ✅ Build plain JSON object instead of FormData
  const rolePayload = {
    RoleId: this.RoleCreateForm.get('RoleId')?.value,
    RoleName: this.RoleCreateForm.get('RoleName')?.value ?? '',
    IsActive: this.RoleCreateForm.get('IsActive')?.value ?? false,
  };

  const request = isEdit
    ? this.sorolSoftwareServie.updateRole(rolePayload)
    : this.sorolSoftwareServie.createRole(rolePayload);

  request.subscribe({
    next: (res: any) => {
      const isSuccess = res?.succeeded === true; // note: backend uses `Succeeded`

      if (isSuccess) {
        this.swalOptions.title = isEdit ? 'Updated!' : 'Created!';
        this.swalOptions.text =
          res?.messages?.[0] ??
          (isEdit ? 'Role updated successfully.' : 'Role created successfully.');
        this.swalOptions.icon = 'success';

        this.getRole();
      } else {
        this.swalOptions.title = 'Error';
        this.swalOptions.text = res?.messages?.[0] ?? 'Something went wrong.';
        this.swalOptions.icon = 'error';
      }

      this.showAlert(this.swalOptions);
      this.isSubmitting = false;
      this.RoleCreateForm.reset({ isActive: false });
      this.isEditMode = false;
    },
    error: (error) => {
      this.swalOptions.title = 'Error';
      this.swalOptions.text =
        error?.error?.message || 'Server error occurred. Please try again.';
      this.swalOptions.icon = 'error';
      this.showAlert(this.swalOptions);
      this.isSubmitting = false;
    },
  });
}


  onSubmit(): void {
    debugger;
    if (this.NavCreateForm.invalid) {
      this.NavCreateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const isEdit = this.isEditMode;
    const formData = new FormData();

    formData.append('MenuID', this.NavCreateForm.get('MenuID')?.value);
    formData.append(
      'ParentID',
      this.NavCreateForm.get('ParentID')?.value ?? ''
    );
    formData.append('IsParent', this.NavCreateForm.get('IsParent')?.value);
    formData.append(
      'Text',
      this.NavCreateForm.get('Text')?.value
    );
    formData.append('URL', this.NavCreateForm.get('URL')?.value ?? '');
    formData.append('REL', this.NavCreateForm.get('REL')?.value ?? '');
    formData.append('Sorting', this.NavCreateForm.get('Sorting')?.value);
    formData.append('ModuleID', this.NavCreateForm.get('ModuleID')?.value);
      formData.append('Serial', this.NavCreateForm.get('Serial')?.value);
    const request = isEdit
      ? this.sorolSoftwareServie.updateNav(formData)
      : this.sorolSoftwareServie.createNav(formData);

    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.success === true ;

        if (isSuccess) {
          this.swalOptions.title = isEdit ? 'Updated!' : 'Created!';
          this.swalOptions.text =
            res?.Messages?.[0] ??
            (isEdit ? 'Navigation updated.' : 'Navigation created.');
          this.swalOptions.icon = 'success';

          this.getNavList();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
        this.isEditMode = false;
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
      },
    });
  }

 onPrivilegeSubmit() {
    debugger;
    if (this.assignedMenus1.length === 0) {
      return;
    }

    this.isSubmitting = true;

    const dto = {
      ID: this.currentUserID,
      MenuIdList: this.assignedMenus1.map((menu) => menu.serial).join(','),
    };
    console.log('Submitting privilege data:', dto);
    this.sorolSoftwareServie.assignedUserMenus(dto).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true;

        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.data ?? 'Navigation updated successfully.';
          this.swalOptions.icon = 'success';
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;

        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
        this.isEditMode = false;
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
      },
    });
  }
   trackByFn(index: number, item: any): any {
    return item.rolE_NAME || index;
  }
  isAllSelected(
    items: any[],
    selectedItems: any[],
    valueProperty: string
  ): boolean {
    if (!items || items.length === 0 || !selectedItems) {
      return false;
    }
    return items.length === selectedItems.length;
  }
  selectAll(isChecked: boolean, items: any[], valueProperty: string): any[] {
    if (isChecked) {
      return items.map((item) => item[valueProperty]);
    } else {
      return [];
    }
  }
   onSelectAllChange(event: Event): void {
    debugger;
    const target = event.target as HTMLInputElement;
    this.selectedRoles = this.selectAll(
      target.checked,
      this.allPrivilege,
      'rolename'
    );
    // Trigger the role selection change
    this.onRoleSelectionChange(this.selectedRoles);
  }
 onRoleSelectionChange(selectedRoleNames: string[]) {
    this.selectedRoles1Grouped = [];

    for (const roleName of selectedRoleNames) {
      const privilege = this.allPrivilege.find((p) => p.rolename === roleName);

      if (privilege && privilege.menuRoles) {
        this.selectedRoles1Grouped.push({
          rolename: privilege.rolename,
          menuRoles: [...privilege.menuRoles],
        });
      }
    }
  }
onRoleSelectionChangeIndividul(selectedRoleName: string, event: any) {
    const isChecked = event.target.checked;

    if (isChecked) {
      // ✅ Add role
      const privilege = this.allPrivilege.find(
        (p) => p.rolename === selectedRoleName
      );

      if (privilege && privilege.menuRoles) {
        const alreadyExists = this.selectedRoles1Grouped.find(
          (p) => p.rolename === selectedRoleName
        );

        if (!alreadyExists) {
          this.selectedRoles1Grouped.push({
            rolename: privilege.rolename,
            menuRoles: privilege.menuRoles,
          });
          this.selectedRoles = [...this.selectedRoles, selectedRoleName];
          console.log('Selected RolesPlaceholder:', this.selectedRoles);
        }
      }
    } else {
      // ❌ Remove role
      this.selectedRoles1Grouped = this.selectedRoles1Grouped.filter(
        (p) => p.rolename !== selectedRoleName
      );
      this.selectedRoles = this.selectedRoles.filter(
        (r) => r !== selectedRoleName
      );
    }
  }
    onAssignAllMenusToggle(event: any) {
    const isChecked = event.target.checked;
    debugger;

    if (isChecked) {
      this.selectedRoles1Grouped.forEach((group) => {
        group.menuRoles.forEach((menu) => {
          const menuWithRole = { ...menu, rolename: group.rolename };

          const exists = this.assignedMenus1.some(
            (m) => m.serial === menu.serial
          );

          if (!exists) {
            this.assignedMenus1.push(menuWithRole);
          }
        });
      });
    } else {
      this.assignedMenus1 = [];
    }
  }
  moveToAssigned(menu: any) {
    this.availableMenus1 = this.availableMenus1.filter(
      (m) => m.serial !== menu.serial
    );

    if (!this.assignedMenus1.find((m) => m.serial === menu.serial)) {
      this.assignedMenus1.push(menu);
    }
  }
moveToAvailable(menu: any) {
    this.assignedMenus1 = this.assignedMenus1.filter(
      (m) => m.serial !== menu.serial
    );

    const existsInSelectedRoles = this.selectedRoles1Grouped.some((role) =>
      role.menuRoles.some((roleMenu: any) => roleMenu.serial === menu.serial)
    );

    if (
      existsInSelectedRoles &&
      !this.availableMenus1.find((m) => m.serial === menu.serial)
    ) {
      this.availableMenus1.push(menu);
    }
  }
showAlert(swalOptions: SweetAlertOptions) {
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
