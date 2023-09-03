class TweetDTO {
  constructor({ tweet_id, tweet_text, num_comments, num_likes, created_at }) {
    this.tweet_id = tweet_id;
    this.tweet_text = tweet_text;
    this.num_comments = num_comments;
    this.num_likes = num_likes;
    this.created_at = created_at;
  }
}


module.exports = TweetDTO;
