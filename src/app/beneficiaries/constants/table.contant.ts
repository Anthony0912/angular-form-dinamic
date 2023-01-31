import Parentage from "src/app/beneficiaries/interfaces/parentage.interface";
import { PercentageAllocation } from "../interfaces/percentage-allocation.interface";

export const PARENTAGE_POLICY: Parentage[] = [
  {
    id: 1,
    name: 'Conyugue',
  },
  {
    id: 2,
    name: 'Hijo/a',
  },
  {
    id: 3,
    name: 'Padre',
  },
  {
    id: 4,
    name: 'Madre',
  },
  {
    id: 5,
    name: 'Hermano/a',
  },
  {
    id: 6,
    name: 'Tío/a',
  },
  {
    id: 7,
    name: 'Primo/a ',
  },
  {
    id: 8,
    name: 'Amigo/a',
  },
];

export const PARENTAGE_MEDICAL_ASSISTANCE: Parentage[] = [
  {
    id: 1,
    name: 'Conyugue',
  },
  {
    id: 2,
    name: 'Hijo/a',
  }
];

export const PERCENTAGE_ALLOCATION: PercentageAllocation[] = [
  {
    id: 1,
    quantity: 1,
    porcentage: ['100%'],
  },
  {
    id: 2,
    quantity: 2,
    porcentage: ['50%', '50%'],
  },
  {
    id: 3,
    quantity: 3,
    porcentage: ['34%', '33%', '33%'],
  },
  {
    id: 4,
    quantity: 4,
    porcentage: ['25%', '25%', '25%', '25%'],
  },
];
