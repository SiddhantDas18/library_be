"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = middleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.SECRET;
function middleware(req, res, next) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            msg: "Unauthorized"
        });
    }
    const decode = jsonwebtoken_1.default.verify(token, SECRET);
    if (decode) {
        const { id } = decode;
        const { role } = decode;
        req.id = id;
        req.role = role;
        next();
    }
    else {
        res.json({
            msg: "user id not found in auth"
        });
    }
}
