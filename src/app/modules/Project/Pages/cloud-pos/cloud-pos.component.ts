import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { CloudPosService } from '../../Services/cloud-pos.service';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cloud-pos',
  standalone: false,

  templateUrl: './cloud-pos.component.html',
  styleUrl: './cloud-pos.component.scss',
})
export class CloudPosComponent implements OnInit {
  selectedTab: string = 'nav';
  spin: boolean;
  navList: any[] = [];
  isLoading = false;
  NavCreateForm!: FormGroup;
  swalOptions: SweetAlertOptions = {};
  isEditMode: boolean = false;
  parentMenuList: any[] = [];
  isOpenAction: number | null = null;
  selectedRole: string = '';
  addedRoles: any[] = [];
  addedRole: string | null = null;
  roleMenu: any[] = [];
  selectedRoleId: number | null = null;
  allUsers: any[] = [];
  allPrivilege: any[] = [];
privilegeModalRef: any;
  assignedMenus1: any[] = [];
  availableMenus1: any[] = [];
  currentUserID:any= null;
  currentUser: any = null;
  selectedRoles1Grouped: { rolename: string; menuRoles: any[] }[] = [];
  allRoles: string[] = [
    'Accounts Manager',
    'Administrator',
    'Executive Accounts',
    'Executive Director',
    'Executive IT',
    'Executive POS',
    'Executive Purchase',
    'Executive Store',
    'Floor Manager',
    'IT Manager',
    'Purchase Manager',
    'StoreManager',
    'Supervisor Floor',
    'Supervisor Sub Store',
  ];
  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;
  isSubmitting: boolean;

  constructor(
    private readonly cloudPosService: CloudPosService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly _alertType: AlertTypeService,
    private readonly _modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.selectedTab = 'nav';
    this.initNavCreateForm();
    this.loadParentMenus();
    this.getRole();
    this.getNavList();
    this.getAllUser();
    this.getAllPrivilege();
  }
  private initNavCreateForm(): void {
    this.NavCreateForm = this.fb.group({
      SERIAL: [null, Validators.required],
      PARENT_ID: [null],
      IsParent: [false],
      DESCRIPTION: ['', Validators.required],
      URL: [''],
      PER_ROLE: ['', Validators.required],
      ENTRY_BY: ['', Validators.required],

      ORDER_BY: [null, Validators.required],
      FA_CLASS: [''],
      MENU_TYPE: ['', Validators.required],
      SHOW_EDIT_PERMISSION: [false],
    });
  }
  getSelectedOptions(selectElement: HTMLSelectElement): string[] {
    const selectedValues: string[] = [];
    for (const option of Array.from(selectElement.selectedOptions)) {
      selectedValues.push(option.value);
    }
    return selectedValues;
  }

