import mongoose from "mongoose"
import { Role } from "./global.types";

export interface IPayLoad {
    _id: mongoose.Types.ObjectId;
    email:string;
    firstName: string;
    lastName: string;
    role: Role
}