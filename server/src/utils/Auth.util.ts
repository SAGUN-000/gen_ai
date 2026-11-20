 import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

export const generateToken = (
    userId: string,
    username: string
): string => {

    const payload = {
        id: userId,
        username,
    };

    const expiresIn: StringValue =
        (process.env.JWT_EXPIRES_IN || "7d") as StringValue;

    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn,
    });
};