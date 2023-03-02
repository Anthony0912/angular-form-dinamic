import { Component, OnInit } from '@angular/core';
import {
  PARENTAGE_POLICY,
  PARENTAGE_MEDICAL_ASSISTANCE,
  PERCENTAGE_ALLOCATION
} from 'src/app/beneficiaries/constants/table.contant';

import * as bootstrap from "bootstrap";

import Parentage from 'src/app/beneficiaries/interfaces/parentage.interface';
import Beneficiary from './interfaces/beneficiary.interface';
import { PercentageAllocation } from './interfaces/percentage-allocation.interface';
@Component({
  selector: 'app-beneficiaries',
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.css']
})
export class BeneficiariesComponent implements OnInit {

  public quantityInParentagePolicy: { id: number; quantity: number }[] = [];
  public quantityInParentageMedicalAsistance: { id: number; quantity: number }[] = [];
  public isFormValidPolicy: boolean = false;
  public isFormValidMedicalAsstance: boolean = false;
  public isResetForms: boolean = false;

  private _parentagePolicy: Parentage[] = PARENTAGE_POLICY;
  private _parentageMedicalAssitance: Parentage[] = PARENTAGE_MEDICAL_ASSISTANCE;
  private _percentageAllocation: typeof PERCENTAGE_ALLOCATION = PERCENTAGE_ALLOCATION;
  private _beneficiariesMediacalAssitance: Beneficiary[] = [];
  private _beneficiariesPolicy: Beneficiary[] = [];

  constructor() { }

  ngOnInit(): void { }

  public createBeneficiaries(): void {

    const beneficiaries = {
      mediacalAssitance: this._beneficiariesMediacalAssitance,
      policy: this._beneficiariesPolicy,
    }
    sessionStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));
    this.toggleModal('staticBackdrop');
    console.table(beneficiaries.mediacalAssitance);
    console.table(beneficiaries.policy);
  }

  public removeBeneficiaries(): void {
    this.changeStateResetForms = true;
    sessionStorage.removeItem('beneficiaries');
  }

  public getBeneficiariesPolicy(beneficiaries: Beneficiary[]): void {
    this._beneficiariesPolicy = beneficiaries;
    this._quantityInParentagePolicy();
  }

  public getBeneficiariesMediacalAssitance(beneficiaries: Beneficiary[]): void {
    this._beneficiariesMediacalAssitance = beneficiaries;
    this._quantityInParentageMediacalAssitance();
  }

  public formValidPolicy(formValid: boolean): void {
    this.isFormValidPolicy = formValid;
  }

  public formValidMedicalAsstance(formValid: boolean): void {
    this.isFormValidMedicalAsstance = formValid;
  }

  private _quantityInParentagePolicy(): void {
    this.quantityInParentagePolicy = this._getQuantityParentage(this._beneficiariesPolicy);
  }

  private _quantityInParentageMediacalAssitance(): void {
    this.quantityInParentageMedicalAsistance = this._getQuantityParentage(this._beneficiariesMediacalAssitance);
  }

  private _getQuantityParentage(beneficiaries: Beneficiary[]): { id: number; quantity: number }[] {
    const quantityParentage = [{ id: 1, quantity: 0 }, { id: 2, quantity: 0 }];
    beneficiaries.map(beneficiary => {
      const parentage: number = Number(beneficiary.parentage);
      if (parentage === this._parentagePolicy[0].id) {
        quantityParentage[0].quantity += 1;
      } else if (parentage === this._parentagePolicy[1].id) {
        quantityParentage[1].quantity += 1;
      }
    });
    return quantityParentage;
  }

  public toggleModal(id: string): void {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)!).toggle()
  }

  public get percentageIsDiferentZero(): boolean {
    let isDiferentZero: boolean = false;
    this._beneficiariesPolicy.map(beneficiary => {
      const { percentageAllocation } = beneficiary;
      if (percentageAllocation !== '0%') {
        isDiferentZero = true;
      }
    });
    return isDiferentZero;
  }

  public get parentagePolicy(): Parentage[] {
    return [...this._parentagePolicy];
  }

  public get parentageMedicalAssitance(): Parentage[] {
    return [...this._parentageMedicalAssitance];
  }

  public get percentageAllocation(): PercentageAllocation[] {
    return [...this._percentageAllocation];
  }

  public get disabledBtn(): boolean {
    if (this.isFormValidPolicy && this._beneficiariesMediacalAssitance.length === 0) {
      return true;
    } else if (this.isFormValidPolicy && this.isFormValidMedicalAsstance) {
      return true;
    }
    return false;
  }

  public set changeStateResetForms(resetForms: boolean) {
    this.isResetForms = resetForms;
  }

}
