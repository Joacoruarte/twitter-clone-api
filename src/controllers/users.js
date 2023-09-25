import { UserModel } from "../models/user.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import { promisify } from "util";
const compareAsync = promisify(compare);
import dotenv from "dotenv";
dotenv.config();

export class UsersController {
   static async getAll(req, res) {
      const { offset, limit } = req.query;
      const users = await UserModel.getAll({ offset, limit });
      if (users.length === 0)
         return res.status(404).json({ message: "Users not found" });
      return res.json({ users });
   }

   static async getUserByContext(req, res) {
      const { user_id } = req.context;

      if (!user_id)
         return res.status(400).json({ message: "User does not match" });

      const user = await UserModel.getById({ id: user_id });

      if (!user)
         return res.status(400).json({ message: "User does not match" });

      res.status(200).json({ user: user });
   }

   static async getById(req, res) {
      const { id } = req.params;
      const user = await UserModel.getById({ id });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json({ user });
   }

   static async checkIfUserExists(req, res) {
      const { identifier } = req.body;
      const user = await UserModel.getByIdentifier({ identifier });

      if (!user)
         return res.status(400).json({ message: "User does not match" });

      if (
         user.email_address === identifier ||
         user.user_handle === identifier ||
         user.phone_number === identifier
      ) {
         const types = {
            email_address: "Correo electrónico",
            user_handle: "Usuario",
            phone_number: "Teléfono",
         };
         const type =
            types[Object.keys(user).find((key) => user[key] === identifier)];
         return res.json({ identified: true, type });
      }
      res.status(400).json({ message: "User does not match" });
   }

   static async logIn(req, res) {
      const { identifier, password } = req.body;
      const user = await UserModel.getByIdentifier({ identifier });

      if (!user)
         return res.status(400).json({ message: "User does not match" });

      if (
         user.email_address === identifier ||
         user.user_handle === identifier ||
         user.phone_number === identifier
      ) {
         const match = await compareAsync(password, user.password_hash);

         const userForToken = {
            user_id: user.user_id,
            email: user.email_address,
            user_handle: user.user_handle,
         };

         const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
            expiresIn: 30 * 24 * 60 * 60 * 1000,
         });

         if (match) {
            res.cookie("session_cookie", token, {
               httpOnly: false,
               maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días,
               secure: process.env.NODE_ENV === "production" ? true : false,
               path: "/",
               domain:
                  process.env.NODE_ENV === "production"
                     ? ".vercel.app"
                     : "localhost",
            });

            return res.status(200).json({ message: "You are logged in" });
         }

         return res.status(400).json({ message: "Password does not match" });
      }
      res.status(400).json({ message: "User does not match" });
   }

   static async register(req, res) {
      const { first_name, last_name, email, password, birthday } = req.body;

      const userStatusCreated = await UserModel.createUser({
         first_name,
         last_name,
         email,
         password,
         birthday,
      });

      if (userStatusCreated.status === 1) {
         const userForToken = {
            user_id: userStatusCreated.user.user_id,
            email: userStatusCreated.user.email_address,
            user_handle: userStatusCreated.user.user_handle,
         };

         const token = sign(userForToken, process.env.JWT_SECRET, {
            expiresIn: 30 * 24 * 60 * 60 * 1000,
         });

         res.cookie("session_cookie", token, {
            httpOnly: false,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días,
            secure: process.env.NODE_ENV === "production" ? true : false,
            path: "/",
            domain:
               process.env.NODE_ENV === "production"
                  ? ".vercel.app"
                  : "localhost",
         });

         res.status(201).json({ message: "User created successfully" });
      } else {
         res.status(400).json({ message: "Something some wrong" });
      }
   }

   static async getFollowersByUserId(req, res) {
      const { id } = req.params;
      const { offset, limit } = req.query;
      const followers = await UserModel.getFollowersById({
         id,
         offset,
         limit,
      });

      if (!followers)
         return res.status(404).json({ message: "Followers not found" });

      res.json(followers);
   }
}
