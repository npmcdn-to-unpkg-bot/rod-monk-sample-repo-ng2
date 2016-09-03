import {documentServiceInjectables} from './document.service';
import {memberServiceInjectables} from './member.service';
import {newsItemServiceInjectables} from './newsitem.service';
import {normalizationServiceInjectables} from './normalization.service';
import {platformServiceInjectables} from './platform.service';
import {userServiceInjectables} from './user.service';
import {logServiceInjectables} from './log.service';
import {validationServiceInjectables} from './validation.service';
import { executiveServiceInjectables } from './executive.service';

export * from './document.service';
export * from './member.service';
export * from './newsitem.service';
export * from './normalization.service';
export * from './platform.service';
export * from './user.service';
export * from './validation.service';
export * from './executive.service';
export * from './log.service';

export var servicesInjectables: Array<any> = [
    documentServiceInjectables,
    memberServiceInjectables,
    newsItemServiceInjectables,
    normalizationServiceInjectables,
    platformServiceInjectables,
    userServiceInjectables,
    validationServiceInjectables,
    executiveServiceInjectables,
    logServiceInjectables,
];
