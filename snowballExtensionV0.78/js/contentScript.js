
function $(id) {return document.getElementById(id);}
function tags(tag) {return document.getElementsByTagName(tag);}
function klass(name) {
   var res = document.getElementsByClassName(name);
   return (res == null ? [null] : res);
}

function mouseEvent(e, event) {
   if (e == null || e.dispatchEvent == null) return;
   var evt = document.createEvent("MouseEvents");
   evt.initMouseEvent(event, true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, e);
   e.dispatchEvent(evt);
}

function click(e) {
   if ($("playPause") != null) {
      mouseEvent(e, "mouseover");
      mouseEvent(e, "mousedown");
      mouseEvent(e, "mouseup");
   } else mouseEvent(e, "click");
}


function isDisplayed(e) {
   if (e == null || e.style == null) return false;
   return (e.style.display != "none" && e.style.visibility != "hidden");
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
   if (request.action == "getStatus")
      contentScript.getStatus();
   else if (request.action == "refresh" || contentScript.tryAll(request.action))
      contentScript.refresh();
});

function hasYoutubePlayer() {
   var embeds = tags("embed");
   return (embeds != null && embeds.length != null && embeds.length > 0 && embeds[0] != null && embeds[0].playVideo != null);
}

var contentScript = {
   retry: false,
   delay: [300, 1500, 3000],
   init: function() {
      if (hasYoutubePlayer()) {
         this.getStatus();
         retry = false;
         return;
      }
      this.findButtons();
      this.setListeners();
      for (var i = 0; i < this.play.length; i++) {
         if (this.play[i] != null) {
            this.getStatus();
            retry = false;
            return;
         }
      }
      if (!this.retry) {
         this.retry = true;
         setTimeout(function() {contentScript.init();}, 3000);
      } else chrome.extension.sendRequest({action: "setStatus", hasMusic: false});
   },
   setListeners: function() {
      var elements = ["play", "pause", "next", "previous", "thumbUp", "thumbDown", "favorite", "songName", "artistName"]; 
      for (var i = 0; i < elements.length; i++) {
         var e = this.get(elements[i]);
         if (e == null || e.getAttribute == null || e.getAttribute("setListeners") == "1")
            continue;
         e.setAttribute("setListeners",  "1");
         e.addEventListener("click", function() {
            contentScript.timedRefresh();
         });
         e.onchange = e.onChange = function() {
            contentScript.timedRefresh();
         };
      }
   },
   refresh: function() {
      contentScript.init();
   },
   timedRefresh: function() {
      this.refresh();
      for (var i = 0; i < this.delay.length; i++)
         setTimeout(function() {contentScript.refresh();}, this.delay[i]);
   },
   
   // esta es la funcion donde se controlan los css que manipulan las acciones del player
   findButtons: function() {
      //this.play = [klass("play_pause")[0]];
      this.play = [klass("play_button controls_button")[0]];
      //this.pause = [klass("play_pause")[0]];
	  this.pause = [klass("play_button controls_button paused")[0]];
      //this.next = [klass("next")[0]];
	  this.next = [$("next_button")];
      //this.previous = [klass("prev")[0]];
	  this.previous = [klass("controls_button")[0]];
      //this.thumbUp = [klass("thumbUpButton")[0], $("thumbsUpPlayer"), $("watch-like")];
      //this.thumbDown = [klass("thumbDownButton")[0], $("thumbsDownPlayer"), $("watch-unlike")];
      //this.favorite = [klass("isFavorite"), $("np-fav")];
	  //this.songName = [klass("text_metadata")[0]];
      //this.artistName = [klass("text_metadata")[0]];
      this.songName = [$("display_song")];
      this.artistName = [$("display_artist")];
   },
   tryAll: function(cmd) {
      if (hasYoutubePlayer()) {
         this.youtubeCmd(tags("embed")[0], cmd);
         return true;
      }
      for (var i = 0; i < this[cmd].length; i++) {
         if (this[cmd][i] != null) {
            click(this[cmd][i]);
            return true;
          }
       }
       return false;
   },
   youtubeCmd: function(player, cmd) {
      switch (cmd) {
      case "play":
      case "pause":
         if (player.getPlayerState() == 1)
            player.pauseVideo();
         else
            player.playVideo();
         break;
      case "previous":
         player.seekTo(0, true);
         break;
      case "thumbUp":
         click($("watch-like"));
         break;
      case "thumbDown":
         click($("watch-unlike"));
         break;
      }
   },
   get: function(cmd) {
      if (this[cmd] == null) return null;
      for (var i = 0; i < this[cmd].length; i++) {
         if (this[cmd][i] != null) {
            return this[cmd][i];}}
      return null;
   },
   has: function(cmd) {
      if (hasYoutubePlayer() && (cmd == "previous" || cmd == "thumbUp" || cmd == "thumbDown")) return true;
      return (this.get(cmd) != null);
   },
   getStatus: function() {
      var request = {action: "setStatus", hasMusic: true, songName:this.getSongName(), artistName:this.getArtistName(), isPlaying:this.isPlaying(), hasNext:this.has("next"), hasPrevious:this.has("previous")};
      chrome.extension.sendRequest(request);
   },
   getFaviconUrl: function() {
      var links = tags("link");
      var failed = false;
      for (var i = 0; i < links.length; i++) {
         var rel = links[i].getAttribute("rel").toLowerCase();
         if (rel == "shortcut icon" || rel == "icon shortcut" || (failed && rel == "icon")) {
            var href = links[i].getAttribute("href");
            if (/^\/\//.test(href))
               href = "http:" + href;
            if (!/\.(com|net|org)\//.test(href)) {
               var url = window.location.href;
               var index = url.indexOf(".com/");
               if (index == -1) index = url.indexOf(".net/");
               if (index == -1) index = url.indexOf(".org/");
               url = url.substring(0, index + 4);
               href = url + href;
            }
            return href;
         } else if (i+1 == links.length && !failed) {
            i = -1;
            failed = true;
         }
      }
   },
   getSongName: function() {
      if (hasYoutubePlayer()) {
         var ad = "";
         if (tags("embed")[0].getPlayerState() == -1) ad = "[Advertisement] ";
         var headline = $("watch-headline-title");
         if (headline != null) return ad + headline.innerText;
         return ad + ($("eow-title") != null ? $("eow-title").getAttribute("title") : "YouTube Video");
      }
      var e = this.get("songName");
      if (e != null && (e.innerText == null || e.innerText == "" || e.childElementCount > 0)) {
         for (var i = 0; i < e.childNodes.length; i++) {
            if (e.childNodes[i].innerText != null && e.childNodes[i].innerText != ""
               && e.childNodes[i].getAttribute != null && e.childNodes[i].getAttribute("class") != null && e.childNodes[i].getAttribute("class").indexOf("artist") < 0) {
               e = e.childNodes[i];
               break;
            }
         }
      }
      return (e == null ? "" : e.innerText);
   },
   getArtistName: function() {
      if (hasYoutubePlayer()) return "";
      var e = this.get("artistName");
      if (e != null && (e.innerText == null || e.innerText == "" || e.childElementCount > 0)) {
         for (var i = 0; i < e.childNodes.length; i++) {
            if (e.childNodes[i].innerText != null && e.childNodes[i].innerText != ""
               && e.childNodes[i].getAttribute != null && e.childNodes[i].getAttribute("class") != null && e.childNodes[i].getAttribute("class").indexOf("song") < 0) {
               e = e.childNodes[i];
               break;
            }
         }
      }
      return (e == null ? "" : e.innerText);
   },
   isPlaying: function() {
      var e;
      /*if (hasYoutubePlayer())
         return (tags("embed")[0].getPlayerState() == 1);
      else if ((e = $("playPause")) != null)
         return ($("playPause").getAttribute("title") == "Pause");
      else if ((e = $("play")) != null)
         return (e.getAttribute("class") == "control pause")
      else if ((e = $("player_play_pause")) != null)
         return /pause/.test(e.getAttribute("class"));
      else if ((e = klass("playButton")[0]) != null)
         return e.style.display == "none";*/
      //else if ((e = klass("play_pause")[0]) != null)
	  if ((e = klass("play_pause")[0]) != null)
         return (e.getAttribute("class").indexOf("playing") >= 0);
      return isDisplayed(this.get("pause"));
   }
};





contentScript.init();