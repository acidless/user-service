import jwt from 'jsonwebtoken';

const SECRET = process.env.SECRET || "secret";

export function jwtSign(data: object, expiresIn: jwt.SignOptions["expiresIn"] = "1d") {
    return jwt.sign(data, SECRET, {expiresIn});
}

export function jwtVerify(token: string) {
    try {
        return jwt.verify(token, SECRET);
    } catch (e) {
        return null;
    }
}