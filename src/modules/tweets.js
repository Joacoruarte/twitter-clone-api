import { query } from '../db.js';
import formatTweet from '../utils/formatTweet.js';

class Tweets {
  constructor({}) {}

  static async getTweetsForUser({ res, offset = 0, limit = 20 }) {
    try {
      const sql = `
            SELECT t.tweet_id, t.tweet_text, t.created_at AS tweet_created_at, t.num_comments, t.num_retweets, t.num_likes, u.user_id, u.user_handle, u.first_name, u.last_name, u.user_picture, u.created_at AS user_created_at
            FROM tweets t
            JOIN users u ON t.user_id = u.user_id
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?
        `;
      const values = [Number(limit), Number(offset)];
      const tweets = await query(sql, values);

      const formatedTweets = tweets.map(formatTweet);
      return formatedTweets;
    } catch (error) {
      console.error('Error al obtener tweets: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getTweetsForUserFollower({
    user_id,
    res,
    offset = 0,
    limit = 20,
  }) {
    try {
      const sql = `
            SELECT t.tweet_id, t.tweet_text, t.created_at AS tweet_created_at, t.num_comments, t.num_retweets, t.num_likes, u.user_id, u.user_handle, u.first_name, u.last_name, u.user_picture, u.created_at AS user_created_at, follower_id, following_id 
            FROM twitter_db.followers
            JOIN twitter_db.users u ON user_id = following_id
            JOIN twitter_db.tweets t ON u.user_id = t.user_id
            WHERE follower_id = ?
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?;
        `;
      const values = [Number(user_id), Number(limit), Number(offset)];
      const tweets = await query(sql, values);

      const formatedTweets = tweets.map(formatTweet);
      return formatedTweets;
    } catch (error) {
      console.error('Error al obtener tweets: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getTweetById({ id, res }) {
    try {
      const tweet = await query(
        `
            SELECT t.tweet_id, t.tweet_text, t.created_at AS tweet_created_at, t.num_comments, t.num_retweets, t.num_likes, u.user_id, u.user_handle, u.first_name, u.last_name, u.user_picture, u.created_at AS user_created_at
            FROM tweets t
            JOIN users u ON t.user_id = u.user_id
            WHERE tweet_id = ?
        `,
        [Number(id)]
      );
      if (tweet.length === 0)
        return res.status(404).json({ message: 'Tweet not found' });

      return formatTweet(tweet[0]);
    } catch (error) {
      console.error('Error al obtener tweet: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async createTweet({ user_id, content, req, res }) {
    try {
      const tweet = await query(
        `
            INSERT INTO tweets (user_id, tweet_text)
            VALUES (?, ?)
            `,
        [Number(user_id), content]
      );

      const newTweet = await this.getTweetById({ id: tweet.insertId, res });

      return newTweet;
    } catch (error) {
      console.error('Error al crear tweet: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default Tweets;
