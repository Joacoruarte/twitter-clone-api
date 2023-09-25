import { executeQuery } from "../db.js";
import { normalizeText } from "../utils/normalizeText.js";
import { promisify } from 'util';
import { hash } from 'bcrypt';
const hashAsync = promisify(hash);
const saltRounds = 10;

export class UserModel {
    static async getAll({ offset = 0, limit = 20 }) {
        try {
            const SQL = `
                SELECT *
                FROM users
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            const VALUES = [Number(limit), Number(offset)];
            const users = await executeQuery(SQL, VALUES);
            return users;
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    static async getById({ id }) {
        try {
            const SQL = 'SELECT * FROM users WHERE user_id = ?'
            const VALUES = [Number(id)];
            const user = await executeQuery(SQL, VALUES);
            return user[0];
        } catch (error) {
            throw new Error(`Error al obtener usuario por id ${id}: ${error.message}`);
        }
    }

    static async getByIdentifier({ identifier }) {
        try {
            const SQL = 'SELECT user_id, email_address, user_handle, phone_number, password_hash FROM users WHERE email_address = ? OR user_handle = ? OR phone_number = ? '
            const VALUES = [identifier, identifier, identifier];
            const user = await executeQuery(SQL, VALUES);
            return user[0];
        } catch (error) {
            throw new Error(`Error al obtener usuario por indentificador ${identifier}: ${error.message}`);
        }
    }

    static async getFollowersCountById({ id }) {
        try {
            const SQL = 'SELECT follower_count FROM users WHERE user_id = ?'
            const VALUES = [Number(id)];
            const user = await executeQuery(SQL, VALUES);
            return user[0].follower_count;
        } catch (error) {
            throw new Error(`Error al obtener followers count: ${error.message}`);
        }
    }

    static async getFollowersById({ id, offset = 0, limit = 20 }) {
        try {
            const follower_count = await this.getFollowersCountById({ id });
            console.log(follower_count);
            if (follower_count === 0) return { count: 0, followers: [] }
        
            const SQL = `
                SELECT u.user_id, u.user_handle, u.first_name, u.last_name
                FROM users u
                JOIN followers f ON u.user_id = f.follower_id
                WHERE f.following_id = ?
                LIMIT ? OFFSET ?
            `

            const VALUES = [Number(id), Number(limit), Number(offset)];
            const followers = await executeQuery(SQL, VALUES);
        
            if (!followers) return { count: 0, followers: [] }
        
            const responseToReturn = {
                count: follower_count,
                followers,
            };
        
            return responseToReturn;
        } catch (error) {
            throw new Error(`Error al obtener followers: ${error.message}`);    
        }
    }

    static async createUser({ first_name, last_name, email, password, birthday }) {    
        try {
            const hash = await hashAsync(password, saltRounds);
            const SQL = `
                INSERT INTO users(user_handle, email_address, first_name, last_name, phone_number, birthday, password_hash)
                VALUES(?, ?, ?, ?, ?, ?, ?)
            `

            const phone_number = null;
            const user_handle = `@${normalizeText(first_name)}${normalizeText(last_name)}`
            const email = normalizeText(email);

            const VALUES = [user_handle, email, first_name, last_name, phone_number, birthday, hash];

            const insertResult = await executeQuery(SQL, VALUES);
        
            if(insertResult.affectedRows === 1) {
                const newUserId = insertResult.insertId;
                const user = await this.getById({ id: newUserId });
                return { status: insertResult.affectedRows, user: user[0] }
            } else {
                return { status: insertResult.affectedRows, user: null }
            }
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
      }
}