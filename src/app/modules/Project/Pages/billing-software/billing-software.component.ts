import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BillingSoftwareService } from '../../Services/billing-software.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-billing-software',
  standalone: false,
  templateUrl: './billing-software.component.html',
  styleUrl: './billing-software.component.scss',
})
export class BillingSoftwareComponent implements OnInit {
  selectedTab: string = 'nav';
  isEditMode: boolean = false;
  navList: any[] = [];
  NavCreateForm!: FormGroup;
  spin: boolean;
  isOpenAction: number | null = null;
  parentMenuList: any[] = [];
  constructor(
    private readonly billingSoftwareServie: BillingSoftwareService,
    private readonly cdr: ChangeDetectorRef,
    private readonly _modalService: NgbModal,
    private readonly fb: FormBuilder
  ) {}
  ngOnInit(): void {
    this.getNavList();
  }
  onSubmit() {}
  getNavList() {
    this.billingSoftwareServie.getAllNav().subscribe({
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

  private initNavCreateForm(): void {
    this.NavCreateForm = this.fb.group({
      SERIAL: [null, Validators.required],
      PARENT_ID: [null],
      IsParent: [false],
      DESCRIPTION: ['', Validators.required],

      URL: [
        '#',
        [Validators.required, Validators.pattern('^(https?:\\/\\/|#).+')],
      ],
      PER_ROLE: ['', Validators.required],
      ENTRY_BY: ['', Validators.required],
      ORDER_BY: [null, Validators.required],
      FA_CLASS: [''],
      MENU_TYPE: ['', Validators.required],
      SHOW_EDIT_PERMISSION: [false],
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
  UpdateNav() {}
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
}
