"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allUser = exports.OnlyUser = exports.Onlyadmin = exports.Role = void 0;
var Role;
(function (Role) {
    Role["user"] = "USER";
    Role["admin"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
exports.Onlyadmin = [Role.admin];
exports.OnlyUser = [Role.user];
exports.allUser = [Role.admin, Role.user];
