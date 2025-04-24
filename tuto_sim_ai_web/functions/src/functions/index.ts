import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { userFunctions } from './user';
import { lectureFunctions } from './lecture';
import { materialFunctions } from './material';
import { notificationFunctions } from './notification';

// Export all functions
export const user = userFunctions;
export const lecture = lectureFunctions;
export const material = materialFunctions;
export const notification = notificationFunctions; 