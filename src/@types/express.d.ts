import { IPayLoad } from "./jwt.interface";

declare global {

    namespace Express {

        interface Request {

            user:IPayLoad
            
        }
    }
}