  get availableRoles(): string[] {
    return this.allRoles.filter(
      (role) => !this.addedRoles?.some((added) => added.rolename === role)
    );
  }
  onGivePrivilege(user: any, privilegeModal: any): void {
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
          console.log('Closed with:', result);
        },
        (reason: any) => {
          console.log('Dismissed with:', reason);
        }
      )
      .finally(() => {
        // Reset data when modal closes
        this.availableMenus1 = [];
        this.assignedMenus1 = [];
        this.selectedRoles1Grouped = [];
        this.NavCreateForm.reset();
        this.privilegeModalRef = null;
      });
  }


  onRoleSelectionChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;

    debugger;

    const selectedRoleNames: string[] = Array.from(
      selectElement.selectedOptions
    ).map((opt) => opt.value);

    for (const rolename of selectedRoleNames) {
      const privilege = this.allPrivilege.find((p) => p.rolename === rolename);

      if (privilege && privilege.menuRoles) {
        // Avoid duplicate rolename in group
        const alreadyExists = this.selectedRoles1Grouped.find(
          (p) => p.rolename === rolename
        );
        if (!alreadyExists) {
          this.selectedRoles1Grouped.push({
            rolename: privilege.rolename,
            menuRoles: privilege.menuRoles,
          });
        }
      }
    }

    console.log('Selected grouped menus:', this.selectedRoles1Grouped);
  }

  getAllUser(): void {
    this.cloudPosService.getAllUser().subscribe({
      next: (res) => {
        this.allUsers = res ?? [];
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }
  getAllPrivilege(): void {
    this.cloudPosService.getAllPrivilege().subscribe({
      next: (res) => {
        this.allPrivilege = res ?? [];
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      },
    });
  }
  addRole(): void {
    if (this.selectedRole) {
      debugger;
      this.addedRole = this.selectedRole;
      this.selectedRole = '';
      const dto = {
        ID: 0,
        ROLENAME: this.addedRole,
        MENULISTID: null,
      };
      this.cloudPosService.addRole(dto).subscribe({
        next: (res) => {
          const isSuccess = res?.success === true;

          if (isSuccess) {
            this.swalOptions.title = 'Success!';
            this.swalOptions.text = res?.data ?? 'Role added successfully.';
            this.swalOptions.icon = 'success';
            this.getRole();
          } else {
            this.swalOptions.title = 'Error';
            this.swalOptions.text = res?.Message ?? 'Something went wrong.';
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
            error?.error?.Message || 'Server error occurred. Please try again.';
          this.swalOptions.icon = 'error';
          this.showAlert(this.swalOptions);
          this.isSubmitting = false;
        },
      });
    }
  }

  menuOnSubmit(event?: Event, myForm?: NgForm) {
    if (event) event.preventDefault();
    if (myForm?.invalid) return;
    debugger;
    this.isLoading = true;

    const selectedMenuIds: number[] = [];

    for (const parent of this.roleMenu) {
      if (parent.isChecked) selectedMenuIds.push(parent.serial);
      if (parent.children?.length > 0) {
        for (const child of parent.children) {
          if (child.isChecked) selectedMenuIds.push(child.serial);
        }
      }
    }

    const dto = {
      ID: this.selectedRoleId,
      MENULISTID: selectedMenuIds.join(','),
    };

    this.cloudPosService.menuOnSubmit(dto).subscribe({
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

  assignMenu(ID: number, menuModal: any): void {
    this.spin = true;
    debugger;
    this.cloudPosService.assignMenu(ID).subscribe({
      next: (data: any) => {
        this.roleMenu = data;
        console.log('Projects loaded:', this.roleMenu);
        this.spin = false;
        this.selectedRoleId = ID;
        this.cdr.detectChanges();
        this._modalService.open(menuModal, { size: 'xl', keyboard: false, backdrop: 'static' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load projects', err);
        this.spin = false;
      },
    });
  }

  loadParentMenus(): void {
    this.cloudPosService.GetParentNavCloudPosDBKMART().subscribe({
      next: (res) => {
        this.parentMenuList = res;
      },
      error: (err) => {
        console.error('Error fetching parent menus:', err);
      },
    });
  }

  createOrEditModalPopUp(createOrUpdateModal: any, data?: any) {
    debugger;
    if (data?.serial != null) {
      this.isEditMode = true;
      this.NavCreateForm.patchValue({
        SERIAL: data.serial,
        PARENT_ID: data.parenT_ID ?? null,
        DESCRIPTION: data.description || '',
        URL: data.url || '',
        PER_ROLE: data.peR_ROLE || '',
        ENTRY_BY: data.entrY_BY || '',
        ENTRY_DATE: data.entrY_DATE ? new Date(data.ENTRY_DATE) : new Date(),
        ORDER_BY: data.ordeR_BY || 0,
        FA_CLASS: data.fA_CLASS || '',
        ID: data.id || 0,
        MENU_TYPE: data.menU_TYPE || '',
        SHOW_EDIT_PERMISSION: data.shoW_EDIT_PERMISSION ?? false,
      });
    } else {
      this.NavCreateForm.reset({
        SERIAL: 0,
        PARENT_ID: 0,
        DESCRIPTION: '',
        URL: '',
        PER_ROLE: '',
        ENTRY_BY: '',
        ENTRY_DATE: new Date(),
        ORDER_BY: 0,
        FA_CLASS: '',
        ID: 0,
        MENU_TYPE: '',
        SHOW_EDIT_PERMISSION: false,
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
        (result) => {
          console.log('Closed with:', result);
        },
        (reason) => {
          console.log('Dismissed with:', reason);
        }
      )
      .finally(() => {
        this.isEditMode = false;
        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
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

  UpdateNav() {
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
    this.cloudPosService.updateCheckedNavItems(checkedMenus).subscribe({
      next: (res) => {
        const isSuccess = res?.succeeded === true || res?.Succeeded === true;

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

  onSubmit(): void {
    debugger;
    if (this.NavCreateForm.invalid) {
      this.NavCreateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const isEdit = this.isEditMode;
    const formData = new FormData();

    formData.append('SERIAL', this.NavCreateForm.get('SERIAL')?.value);
    formData.append(
      'PARENT_ID',
      this.NavCreateForm.get('PARENT_ID')?.value ?? ''
    );
    formData.append('IsParent', this.NavCreateForm.get('IsParent')?.value);
    formData.append(
      'DESCRIPTION',
      this.NavCreateForm.get('DESCRIPTION')?.value
    );
    formData.append('URL', this.NavCreateForm.get('URL')?.value ?? '');
    formData.append('PER_ROLE', this.NavCreateForm.get('PER_ROLE')?.value);
    formData.append('ENTRY_BY', this.NavCreateForm.get('ENTRY_BY')?.value);
    formData.append('ORDER_BY', this.NavCreateForm.get('ORDER_BY')?.value);
    formData.append(
      'FA_CLASS',
      this.NavCreateForm.get('FA_CLASS')?.value ?? ''
    );
    formData.append(
      'MENU_TYPE',
      this.NavCreateForm.get('MENU_TYPE')?.value ?? ''
    );
    formData.append(
      'SHOW_EDIT_PERMISSION',
      this.NavCreateForm.get('SHOW_EDIT_PERMISSION')?.value
    );

    const request = isEdit
      ? this.cloudPosService.updateNav(formData)
      : this.cloudPosService.createNav(formData);

    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.success === true || res?.Succeeded === true;

        if (isSuccess) {
          this.swalOptions.title = isEdit ? 'Updated!' : 'Created!';
          this.swalOptions.text =
            res?.Messages?.[0] ??
            (isEdit ? 'Navigation updated.' : 'Navigation created.');
          this.swalOptions.icon = 'success';

          this.getNavList(); // reload main table
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

  getNavList() {
    this.cloudPosService.getAllNav().subscribe({
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
  getRole() {
    this.cloudPosService.getRoleCloudPosDBKMART().subscribe({
      next: (data: any) => {
        this.addedRoles = data;
        console.log('Navigation list loaded:', this.navList);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }



  moveToAssigned(menu: any) {
    // Remove from available
    this.availableMenus1 = this.availableMenus1.filter(
      (m) => m.serial !== menu.serial
    );

    // Add to assigned (check for duplicates)
    if (!this.assignedMenus1.find((m) => m.serial === menu.serial)) {
      this.assignedMenus1.push(menu);
    }
  }

onAssignAllMenusToggle(event: any) {
  const isChecked = event.target.checked;
  debugger;

  if (isChecked) {
    // ✅ When checkbox is checked — add menus without duplicates
    this.selectedRoles1Grouped.forEach(group => {
      group.menuRoles.forEach(menu => {
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
    // ❌ When checkbox is unchecked — clear assigned menus
    this.assignedMenus1 = [];
  }
}

  

  moveToAvailable(menu: any) {
    // Remove from assigned
    this.assignedMenus1 = this.assignedMenus1.filter(
      (m) => m.serial !== menu.serial
    );

    // Add back to available if it exists in selected roles
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

  onPrivilegeSubmit() {
    debugger;
    if (this.assignedMenus1.length === 0) {
      // Show validation message
      return;
    }

    this.isSubmitting = true;

    const dto = {
      ID: this.currentUserID,
      MenuIdList: this.assignedMenus1.map((menu) => menu.serial).join(','),
    };
    console.log('Submitting privilege data:', dto);
    this.cloudPosService.assignedUserMenus(dto).subscribe({
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
  closeModal(): void {
    if (this.privilegeModalRef) {
      this.privilegeModalRef.close('success');
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