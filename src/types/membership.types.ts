// src/types/membership.types.ts

export interface Membership {
  id: string;
  activityId: string;
  activityName: string;
  name: string;
  description: string;
  cost: number;
  duration: number;
  maxAttendances: number;
  isPopular: boolean;
  activeMembers: number;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
}

export interface MembershipFormData {
  activityId: string;
  name: string;
  description: string;
  cost: number | string;
  duration: number;
  maxAttendances: number | string;
}

export interface FormErrors {
  activityId?: string;
  name?: string;
  description?: string;
  cost?: string;
  duration?: string;
  maxAttendances?: string;
  form?: string;
}

// Objeto con funciones útiles relacionadas con estos tipos
const membershipTypes = {
  createEmptyMembership: (): Membership => ({
    id: '',
    activityId: '',
    activityName: '',
    name: '',
    description: '',
    cost: 0,
    duration: 30,
    maxAttendances: 0,
    isPopular: false,
    activeMembers: 0
  }),
  
  createEmptyActivity: (): Activity => ({
    id: '',
    name: '',
    description: ''
  }),
  
  createEmptyMembershipFormData: (): MembershipFormData => ({
    activityId: '',
    name: '',
    description: '',
    cost: '',
    duration: 30,
    maxAttendances: ''
  }),
  
  createEmptyFormErrors: (): FormErrors => ({})
};

export default membershipTypes;