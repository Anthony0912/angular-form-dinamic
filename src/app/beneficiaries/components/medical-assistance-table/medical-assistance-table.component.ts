import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as moment from 'moment-timezone';

import { IDENTIFICATION } from '../../constants/regex.contant';

import Parentage from 'src/app/beneficiaries/interfaces/parentage.interface';
import { calculateAge } from '../../functions/date.function';
import FormCustomControl from '../../interfaces/control.interface';
import Beneficiary from '../../interfaces/beneficiary.interface';

@Component({
  selector: 'app-medical-assistance-table',
  templateUrl: './medical-assistance-table.component.html',
  styleUrls: ['./medical-assistance-table.component.css']
})
export class MedicalAssistanceTableComponent implements OnInit, OnChanges, OnDestroy {

  @Input() isResetForms: boolean = false;
  @Input() inputParentage: Parentage[] = [];
  @Input() quantityInParentagePolicy: { id: number; quantity: number }[] = [];

  @Output() changeStateResetFormsEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() beneficiariesMediacalAssitanceEmitter: EventEmitter<Beneficiary[]> = new EventEmitter<Beneficiary[]>();
  @Output() formValidMedicalAsstanceEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _subscription: Subscription = new Subscription();
  private _IDENTIFICATION: string = IDENTIFICATION;
  private _maxFields: number = 5;

  constructor(private _fb: FormBuilder) { }

