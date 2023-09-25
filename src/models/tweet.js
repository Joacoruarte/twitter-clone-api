import { executeQuery } from "../db.js";
import formatTweet from "../utils/formatTweet.js";

export class TweetModel {
    static async getAll({ user_id = false,  offset = 0, limit = 20}) {
        try {
            if(user_id) return await this.getAllByUserId({user_id, offset, limit});

            const SQL = `
                SELECT t.tweet_id, t.tweet_text, t.created_at AS tweet_created_at, t.num_comments, t.num_retweets, t.num_likes, u.user_id, u.user_handle, u.first_name, u.last_name, u.user_picture, u.created_at AS user_created_at
                FROM tweets t
                JOIN users u ON t.user_id = u.user_id
                ORDER BY t.created_at DESC
                LIMIT ? OFFSET ?
            `;
            const VALUES = [Number(limit), Number(offset)];
            const tweets = await executeQuery(SQL, VALUES);
            return tweets.map(formatTweet);
        } catch (error) {
            throw new Error(`Error al obtener tweets: ${error.message}`);
        }
    }

    static async getAllByUserId({user_id, offset = 0, limit = 20}) {
        try {
            const SQL = `
                SELECT t.tweet_id, t.tweet_text, t.created_at AS tweet_created_at, t.num_comments, t.num_retweets, t.num_likes, u.user_id, u.user_handle, u.first_name, u.last_name, u.user_picture, u.created_at AS user_created_at, follower_id, following_id 
                FROM followers
                JOIN users u ON user_id = following_id
                JOIN tweets t ON u.user_id = t.user_id
                WHERE follower_id = ?
                ORDER BY t.created_at DESC
                LIMIT ? OFFSET ?;
            `;
            const VALUES = [Number(user_id), Number(limit), Number(offset)];
            const tweets = await executeQuery(SQL, VALUES);
            return tweets.map(formatTweet);
        } catch (error) {
            throw new Error(`Error al obtener tweets: ${error.message}`);
        }
    }

    static async getById({ id }) {
        try {
            if (!id) throw new Error('No se ha recibido un id de tweet');
            const SQL = `
                SELECT t.tweet_id, t.tweet_text, t.created_at AS tweet_created_at, t.num_comments, t.num_retweets, t.num_likes, u.user_id, u.user_handle, u.first_name, u.last_name, u.user_picture, u.created_at AS user_created_at
                FROM tweets t
                JOIN users u ON t.user_id = u.user_id
                WHERE tweet_id = ?
            `;
            const VALUES = [Number(id)];
            const tweet = await executeQuery(SQL, VALUES);
            return formatTweet(tweet[0]);
        } catch (error) {
            throw new Error(`Error al obtener tweet: ${error.message}`);
        }
    }

    static async create({ user_id, content }) {
        try {
            const SQL = 'INSERT INTO tweets (user_id, tweet_text) VALUES (?, ?)';
            const VALUES = [Number(user_id), content];
            const tweet = await executeQuery(SQL, VALUES);
            const tweetId = tweet.insertId;
            const newTweet = await this.getById({ id: tweetId });
            return newTweet;
        } catch (error) {
            throw new Error(`Error al crear tweet: ${error.message}`);
        }
    }
}