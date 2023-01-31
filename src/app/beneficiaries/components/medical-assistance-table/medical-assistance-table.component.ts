import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
export class MedicalAssistanceTableComponent implements OnInit {

  @Input() inputParentage: Parentage[] = [];
  @Input() quantityInParentagePolicy: { id: number; quantity: number }[] = [];
  @Output() beneficiariesMediacalAssitanceEmitter: EventEmitter<Beneficiary[]> = new EventEmitter<Beneficiary[]>();

  private _IDENTIFICATION: string = IDENTIFICATION;
  private _maxFields: number = 5;

  constructor(private _fb: FormBuilder) { }

  ngOnInit(): void {
    this.beneficiaries.valueChanges.subscribe((_) => {
      this.beneficiariesMediacalAssitanceEmitter.emit(this.beneficiaries.value);
    });
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
    const date = birthday.value;
    const age = calculateAge(date);

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
  }

  public deleteBeneficiary(i: number): void {
    if (this.beneficiaries.controls.length > 1) {
      this.beneficiaries.removeAt(i);
      return;
    }
    this.beneficiaries.reset();
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

  private _verifyUniqueParentage(): void {
    let numberOfRepeatedSpouse: number = 0;
    const controls = this.beneficiaries.controls;

    for (let i = 0; i < controls.length; i++) {
      const { parentage } = this._getFormControls(i);
      const parentValue = Number(parentage.value);
      console.log(this.quantityInParentagePolicy);

      if (
        parentValue === this.quantityInParentagePolicy[0].id &&
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

  public get itDoesNotHaveMaximumFields(): boolean {
    let maxFields = this._maxFields;
    this.quantityInParentagePolicy.map(({ quantity }) => {
      maxFields -= quantity;
    });
    return this.beneficiaries.value.length < maxFields;
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