  ngOnInit(): void {
    this._subscription = this.beneficiaries.valueChanges.subscribe((_) => {
      this.beneficiariesMediacalAssitanceEmitter.emit(this.beneficiaries.value);
      this.formValidMedicalAsstanceEmitter.emit(this.form.valid);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isResetForms?.currentValue === true) {
      this.changeStateResetFormsEmitter.emit(false);
      while (this.beneficiaries.length > 1) {
        this.beneficiaries.removeAt(0);
      }
      this.beneficiaries.reset();
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  form: FormGroup = this._fb.group({
    beneficiaries: this._fb.array([
      this._fb.group({
        parentage: [null, Validators.required],
        identification: ['', [Validators.maxLength(9), Validators.pattern(this._IDENTIFICATION)]],
        completeName: ['', Validators.required],
        birthday: ['', Validators.required],
      })
    ], Validators.required)
  });

  newBeneficiaries: FormGroup = this._fb.group({
    parentage: [null, Validators.required],
    identification: ['', [Validators.maxLength(9), Validators.pattern(this._IDENTIFICATION)]],
    completeName: ['', Validators.required],
    birthday: ['', Validators.required]
  });

  public addBeneficiary(): void {

    this._verifyUniqueParentage();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.itDoesNotHaveMaximumFields) {
      this.beneficiaries.push(this._fb.group({
        parentage: [this.parentage.value, Validators.required],
        identification: [this.identification.value, [Validators.maxLength(9), Validators.pattern(this._IDENTIFICATION)]],
        completeName: [this.completeName.value, Validators.required],
        birthday: [this.birthday.value, Validators.required]
      }));
      this.newBeneficiaries.reset();
    }
  }

  public configBirthdayAndMedicalBenefit(i: number): void {
    const { parentage, birthday } = this._getFormControls(i);
    const parentValue: number = Number(parentage.value);

    switch (parentValue) {
      case 1:
        birthday.disable();
        birthday.reset();
        break;
      case 2:
        birthday.enable();
        birthday.setValidators([Validators.required]);
        birthday.updateValueAndValidity();

        break;
      default:
        birthday.disable();
        birthday.setValue('');
        break;
    }

    this._verifyUniqueParentage();
    this.formValidMedicalAsstanceEmitter.emit(this.form.valid);

  }

  public getApplicantForMedicalBenefits(i: number): void {
    const { parentage, birthday } = this._getFormControls(i);
    const today = this.getDateNow;
    const isMaxDate: boolean = birthday.value <= today;

    if (!isMaxDate) {
      birthday.setErrors({ maxDate: true });
      return;
    }

    const date = birthday.value;
    const age = calculateAge(date);
    const parentValue: number = Number(parentage.value);

    if (parentValue === 1) {
      birthday.disable();
    } else if (age >= 18 && parentValue === 2) {
      birthday.setErrors({ notUnderAge: true });
    }

    this.formValidMedicalAsstanceEmitter.emit(this.form.valid);
  }

  public deleteBeneficiary(i: number): void {
    if (this.beneficiaries.controls.length > 1) {
      this.beneficiaries.removeAt(i);
    } else {
      this.beneficiaries.reset();
    }
    this.beneficiariesMediacalAssitanceEmitter.emit(this.beneficiaries.value);
  }

  public inputIsValid(input: string, i: number): boolean | null {
    const formGroup: FormGroup = this.beneficiaries.controls[i] as FormGroup;
    return formGroup.controls[input].errors && formGroup.controls[input].touched;
  }

  public inputPatternIsValid(input: string, error: string, i: number): boolean | null {
    const formGroup: FormGroup = this.beneficiaries.controls[i] as FormGroup;
    return formGroup.controls[input].hasError(error);
  }

  public getParentageName(i: number): string {
    let name: string = '';
    const { parentage } = this._getFormControls(i)
    const value: number = Number(parentage.value);

    switch (value) {
      case this.inputParentage[0].id:
        name = this.inputParentage[0].name;
        break;
    }

    return name;
  }

  private _getFormGroupByPosition(i: number): FormGroup {
    const formGroup: FormGroup = this.beneficiaries.controls[i] as FormGroup;
    return formGroup;
  }

  private _getFormControlsByPosition(input: string, i: number): AbstractControl {
    const formGroup: FormGroup = this._getFormGroupByPosition(i);
    const formControls: AbstractControl = formGroup.controls[input] as AbstractControl;
    return formControls;
  }

  private _getFormControls(i: number): FormCustomControl {
    const parentage: AbstractControl = this._getFormControlsByPosition('parentage', i);
    const identification: AbstractControl = this._getFormControlsByPosition('identification', i);
    const completeName: AbstractControl = this._getFormControlsByPosition('completeName', i);
    const birthday: AbstractControl = this._getFormControlsByPosition('birthday', i);

    const constrols: FormCustomControl = {
      parentage: parentage,
      identification: identification,
      completeName: completeName,
      birthday: birthday,
    };
    return constrols;
  }

  private _verifyUniqueParentage(): void {
    let numberOfRepeatedSpouse: number = 0;
    const controls = this.beneficiaries.controls;

    for (let i = 0; i < controls.length; i++) {
      const { parentage } = this._getFormControls(i);
      const parentValue = Number(parentage.value);

      if (
        parentValue === this.quantityInParentagePolicy[0]?.id &&
        this.quantityInParentagePolicy[0].quantity === 1
      ) {
        parentage.setErrors({ notUniqueParentagePolicy: true });
        return;
      }
      if (parentValue === this.inputParentage[0].id) {
        numberOfRepeatedSpouse += 1;
      }

      if (numberOfRepeatedSpouse > 1) {
        parentage.setErrors({ notUniqueParentage: true });
        return;
      }
    }
  }

  public get getDateNow(): string {
    const today: string = moment.tz('America/Costa_Rica').format();
    return today.split('T')[0];
  }

  public get itDoesNotHaveMaximumFields(): boolean {
    let maxFields = this._maxFields;
    this.quantityInParentagePolicy.map(({ quantity }) => {
      maxFields -= quantity;
    });

    return this.beneficiaries.value.length < maxFields;
  }

  public get beneficiaries(): FormArray {
    return this.form.get('beneficiaries') as FormArray;
  }

  public get parentage(): AbstractControl {
    return this.newBeneficiaries.get('parentage') as AbstractControl;
  }

  public get identification(): AbstractControl {
    return this.newBeneficiaries.get('identification') as AbstractControl;
  }

  public get completeName(): AbstractControl {
    return this.newBeneficiaries.get('completeName') as AbstractControl;
  }

  public get birthday(): AbstractControl {
    return this.newBeneficiaries.get('birthday') as AbstractControl;
  }

}
