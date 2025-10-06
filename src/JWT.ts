import {sign, SignOptions, verify} from "jsonwebtoken";

const SECRET = process.env.SECRET || "secret";

export function jwtSign(data: object, expiresIn: SignOptions["expiresIn"] = "1d") {
    return sign(data, SECRET, {expiresIn});
}

export function jwtVerify(token: string) {
    try {
        return verify(token, SECRET);
    } catch (e) {
        return null;
    }
}