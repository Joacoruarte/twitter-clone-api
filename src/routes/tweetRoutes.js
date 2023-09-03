const express = require('express');
const router = express();
const Tweets = require('../modules/tweets');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/', authenticateToken , async (req, res) => {
  const { offset, limit, userId } = req.query;

  if(userId !== undefined)  {
    const tweets = await Tweets.getTweetsForUserFollower({ user_id: userId, res, offset, limit });
    return res.json({ tweets });
  }
  const tweets = await Tweets.getTweetsForUser({ res, offset, limit });
  res.json({ tweets });
});

router.post('/', authenticateToken, async (req, res) => {
  const { user_id } = req.context;
  const { content } = req.body;
  
  const newTweet = await Tweets.createTweet({ user_id, content, req, res });
  res.status(201).json({ tweet: newTweet });
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const tweet = await Tweets.getTweetById({ id, req, res });
  res.json({ tweet });
});

module.exports = router;
