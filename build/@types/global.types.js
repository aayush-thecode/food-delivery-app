"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allUser = exports.onlyUser = exports.OnlyAdmin = exports.Role = void 0;
var Role;
(function (Role) {
    Role["user"] = "USER";
    Role["admin"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
exports.OnlyAdmin = [Role.admin];
exports.onlyUser = [Role.user];
exports.allUser = [Role.admin, Role.user];
