import { TweetModel } from "../models/tweet.js";

export class TweetsController {
  static async getAll(req, res) {
    const { offset, limit, userId } = req.query;
    const tweets = await TweetModel.getAll({ user_id: userId, offset, limit });

    if (!tweets) {
      return res.status(404).json({ message: 'No se encontraron tweets' });
    }

    res.json({ tweets });
  }

  static async create(req, res) {
    const { user_id } = req.context;
    const { content } = req.body;
    const newTweet = await TweetModel.create({ user_id, content });
    
    if (!newTweet) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  
    res.status(201).json({ tweet: newTweet });
  }

  static async getById(req, res) {
    const { id } = req.params;
    const tweet = await TweetModel.getById({ id });
  
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }
  
    res.json({ tweet });
  }
}
