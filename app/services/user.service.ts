import { bind, Injectable } from '@angular/core';

function isLocalStorageSupported() {
    const testKey = 'test',
        storage = window.localStorage;
    try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
    } catch (error) {
        console.log('Local Storage IS NOT supported');
        return false;
    }
}

// UserService provides a means for the controllers to share user login status and user role
@Injectable()
export class UserService {

    private JWT: string;
    private exec: string;
    private permissions: string[];
    private localStorageSupported: boolean;

    constructor() {

        this.localStorageSupported = isLocalStorageSupported();

        if (this.localStorageSupported) {
            this.JWT = localStorage.getItem('JWT');
            this.exec = localStorage.getItem('exec');
            if (!!localStorage.getItem('permissions')) {
                this.permissions = localStorage.getItem('permissions').split(',');
            } else {
                this.permissions = [];
            }
        }
    }

    loggedIn = (privileges: any) => {

        if (this.localStorageSupported) {
            localStorage.setItem('JWT', privileges.jwt);
            localStorage.setItem('exec', privileges.exec);
            localStorage.setItem('permissions', privileges.permissions);
        }

        this.JWT = privileges.jwt;
        this.exec = privileges.exec;
        this.permissions = privileges.permissions;
    }

    loggedOut = () => {

        if (this.localStorageSupported) {
            localStorage.setItem('JWT', null);
            localStorage.setItem('exec', null);
            localStorage.setItem('permissions', null);
        }

        this.JWT = null;
        this.exec = null;
        this.permissions = null;
    }

    isLoggedIn = () => !!this.JWT;

    getToken = () => this.JWT;

    getExec = () => this.exec;

    getPermissions=() => this.permissions;

    hasPermission= (permission: string) => !!this.permissions && this.permissions.indexOf(permission) >= 0;
}

export var userServiceInjectables: Array<any> = [
    bind(UserService).toClass(UserService)
];
