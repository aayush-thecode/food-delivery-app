import { NextFunction, Request, Response } from "express";
import { Role } from "../@types/global.types";
import { verifyToken } from "../utils/jwt.utils";
import User from "../models/users.model";
import { CustomError } from "./errorhandeler.middleware";

export const Authenticate = (

	roles?: Role[]

): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {

	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const authHeader = req.headers["authorization"] as string;


			if (!authHeader || !authHeader.startsWith("BEARER")) {
				throw new CustomError(
					"Unauthorized, Authorization token is missing",
					401
				);
			}

			const access_token = authHeader.split(" ")[1];

			if (!access_token) {
				throw new CustomError("Unauthorized, token is missing", 401);
			}

			const decoded = verifyToken(access_token);

			if (decoded.exp && decoded.exp * 1000 > Date.now()) {
				throw new CustomError("Unauthorized, access denied", 401);
			}

			if (!decoded) {
				throw new CustomError("Unauthorized, Invalid token", 401);
			}

			const user = await User.findById(decoded._id);

			if (!user) {
				throw new CustomError("User not found", 404);
			}

			if (roles && !roles.includes(user.role)) {
				throw new CustomError(
					`Forbidden, ${user.role} can not access this resource`,
					401
				);
			}

			// ts-expect-error
			req.user = {
				_id: decoded._id,
				firstName: decoded.firstName,
				lastName: decoded.lastName,
				role: decoded.role,
				email: decoded.email,
			};

			next();

		} catch (err: any) {
			next(err);
		}
	};
};