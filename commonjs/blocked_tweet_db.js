function relative_complement(A, B) {
    return A.filter(function(elem) {return B.indexOf(elem) == -1});
}
 
// in A or in B but not in both
function symmetric_difference(A,B) {
    return relative_complement(A,B).concat(relative_complement(B,A));
}

class BlockedTweetsDB {
  constructor(callback, extern_update_callback){
    this.db = {}
    var blocked_tweet_scope = this;
    chrome.storage.sync.get('db', function (result) {
      if(typeof result === "object" && typeof result.db === "object"){
        blocked_tweet_scope.db = result.db;
        console.log("TweetBlock: DB loaded from storage");
      }
      callback();
    });

    //update timeline when there's an external database change
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      for (var key in changes) {
        if(key === 'db'){
          var storageChange = changes[key];
          var newtweets = Object.keys(storageChange.newValue).sort();
          var oldtweets = Object.keys(blocked_tweet_scope.db).sort();
          var differencetweets = symmetric_difference(newtweets,oldtweets);
          if(differencetweets.length !== 0){
            blocked_tweet_scope.db = storageChange.newValue;
            console.log("TweetBlock: Observed external update");
            for(var i = 0; i < differencetweets.length; i++){
              extern_update_callback(differencetweets[i]);
            }
          }
        }
      }
    });
  }

  db_update(callback){
    chrome.storage.sync.set({'db': this.db}, callback);
  }

  block_tweet(tweet_id, callback){
    this.db[tweet_id] = {blocked: true, date: new Date().getTime()};
    this.db_update(callback);
  }

  unblock_tweet(tweet_id, callback){
    delete this.db[tweet_id];
    this.db_update(callback);
  }

  query_tweet(tweet_id){
    return(typeof this.db[tweet_id] === "object");
  }
}