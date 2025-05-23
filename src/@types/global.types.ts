import mongoose from "mongoose";

export enum Role {
    user = 'USER',
    admin = 'ADMIN'
}

export const OnlyAdmin = [Role.admin]
export const onlyUser = [Role.user]
export const allUser = [Role.admin, Role.user]

export interface IPayload {
    id: mongoose.Types.ObjectId
    email: string;
    firstName: string
    lastName: string
    role: Role
}