import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as moment from 'moment-timezone';

import { IDENTIFICATION } from '../../constants/regex.contant';
import { calculateAge } from '../../functions/date.function';

import Parentage from 'src/app/beneficiaries/interfaces/parentage.interface';
import { PercentageAllocation } from '../../interfaces/percentage-allocation.interface';
import FormCustomControl from '../../interfaces/control.interface';
import Beneficiary from '../../interfaces/beneficiary.interface';

@Component({
  selector: 'app-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./policy-table.component.css']
})
export class PolicyTableComponent implements OnInit, OnChanges, OnDestroy {

  @Input() isResetForms: boolean = false;
  @Input() inputParentage: Parentage[] = [];
  @Input() percentage: PercentageAllocation[] = [];
  @Input() quantityInParentageMedicalAsistance: { id: number; quantity: number }[] = [];

  @Output() changeStateResetFormsEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() beneficiariesPolicyEmitter: EventEmitter<Beneficiary[]> = new EventEmitter<Beneficiary[]>();
  @Output() formValidPolicyEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _subscription: Subscription = new Subscription();
  private _IDENTIFICATION: string = IDENTIFICATION;
  private _lastPercentage: number = 0;

  constructor(private _fb: FormBuilder) { }

  ngOnInit(): void {
    this._subscription = this.beneficiaries.valueChanges.subscribe((_) => {
      this.beneficiariesPolicyEmitter.emit(this.beneficiaries.value);
      this.formValidPolicyEmitter.emit(this.form.valid);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isResetForms?.currentValue === true) {
      this.changeStateResetFormsEmitter.emit(false);
      while ( this.beneficiaries.length > 1) {
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
        parentage: [null, [Validators.required]],
        identification: ['', [Validators.maxLength(9), Validators.pattern(this._IDENTIFICATION)]],
        completeName: ['', Validators.required],
        percentageAllocation: ['0%', Validators.required],
        birthday: [''],
        medicalBenefit: [false, []]
      })
    ], Validators.required)
  });

  newBeneficiaries: FormGroup = this._fb.group({
    parentage: [null, [Validators.required]],
    identification: ['', [Validators.maxLength(9), Validators.pattern(this._IDENTIFICATION)]],
    completeName: ['', Validators.required],
    percentageAllocation: ['0%', Validators.required],
    birthday: [''],
    medicalBenefit: [false]
  });

  public addBeneficiary(): void {

    this._verifyUniqueParentage();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.itDoesNotHaveMaximumFields) {
      this.beneficiaries.push(this._fb.group({
        parentage: [this.parentage.value, [Validators.required]],
        identification: [this.identification.value, [Validators.maxLength(9), Validators.pattern(this._IDENTIFICATION)]],
        completeName: [this.completeName.value, Validators.required],
        percentageAllocation: [this.percentageAllocation?.value, Validators.required],
        birthday: [this.birthday.value],
        medicalBenefit: [this.medicalBenefit?.value]
      }));
      this.newBeneficiaries.reset();
    }
  }

  public deleteBeneficiary(i: number): void {
    if (this.beneficiaries.controls.length > 1) {
      this.beneficiaries.removeAt(i);
      this._getBeneficiaryPercentage();
    } else {
      this.beneficiaries.reset();
    }
    this.beneficiariesPolicyEmitter.emit(this.beneficiaries.value);
  }

  public inputIsValid(input: string, i: number): boolean | null {
    const formControls: AbstractControl = this._getFormControlsByPosition(input, i);
    return formControls.errors && formControls.touched;
  }

  public inputPatternIsValid(input: string, error: string, i: number): boolean | null {
    const formControls: AbstractControl = this._getFormControlsByPosition(input, i);
    return formControls.hasError(error);
  }

  public getApplicantForMedicalBenefits(i: number): void {

    const { parentage, birthday, medicalBenefit } = this._getFormControls(i);
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
      medicalBenefit?.enable();
    } else if (age < 18 && parentValue === 2) {
      medicalBenefit?.enable();
      medicalBenefit?.setValidators([Validators.requiredTrue]);
      medicalBenefit?.updateValueAndValidity();
    } else if (age >= 18 && parentValue === 2) {
      this._getBeneficiaryPercentage();
    }
    this.formValidPolicyEmitter.emit(this.form.valid);
  }

  public updateValidatorForm(): void {
    this.formValidPolicyEmitter.emit(this.form.valid);
  }

  public configBirthdayAndMedicalBenefit(i: number): void {
    const { percentageAllocation, parentage, birthday, medicalBenefit } = this._getFormControls(i);
    const parentValue: number = Number(parentage.value);
    const date = birthday.value;
    const age = calculateAge(date);

    if (parentValue !== 2 || (parentValue === 2 && age >= 18)) {
      this._getBeneficiaryPercentage();
    }

    switch (parentValue) {
      case 1:
        medicalBenefit?.enable();

        birthday.disable();
        birthday.reset();
        break;
      case 2:
        birthday.enable();
        birthday.setValidators([Validators.required]);
        birthday.updateValueAndValidity();

        percentageAllocation?.setValue('0%');
        medicalBenefit?.setValue(false);
        medicalBenefit?.disable();
        break;
      default:
        birthday.disable();
        birthday.setValue('');
        medicalBenefit?.disable();
        medicalBenefit?.setValue(false);
        break;
    }

    this._verifyUniqueParentage();

  }

  public getParentageName(i: number): string {
    let name: string = '';
    const { parentage } = this._getFormControls(i)
    const value: number = Number(parentage.value);

    switch (value) {
      case this.inputParentage[0].id:
        name = this.inputParentage[0].name;
        break;
      case this.inputParentage[2].id:
        name = this.inputParentage[2].name;
        break;
      case this.inputParentage[3].id:
        name = this.inputParentage[3].name;
        break;
    }

    return name;
  }

  private _verifyUniqueParentage(): void {
    let numberOfRepeatedSpouse: number = 0;
    let numberOfRepeatedFather: number = 0;
    let numberOfRepeatedMother: number = 0;
    const controls = this.beneficiaries.controls;

    for (let i = 0; i < controls.length; i++) {
      const { parentage } = this._getFormControls(i);
      const parentValue = Number(parentage.value);

      //Verifica si en la tabla de asistencia medica fue seleccionado el counyunge
      if (
        parentValue === this.quantityInParentageMedicalAsistance[0]?.id &&
        this.quantityInParentageMedicalAsistance[0].quantity === 1
      ) {
        parentage.setErrors({ notUniqueParentageMedicalAsistence: true });
        return;
      }

      switch (parentValue) {
        case this.inputParentage[0].id:
          numberOfRepeatedSpouse += 1;
          break;
        case this.inputParentage[2].id:
          numberOfRepeatedFather += 1;
          break;
        case this.inputParentage[3].id:
          numberOfRepeatedMother += 1;
          break;
      }

      if (numberOfRepeatedSpouse > 1 || numberOfRepeatedFather > 1 || numberOfRepeatedMother > 1)
        parentage.setErrors({ notUniqueParentage: true });

    }
  }

  private _getBeneficiaryPercentage(): void {
    this._lastPercentage = 0;
    const controls = this.beneficiaries.controls;
    for (let i = 0; i < controls.length; i++) {
      const quantityBeneficiaries: number = this._getBeneficiariesOfLegalAge();
      this._setValuePercentageAllocation(quantityBeneficiaries, i);
    }
  }

  private _setValuePercentageAllocation(quantityBeneficiaries: number, i: number): void {
    const { parentage, birthday, percentageAllocation } = this._getFormControls(i);
    const parentValue: number = Number(parentage.value);
    const date = birthday.value;
    const age = calculateAge(date);

    if (parentValue === 2 && age < 18) return;

    const percentage = this.percentage[quantityBeneficiaries - 1].porcentage;
    percentageAllocation?.setValue(percentage[this._lastPercentage]);
    this._lastPercentage += 1;
  }

  private _getBeneficiariesOfLegalAge(): number {
    let benefiariesLegalAge: number = 0;
    const quantityBeneficiaries: number = this.beneficiaries.value.length;

    for (let i = 0; i < quantityBeneficiaries; i++) {
      const { parentage, birthday } = this._getFormControls(i);
      const parentValue: number = Number(parentage.value);
      const date = birthday.value;
      const age = calculateAge(date);

      if (parentValue === 2 && age >= 18) {
        benefiariesLegalAge += 1;
      } else if (parentValue !== 2) {
        benefiariesLegalAge += 1;
      }
    }
    return benefiariesLegalAge;
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
    const percentageAllocation: AbstractControl = this._getFormControlsByPosition('percentageAllocation', i);
    const birthday: AbstractControl = this._getFormControlsByPosition('birthday', i);
    const medicalBenefit: AbstractControl = this._getFormControlsByPosition('medicalBenefit', i);

    const constrols: FormCustomControl = {
      parentage: parentage,
      identification: identification,
      completeName: completeName,
      percentageAllocation: percentageAllocation,
      birthday: birthday,
      medicalBenefit: medicalBenefit
    };
    return constrols;
  }

  public get getDateNow(): string {
    const today: string = moment.tz('America/Costa_Rica').format();
    return today.split('T')[0];
  }

  public get itDoesNotHaveMaximumFields(): boolean {
    return this.beneficiaries.value.length < 4;
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

  public get percentageAllocation(): AbstractControl {
    return this.newBeneficiaries.get('percentageAllocation') as AbstractControl;
  }

  public get birthday(): AbstractControl {
    return this.newBeneficiaries.get('birthday') as AbstractControl;
  }

  public get medicalBenefit(): AbstractControl {
    return this.newBeneficiaries.get('medicalBenefit') as AbstractControl;
  }

}
