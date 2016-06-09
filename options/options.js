function add_tweet_to_list(tweetId){
  //create list item
  var list_item_contain = document.createElement("div");
  list_item_contain.classList.add('blocked-tweet-list-item', 'blocked-tweet-embed-hidden');
  list_item_contain.dataset.tweetId = tweetId;

  var blockinfo_div = document.createElement("div");
  blockinfo_div.classList.add('blockinfo');

  blockinfo_div.innerHTML = "Block date: " + new Date(window.blocked_tweets_db.db[tweetId].date).toLocaleString();

  //make toggle view buttons
  var view_toggle_btn = document.createElement("button");
  view_toggle_btn.classList.add('blocked-tweet-list-view-button', 'btn', 'small');
  view_toggle_btn.setAttribute('type', 'button');
  view_toggle_btn.innerHTML = "Toggle visibility";
  view_toggle_btn.onclick = function(){
    list_item_contain.classList.toggle('blocked-tweet-embed-hidden');
  }

  var unblock_btn = document.createElement("button");
  unblock_btn.classList.add('blocked-tweet-list-unblock-button', 'btn', 'small');
  unblock_btn.setAttribute('type', 'button');
  unblock_btn.innerHTML = "Unblock";
  unblock_btn.onclick = function(){
    if (window.confirm("Confirm unblock?")) { 
      window.blocked_tweets_db.unblock_tweet(tweetId, function(){
        list_item_contain.parentNode.removeChild(list_item_contain);
      });
    }
  }

  list_item_contain.appendChild(blockinfo_div);
  list_item_contain.appendChild(view_toggle_btn);
  list_item_contain.appendChild(unblock_btn);

  var list_item_embed_contain = document.createElement("div");
  list_item_embed_contain.classList.add('blocked-tweet-embed-container');
  list_item_contain.appendChild(list_item_embed_contain);

  twttr.widgets.createTweet(
    tweetId,
    list_item_embed_contain,
    {
      conversation: 'none',
      align: 'center'
    }
  ).then( function( el ) {
    if(!el){
      list_item_contain.removeChild(view_toggle_btn);
      list_item_embed_contain.innerHTML = "<b>Tweet Missing</b>";
      list_item_contain.classList.remove('blocked-tweet-embed-hidden');
    }
    document.getElementById("blocked-tweets-list").appendChild(list_item_contain);
  });

}

function remove_tweet_from_list(tweetId){
  var tweet = document.querySelectorAll("[data-tweet-id='"+tweetId+"']")[0];
  if(tweet){ 
    tweet.parentNode.removeChild(tweet);
  }
}


document.addEventListener('DOMContentLoaded', function() {
  window.blocked_tweets_db = new BlockedTweetsDB(function(){
    for(var key in window.blocked_tweets_db.db){
      add_tweet_to_list(key);
    }
  }, function(tweetId){
    var blockstatus = window.blocked_tweets_db.query_tweet(tweetId);
    if(blockstatus){
      add_tweet_to_list(tweetId);
    } else {
      remove_tweet_from_list(tweetId);
    }
  });
});
