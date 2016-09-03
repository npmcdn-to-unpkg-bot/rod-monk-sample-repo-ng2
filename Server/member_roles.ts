/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/assert/index.d.ts" />
/// <reference path="../typings/globals/lodash/index.d.ts" />

import * as assert from 'assert';
import * as _ from 'lodash';

// Define Roles
exports.role_definitions = {
    member: { // Role name
        can: ['members:read', 'documents:read', 'eblasts:read'],
    },
    executive: {
        can: ['documents:create', 'documents:delete', 'newsitems:create', 'newsitems:delete'],
        inherits: ['member']
    },
    manager: {
        can: ['members:delete', 'accounts:read'],
        inherits: ['executive']
    },
    treasurer: {
        can: ['accounts:update'],
        inherits: ['manager']
    },
    admin: {
        can: ['admin'],
        inherits: ['treasurer']
    }
};

exports.getPermissions = (role: string) => {

    let permissions: string[] = [];
    let next_role = role;

    while (!!next_role && this.role_definitions[next_role]) {

        // Soak up each roles permissions (if any)
        if (!_.isUndefined(this.role_definitions[next_role].can)) {
            for (let can of this.role_definitions[next_role].can) {
                permissions.push(can);
            }
        }

        // Keep going if the role inherits other permissions
        next_role = _.isUndefined(this.role_definitions[next_role].inherits)
            || _.isUndefined(this.role_definitions[next_role].inherits[0])
            ? null : this.role_definitions[next_role].inherits[0];
    }
    return permissions;
};

// Run some tests to ensure that all roles work properly
for (let role in this.role_definitions) {
    assert(this.getPermissions(role).length > 1);
}

// Do a silly one too
assert(this.getPermissions('nonsense').length === 0);
