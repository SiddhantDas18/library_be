"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("./db"));
const middleware_1 = __importDefault(require("./middleware"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const SECRET = process.env.SECRET;
app.post("/addAdmin", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;
        const role = "admin";
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        try {
            const checkUser = yield db_1.default.users.findUnique({
                where: {
                    username: username
                }
            });
            if (checkUser) {
                res.json({
                    msg: "Username already taken"
                });
            }
            const addUser = yield db_1.default.users.create({
                data: {
                    username: username,
                    email: email,
                    password: hashedPassword,
                    role: role
                }
            });
            res.json({
                msg: "User Created",
                user: addUser
            });
        }
        catch (e) {
            res.json({
                msg: e.toString()
            });
        }
    });
});
app.post("/addUser", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;
        const role = "user";
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        try {
            const checkUser = yield db_1.default.users.findUnique({
                where: {
                    username: username
                }
            });
            if (checkUser) {
                res.json({
                    msg: "Username already taken"
                });
            }
            const addUser = yield db_1.default.users.create({
                data: {
                    username: username,
                    email: email,
                    password: hashedPassword,
                    role: role
                }
            });
            res.json({
                msg: "User Created",
                user: addUser
            });
        }
        catch (e) {
        }
    });
});
app.post("/login", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = req.body.username;
        const password = req.body.password;
        try {
            const user = yield db_1.default.users.findUnique({
                where: {
                    username: username
                }
            });
            if (!user) {
                res.json({
                    msg: "User not found"
                });
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, (user === null || user === void 0 ? void 0 : user.password) || "");
            if (!isPasswordValid) {
                res.json({
                    msg: "Invalid password"
                });
            }
            const user_id = user === null || user === void 0 ? void 0 : user.id;
            const role = user === null || user === void 0 ? void 0 : user.role;
            const token = jsonwebtoken_1.default.sign({
                id: user_id,
                role: role
            }, SECRET);
            res.json({
                msg: "Login successful",
                token: token
            });
        }
        catch (e) {
            res.json({
                msg: e.toString()
            });
        }
    });
});
app.post("/addBook", middleware_1.default, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const title = req.body.title;
        const author = req.body.author;
        const isbn = req.body.isbn;
        const published_year = req.body.year;
        const copies = req.body.copies;
        const id = req.id;
        const role = req.role;
        try {
            if (role != 'admin') {
                res.json({
                    msg: "Only Admin can Add books"
                });
            }
            const book = yield db_1.default.books.create({
                data: {
                    title: title,
                    author: author,
                    ISBN: isbn,
                    Published_year: published_year,
                    Copies_availabe: copies,
                }
            });
            res.json({
                msg: "Book added successfully",
                book: book
            });
        }
        catch (e) {
            res.json({
                msg: e.toString()
            });
        }
    });
});
const port = 8080;
app.listen(port);
console.log(`listening on port ${port}`);
