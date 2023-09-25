import { query } from '../db.js';
import { promisify } from 'util';
import { hash } from 'bcrypt';
const saltRounds = 10;
const hashAsync = promisify(hash);

class Users {
  constructor({}) {}

  static async getUsers({ req, res, offset = 0, limit = 20 }) {
    try {
      const SQL = 'SELECT * FROM users LIMIT ? OFFSET ?';
      const VALUES = [Number(limit), Number(offset)];
      const users = await query(SQL, VALUES);
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error al obtener usuarios: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getUserById({ id, req, res }) {
    try {
      const SQL = 'SELECT * FROM users WHERE user_id = ?'
      const VALUES = [Number(id)];
      const user = await query(SQL, VALUES);
      if (user.length === 0) return res.status(404).json({ message: 'User not found' });

      return user[0];
    } catch (error) {
      console.error('Error al obtener usuario: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getUserByIdentifier({ identifier, req, res }) {
    try {
      const SQL = 'SELECT user_id, email_address, user_handle, phone_number, password_hash FROM users WHERE email_address = ? OR user_handle = ? OR phone_number = ? '
      const VALUES = [identifier, identifier, identifier];
      const user = await query(SQL, VALUES);
      return user[0];
    } catch (error) {
      console.error('Error al obtener usuario: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getUserFollowers({ id, req, res, offset = 0, limit = 20 }) {
    try {
      const SQL_GET_FOLLOWER_COUT = 'SELECT follower_count FROM users WHERE user_id = ?'
      const VALUES_TO_FOLLOWE_COUNT = [Number(id)];
      const user = await query(SQL_GET_FOLLOWER_COUT, VALUES_TO_FOLLOWE_COUNT);

      if (user.length === 0) return res.status(404).json({ message: 'User not found' });

      const SQL_TO_GET_FOLLOWERS_INFO = `
        SELECT u.user_id, u.user_handle, u.first_name, u.last_name
        FROM users u
        JOIN followers f ON u.user_id = f.follower_id
        WHERE f.following_id = ?
        LIMIT ? OFFSET ?
      `
      const VALUES_TO_GET_FOLLOWERS_INFO = [Number(id), Number(limit), Number(offset)];
      const followers = await query(SQL_TO_GET_FOLLOWERS_INFO, VALUES_TO_GET_FOLLOWERS_INFO);

      if (followers.length === 0) return res.status(404).json({ message: 'Followers not found' });

      const responseToReturn = {
        count: user[0].follower_count,
        followers,
      };

      res.status(200).json(responseToReturn);
    } catch (error) {
      console.error('Error al obtener followers: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async createUser({ first_name, last_name, email, password, birthday, req, res }) {
    const normalizeText = (text) => text.split(' ').join('').trim().toLowerCase()

    try {
      const hash = await hashAsync(password, saltRounds);
      const SQL = `
        INSERT INTO users(user_handle, email_address, first_name, last_name, phone_number, birthday, password_hash)
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `
      const phone_number = '';
      const VALUES = [`@${normalizeText(first_name)}${normalizeText(last_name)}`, normalizeText(email), first_name, last_name, phone_number === '' ? null : phone_number , birthday, hash];
      const insertResult = await query(SQL, VALUES);

      if(insertResult.affectedRows === 1) {
        const selectQuery = 'SELECT user_id, email_address, user_handle FROM users WHERE user_id = ?';
        const selectValues = [insertResult.insertId];
        const user = await query(selectQuery, selectValues);

        return { status: insertResult.affectedRows, user: user[0] }
      }
    } catch (error) {
      console.error('Error al crear usuario: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default Users;
