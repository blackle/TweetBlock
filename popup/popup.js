
document.addEventListener('DOMContentLoaded', function() {
  window.blocked_tweets_db = new BlockedTweetsDB(function(){
    numtweets = Object.keys(window.blocked_tweets_db.db).length;
    document.getElementById('num_tweets_blocked').innerHTML = numtweets;
  });

  document.getElementById('edit_list_link').addEventListener('click',
    function(){
      chrome.tabs.create({'url': "/options/options.html" });
    });
});
