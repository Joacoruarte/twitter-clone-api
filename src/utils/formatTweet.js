import TweetDTO from "../dtos/tweet.js";
import UserDTO from "../dtos/user.js";

function formatTweet(tweet) {
    const tweetDTO = new TweetDTO({
      tweet_id: tweet.tweet_id,
      tweet_text: tweet.tweet_text,
      num_comments: tweet.num_comments,
      num_likes: tweet.num_likes,
      created_at: tweet.tweet_created_at,
    });
  
    const userDTO = new UserDTO({
      user_id: tweet.user_id,
      user_handle: tweet.user_handle,
      first_name: tweet.first_name,
      last_name: tweet.last_name,
      user_picture: tweet.user_picture,
      created_at: tweet.user_created_at,
    });
  
    return {
      ...tweetDTO,
      user: {
        ...userDTO,
      },
    };
}

export default formatTweet;
  