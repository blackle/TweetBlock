
function update_from_external(tweetId){
  var tweets = document.querySelectorAll("[data-tweet-id='"+tweetId+"']");
  if(tweets){ 
    for(var i = 0; i < tweets.length; i++){
      var tweet = tweets[i] 
      //add class depending on blockness
      var blockstatus = window.blocked_tweets_db.query_tweet(tweetId);
      console.log(document.querySelectorAll("[data-tweet-id='"+tweetId+"']"));

      if(blockstatus){
        tweet.classList.add('tweetblock-tweet-blocked', 'tweetblock-tweet-disabled');
        tweet.classList.remove('tweetblock-tweet-unblocked', 'tweetblock-tweet-enabled');
      } else {
        tweet.classList.add('tweetblock-tweet-unblocked', 'tweetblock-tweet-enabled');
        tweet.classList.remove('tweetblock-tweet-blocked', 'tweetblock-tweet-disabled');
      }
    }
  } else {
    return false;
  }
}

function deal_with(tweet){
  var tweetId = tweet.dataset.tweetId;
  //add class depending on blockness
  var blockstatus = window.blocked_tweets_db.query_tweet(tweetId);

  if(tweet.classList.contains('tweetblock-tweet-seen')){
    //if we've seen this already delete the inert buttons
    var block_btn_contain = tweet.getElementsByClassName('ProfileTweet-action--tweetblock')[0];
    var show_anyway_contain = tweet.getElementsByClassName('tweetblock-show-anyway-action')[0];
    block_btn_contain.parentNode.remove(block_btn_contain);
    show_anyway_contain.parentNode.remove(show_anyway_contain);
  } else {
    tweet.classList.add('tweetblock-tweet-seen');
  }


  if(blockstatus){
    tweet.classList.remove('tweetblock-tweet-unblocked', 'tweetblock-tweet-enabled');
    tweet.classList.add('tweetblock-tweet-blocked', 'tweetblock-tweet-disabled');
  } else {
    tweet.classList.remove('tweetblock-tweet-blocked', 'tweetblock-tweet-disabled');
    tweet.classList.add('tweetblock-tweet-unblocked', 'tweetblock-tweet-enabled');
  }
  tweet.style.display = 'block';

  var populate_actionlist = function(){
    //select the 'more options' elipses thing
    var actionlist_dom = tweet.getElementsByClassName("ProfileTweet-action--more")[0];

    if(actionlist_dom){
      //do nothing
    } else {
      return false;
    }

    //create block button
    var block_btn_contain = document.createElement("div");
    block_btn_contain.classList.add('ProfileTweet-action', 'ProfileTweet-action--tweetblock');

    var block_btn = document.createElement("button");
    block_btn.classList.add('ProfileTweet-actionButton', 'tweetblock-blockbtn');
    block_btn.setAttribute('type', 'button');
    block_btn.setAttribute('title', 'Block Tweet');

    //block button functionality
    block_btn.onclick = function(){
      if(window.blocked_tweets_db.query_tweet(tweetId)){
        window.blocked_tweets_db.unblock_tweet(tweetId, function(){
          tweet.classList.remove('tweetblock-tweet-blocked', 'tweetblock-tweet-disabled');
          tweet.classList.add('tweetblock-tweet-enabled', 'tweetblock-tweet-unblocked');
        });
      } else {
        window.blocked_tweets_db.block_tweet(tweetId, function(){
          tweet.classList.remove('tweetblock-tweet-enabled', 'tweetblock-tweet-unblocked');
          tweet.classList.add('tweetblock-tweet-blocked', 'tweetblock-tweet-disabled');
        });
      }
    }

    block_btn_contain.appendChild(block_btn);
    actionlist_dom.parentNode.insertBefore(block_btn_contain, actionlist_dom);

    //create "show anyway" button
    var show_anyway_contain = document.createElement("div");
    show_anyway_contain.classList.add('tweetblock-show-anyway-action');

    var show_anyway = document.createElement("button");
    show_anyway.classList.add('btn', 'small', 'tweetblock-show-anyway-button');
    show_anyway.setAttribute('type', 'button');
    show_anyway.innerHTML = "Toggle visibility";

    show_anyway.onclick = function(){
      tweet.classList.toggle('tweetblock-tweet-enabled');
      tweet.classList.toggle('tweetblock-tweet-disabled');
    }

    show_anyway_contain.appendChild(show_anyway);
    tweet.appendChild(show_anyway_contain);
    return true;
  }

  //sometimes we get an incomplete dom so the actionlist isn't even here yet, so
  //this is our little way of fixing that
  if(populate_actionlist()){
    return true;
  } else {
    var actionlist_wait = window.setInterval(function(){
      if(populate_actionlist()){
        window.clearTimeout(actionlist_wait);
      }
    },50);
  }
}


function bootstrap(){
  //find the stream element by polling
  //once found, filter all tweets currently in it
  //then start mutation observer

  var check_attempts = 50;

  //give up after 50*check_attempt milliseconds
  setTimeout(function(){
      window.clearTimeout(window.stream_poller);
  }, 50*check_attempts)

  window.stream_poller = setInterval(function() {
    var stream_dom = document.getElementsByClassName("stream-items");
    if(stream_dom.length != 0){
      window.clearTimeout(window.stream_poller);

      console.log("TweetBlock: Found stream");

      //set current context
      stream_dom = stream_dom[0];

      //get tweets currently loaded
      var tweet_doms = stream_dom.getElementsByClassName("tweet");

      //loop thru 'em and analyze
      for(var i = 0; i < tweet_doms.length; i++) {
        tweet_doms[i].style.display = 'none';
        deal_with(tweet_doms[i]);
      }

      //if the page has moved because of a history push, this should catch it
      window.page_watch = new MutationObserver(function(mutations) {
        window.clearTimeout(window.stream_poller);
        bootstrap();
      });
      window.page_watch.observe(document.getElementById("page-container"), { attributes: true });

      window.stream_watch = new MutationObserver(function(mutations) {
        // console.log(mutations);

        for(var i = 0; i < mutations.length; i++){
          var mutation = mutations[i];
          var mutationnodes = mutation.addedNodes;
          if(mutationnodes[0] instanceof HTMLElement){
            for(var j = 0; j < mutationnodes.length; j++){
              var tweet_doms = mutationnodes[j].getElementsByClassName("tweet");

              for(var k = 0; k < tweet_doms.length; k++) {
                deal_with(tweet_doms[k]);
              }
            }
          }
        }
      });
      window.stream_watch.observe(stream_dom, { childList: true });
    } else {
      console.log("looking for stream");
    }
  },50);
}

//kick everything off by loading the tweet database
window.blocked_tweets_db = new BlockedTweetsDB(bootstrap, update_from_external);
