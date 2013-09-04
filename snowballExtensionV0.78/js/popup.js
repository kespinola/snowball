// Global variables

// Variables for restful call services  (snowball api)!
var token;
var infod;
var infod0;
var infod1;
var infod2;
var infod3;
var infod4;
var infod5;
var infod6;
var infod7;

// Facebook Variables.
var facebookname = new Array();  
var facebookid= new Array();
var idsUser = new Array();
var postFacebookId;
var idList;
var userIdList;
var generaluserId;
var marker=0;
var valorRecibidoidList;
var returnSongs = new Array();	
var thereList;
var tokeInformation;
var session;
				
//  -Creating Playlist if user has not List.- 
		
var addPlaylist = function (id)
{
    var req = new XMLHttpRequest();
    req.open("POST", "http://m80.us/apisnow/index.php/playlist/addPlaylist", true);
    var user_id= id;
    var name= "Playlist of"+id;
    var description= "This list beongs to ";
    var params = "user_id="+user_id+"&name="+name+"&description="+description;
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", params.length);
    req.setRequestHeader("Connection", "close");
    req.send(params);
    req.onreadystatechange = function() 
    { 
        if (req.readyState == 4)
			if (req.status == 200)
			{ 
			   //console.log("Playlist added sucessfully");
			}
            else
			{
			  //console.log("problems adding the list "+req.status);
			}
    };
    return false;
}

//  -Adding songs on Playlist.- 

var addSongPlaylist = function (id_playlist,id_song)
{
    var req1 = new XMLHttpRequest();                  
    req1.open("POST", "http://m80.us/apisnow/index.php/song/addSongPlaylist", true);
    var playlist_id= id_playlist;
    var song_id= id_song;
	var params1 = "playlist_id="+playlist_id+"&song_id="+song_id;
    req1.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req1.setRequestHeader("Content-length", params1.length);
    req1.setRequestHeader("Connection", "close");
    req1.send(params1);
    req1.onreadystatechange = function() 
    { 
          if (req1.readyState == 4)
			if (req1.status == 200)
			{ 
			   //console.log("Song added sucessfully");
			}
            else
			{
			  //console.log("problems adding the song "+req1.status);
			}
    };
    return false;
} 


//  -In Spanish: adding information on Song.- 

var addSongInformation = function (id_song)
{
    var req = new XMLHttpRequest();
    req.open("POST", "http://m80.us/apisnow/index.php/song/addSong", true);
    var song_id= id_song;
    var description= "Love your shares";
    var params = "song_id="+song_id+"&description="+description;
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", params.length);
    req.setRequestHeader("Connection", "close");
    req.send(params);
    req.onreadystatechange = function() 
    { 
        // If the request completed, close the extension popup
        if (req.readyState == 4)
			if (req.status == 200)
			{ 
			   //console.log("Song information added successfully");
			}
            else
			{
			  //console.log("problems adding the Song information"+req.status);
			}
    };
    return false;
}

///////////////////////////////////////  Start Alternative for User Playlist Function ///////////////////////////////////////////////////77777777

var mute = false,
	playing = false,
	volumn = 1,
	order = ["relevance", "published", "viewCount", "rating"];
var currentPlaylistItem = 0;
playlist = ["9f95lAIL8to","ECU-SzgEAxc","RfrdufzXKlQ"];
searchFromArray = function(){
	console.log('run search array');
	loadPlaylist(playlist[currentPlaylistItem]);
}
loadPlaylist = function(query){
    $.ajax({
		url: "http://gdata.youtube.com/feeds/api/videos/"+query+"?v=2&alt=json",
		dataType: "json",
		cache: false
	})
	.done(fillSearchArrayResult);
}
fillSearchArrayResult = function(jsonObject){
	var result = chrome.extension.getBackgroundPage().loadVideo({'duration':jsonObject.entry.media$group.yt$duration.seconds,'link':jsonObject.entry.link[0].href, 'thumb':jsonObject.entry.media$group.media$thumbnail[0].url,'title':jsonObject.entry.title.$t,'thumb':jsonObject.entry.media$group.media$thumbnail[0].url});
	console.log('load video: ', jsonObject.entry.link[0].href);
	updateCurrentPlaylist();
	currentPlaylistItem ++;
	if(currentPlaylistItem < playlist.length)
		loadPlaylist(playlist[currentPlaylistItem]);
}
SearchRequestData = function() {
	$.ajax({
		url: "http://gdata.youtube.com/feeds/api/videos?max-results=50&format=5&alt=json&q="+$("#searchBar").val()+"&orderby="+order[0],
		dataType: "json",
		cache: false
	})
	.done(fillSearchResult);
}
loadCurrentList = function(){
	console.log(localStorage.getItem('playlist'));
	for(var i = 0; i < 5; i++) {	
		updateCurrentPlaylist();
	}
}
updateCurrentPlaylist = function(){
	var playlist = chrome.extension.getBackgroundPage().getPlaylist();
	$("#playlistContainer>table>tbody").html("");
	for(var i = 0; i < playlist.length; i++) {
		$("#playlistContainer>table>tbody").append(
			$("<tr/>")
			.append(
				$("<td/>").css("width","40px").append(
					$("<img/>")
						.css("width","40px")
						.attr("src",playlist[i].thumb)
				)
			)
			.append(
				$("<td/>").css("width","431px").append(
					$("<a/>")
						.attr("rel", "tooltip")
						.attr("id", i)
						.html(playlist[i].title)
						.css("cursor","pointer")
						.click(function(){
							chrome.extension.getBackgroundPage().playItem(this.id);
							$("#btnPlayStop").children(0).attr("class","icon icon-stop");
							playing = true;
							updateTitleSong();
						})
				)
			).append(
				$("<td/>").append(
					$("<button/>")
						.attr("class", "remove")
						.attr("title", "Remove")
						.attr("id", "del" + i)
						.click(function(){
							var _id = $(this).prop('id');
							_id = _id.substr(3, 1);
							chrome.extension.getBackgroundPage().removePlaylistItem(_id);
							$(this).parents("tr").hide('fast',function(){$(this).remove();});
						})
				)
			)
		)
	}
}
updateTitleSong = function(){
	setInterval(function(){
		$("#songTitle").html(chrome.extension.getBackgroundPage().getPlaylistTitle());
	}, 1000);
}
init = function() {
	mute = chrome.extension.getBackgroundPage().getMuteState();
	playing = chrome.extension.getBackgroundPage().getPlayState();
	volumn = chrome.extension.getBackgroundPage().getVolume();
	if(playing) {
		console.log("playing if", playing);
		$("#btnPlayStop").children(0).attr("class","icon icon-stop");
	} else {
		console.log("playing else", playing);
		$("#btnPlayStop").children(0).attr("class","icon icon-play");
	}
	if(mute) {
		$("#btnVolumn").children(0).addClass("icon-volume-mute").removeClass("icon-volume-up");
	}
	$("#brVolumn").val(volumn);
	$("#songTitle").html(chrome.extension.getBackgroundPage().getPlaylistTitle());

	searchFromArray();
	updateCurrentPlaylist();
	updateTitleSong();
}
$(function(){	
	$("#searchBar").keyup(function(){
		search();
	});
	$("#btnPrev").click(function(){
		chrome.extension.getBackgroundPage().playPrev();
	});
	$("#btnPlayStop").click(function() {
		if(playing) {
			$(this).children(0).attr("class","icon icon-play");
		} else {
			$(this).children(0).attr("class","icon icon-stop");
		}
		playing = !playing;
		chrome.extension.getBackgroundPage().togglePlayState();
	});			
	$("#btnNext").click(function(){
		chrome.extension.getBackgroundPage().playNext();
	});	
	$("#btnVolumn").click(function(){
		if($(this).children(0).hasClass("icon-volume-mute"))
			$(this).children(0).addClass("icon-volume-up").removeClass("icon-volume-mute");
		else
			$(this).children(0).addClass("icon-volume-mute").removeClass("icon-volume-up");
		chrome.extension.getBackgroundPage().toggleMute();
	});

	$("#brVolumn").change(function(){
		volumn = $(this).val();
		chrome.extension.getBackgroundPage().setVolume(volumn);
	});
	$("#btnClearList").click(function(){
		chrome.extension.getBackgroundPage().clearPlaylist();
	});
	$("#timeBar").mouseup(function(){
		chrome.extension.getBackgroundPage().seek($(this).val());
	});
	init();
});

///////////////////////////////////////  End Alternative for User Playlist Function ///////////////////////////////////////////////////77777777


//   tabs functionality  
$(window).load(function(){
$('#menu').tabify();
});

//  Main function - Load Jquery!
jQuery(document).ready(function()
{

///////////////////////////////////////////////////// Integrating universal player	////////////////////////////////////////////////////////



//  Kyle, this is working, just now Im improving this locally :).




//////////////////////////////////////////////////////////// End Integrating universal player	/////////////////////////////////////////////


// Checking Facebook connection 
checkFacebookConnection();

function checkFacebookConnection() 
{ 
 
try
    {
	   //url var keeps the token acess if user are logged on m80.us
       var url = "http://cloud.m80.us/social/test.php";
       var http = new XMLHttpRequest();
       http.open("GET", url, true);  
	   http.onreadystatechange = function() 
        {
          if(http.readyState == 4 && http.status == 200) 
		  {
		   session= http.responseText;
		   token =session;		   
		   
		    if (token) 
		      {
                  if (localStorage.accessToken) 
				    {
		              var token = localStorage.accessToken;
		              getFriends (token);
		            }
		          else 
				    {
		             /*chrome.tabs.create({url: 
                     'https://www.facebook.com/dialog/oauth?client_id=493943350643662&response_type=token&scope=publish_stream&redirect_uri=http://www.facebook.com/connect/login_success.html',
                     selected: false});*/
		             //alert("There is not token - and I'm a alert test")
		
		             chrome.tabs.create({ url: 'https://www.facebook.com/dialog/oauth?client_id=493943350643662&response_type=token&scope=publish_stream&redirect_uri=http://www.facebook.com/connect/login_success.html',
                     selected: false },function(tab)
					                {
                                                setTimeout(function(){chrome.tabs.remove(tab.id);}, 5000);
                                    });
		            }  
		     } 
            else
		     {
		       chrome.tabs.create({url: 'http://cloud.m80.us/sign-in',selected: true});

		
		     }		
          }
        };
        http.send();
    }
    catch(ex) 
    {
      alert("there is a exceptional mistake on facebook connection" + ex);
    }
	
}

 //////////////////////////////////////////////////  Start - User Playlist Function! ///////////////////////////////////////////////

// Player Variables	
var currentIndex = 1;
var maximumItems = 10;
var order = ["relevance", "published", "viewCount", "rating"];
var player;
var playerIframe;
var timer;

//PLAYER VARS
var duration = 0;
var time = 0;
var loaded = 0;
var startBytes = 0;
var manual = false;
var currentTime = 0;
var totalTime = 0;
var playing = false;
var repeat = false;
var shuffle = false;
var nextReady = true;
var mute = false;
var currentSong = 0;
var tempQuery = "";
var videoIndex = 0;
var focus = false;
var totalItems = 0;
var state = -1;
var currentList;
var shuffleList = [];

//SAVE
var playlist = [];
var json;
var autoNext = true;
var currentPlaylistItem = 0;
var totalItems = 0;
var favouritesJSON;
var maxFavourites = 100;
var showMore = false;
var post1;	

$(".favourite-list").show();

// Load the user playlist
loadFavourites();
function loadFavourites(){
try
    {
	   // exploring  if user have created a playlist before.
	   
	   // change this resource  in order to get the correct Id playlisr
       
	   /*var url = 'http://m80.us/apisnow/index.php/playlist/getPlaylist/'+idFromFacebook;
       var http19 = new XMLHttpRequest();
       http19.open("GET", url, true);  
	
	   http19.onreadystatechange = function() 
        {
          if(http19.readyState == 4 && http19.status == 200) 
		  {
		        infod7 = JSON.parse(http19.responseText);
				//playlist = json.results;
				playlist = infod7;
                loadPlaylist(playlist[currentPlaylistItem])				
          }
        };
        http19.send(); */
		
	    //playlist[0] = "H7HmzwI67ec";
        //playlist[1] = "QJO3ROT-A4E";
		playlist = ["QJO3ROT-A4E", "H7HmzwI67ec","dFtLONl4cNc", "fDxzQJaA228","tbNlMtqrYS0"];
        loadPlaylist(playlist[currentPlaylistItem])	
		
    }
    catch(ex) 
    {
      alert(" there is a exceptional mistake 19 " + ex);
    }

}



function loadPlaylist(query){

// We need to find an alternative in order to change this.
try
    {
	
    var entry;
    var title;
    var item;
    var id;
    var thumb;
    var dur;
   
	
	    //alert (query);
        var httpReq52 = new XMLHttpRequest();
		
		httpReq52.open("GET","http://gdata.youtube.com/feeds/api/videos/"+query+"?v=2&alt=json");

		httpReq52.onreadystatechange = function() 
        {
            if(httpReq52.readyState == 4) 
            { 
                
                if(httpReq52.status == 200)
                {
				
				infod7 = JSON.parse(httpReq52.responseText);
                entry = infod7.entry;
                title = entry.title.$t;
                thumb = entry.media$group.media$thumbnail[0].url;
                id = entry.media$group.yt$videoid.$t
                dur = convertMilliseconds((entry.media$group.yt$duration.seconds *1000),"hh:mm:ss").clock;
            
			    //alert (title);
            //CREATE ITEMS
            $(".favourite-list").append(createItem(id,title,thumb,(currentPlaylistItem+1),dur,true));

           $(".items-loaded").text(currentPlaylistItem+"/"+playlist.length);
           
			  //alert (playlist.length);	 
	          if(currentPlaylistItem == playlist.length){
                      // This function evaluates if you dont have more elements on your play list						
						debug("done?")
            }else{
			
			    // You have more elements .. then loop and loop.
                currentPlaylistItem++;
                loadPlaylist(playlist[currentPlaylistItem]);
												
            }
			 
					
                }
                else
                {
                    indo="dsadsa";
                }
            }
			else
                {
				indo="dsadsa";
                }
        };
        httpReq52.send();
    }
    catch(ex) 
    {
      alert("pilas " + ex);
    }
	 
}



function createItem(id,title,thumb,number,duration,active){
    var favouriteItem;
    if(active){
         favouriteItem =  '<td class="table-favourite">'+'<i class="favourite active icon-star"></i>'+'</td>'
    }else{
         favouriteItem = '<td class="table-favourite">'+'<i class="favourite icon-star"></i>'+'</td>'
    }
    
    var item = '<tr class="video" data-id="'+id+'" data-title="'+title+'">'+
                    '<td class="table-image">'+'<div class="thumbnail"><img src="'+thumb+'"/></div>'+'</td>'+
                    '<td class="table-title">'+title+'</td>'
                '</tr>'
    return item;
}



function selectSong(index){
    $(currentList).find(".video:eq("+index+")").siblings(".video").removeClass("active");
    $(currentList).find(".video:eq("+index+")").addClass("active");
    var songId = $(currentList).find(".video:eq("+index+")").data("id")
    player.loadVideoById(songId);
    
    $(".song-title").text($(currentList).find(".video:eq("+index+")").data("title"))
    
   
    //playerIframe.loadVideoById(songId);
    $.ajax({
        url: "/nowplaying/"+songId,
        dataType: 'text',
        crossDomain: false,
        beforeSend: function(request) {              
        },
        success: function(data, textStatus, request) {
        },
        error: function(request, status, error) {           
        }
    })
    
    
}

function reloadPlaylist(){
   
    $(".favourite-list .video").each(function(index,item){
        $(this).find(".table-number").text(index+1);
    });
}


// Searching for song by using Youtube api player

// Spanish: esta funcion debo invokarla cada vez que el usuario comparte una cancion

function search(query){
	
try
    {
        var httpReq5 = new XMLHttpRequest();
		
		httpReq5.open("GET","https://gdata.youtube.com/feeds/api/videos/-/Music/?v=2&alt=json&orderby="+order[0]+"&start-index="+currentIndex+"&max-results="+maximumItems+"&q="+query);

		httpReq5.onreadystatechange = function() 
        {
            if(httpReq5.readyState == 4) 
            { 
                
                if(httpReq5.status == 200)
                {
				
				infod = JSON.parse(httpReq5.responseText);
				onResult(infod);
		        tempQuery = query;

			 $(".search-results").hide();
					
                }
                else
                {
                    indo="dsadsa";
                }
            }
			else
                {
				indo="dsadsa";
                }
        };
        httpReq5.send();
    }
    catch(ex) 
    {
      alert("pilas " + ex);
    }
	 
}


//ONRESULT
function onResult(data) {
   
    var feed = data.feed;
    var entries = feed.entry || [];	
    var entry;
    var title;
    var item;
    var id;
    var thumb;
    var dur;
    var rat;
    var nextIndex = currentIndex-1;
    var tableItem;
    var active = false;
    
    for (var i = 0; i < (2); i++) {
        videoIndex++
        entry = entries[i];
        //debug(entry)
        title = entry.title.$t;
		 
        thumb = entry.media$group.media$thumbnail[0].url;
        id = entry.media$group.yt$videoid.$t
		//alert(id);
		returnSongs[i]= id;
        dur = convertMilliseconds((entry.media$group.yt$duration.seconds *1000),"hh:mm:ss").clock;
        //CREATE ITEM
        $(".video-list").append(createItem(id,title,thumb,videoIndex,dur),false);
        
        //CHECK PLAYLIST FOR FAVOURITES
        
        if(playlist!=null){
            for (var a =0; a<playlist.length;a++){
                if(id == playlist[a]){
                    $(".video-list .video:eq("+(nextIndex+i)+") .favourite").addClass("active");
                }
            }
        }
	}
	//END OF LIST LOADED MORE AND PLAY NEXT
    if(autoNext){
        autoNext = false;
        next();
    }
} 
   
function loadMore(){

	if($(currentList).hasClass("favourite-list")){
		debug("loadmore favo");
		debug(currentPlaylistItem)
		loadPlaylist(playlist[currentPlaylistItem+2])
		//loadFavourites();
	
	}else{
		debug("loadmore search");
		currentIndex+=maximumItems;
		//debug("load more "+ currentIndex +" "+tempQuery);
		search(tempQuery);
	}
}


function convertMilliseconds(ms, p) {
	var pattern = p || "hh:mm:ss",
	arrayPattern = pattern.split(":"),
	clock = [],
	hours = Math.floor(ms / 3600000), // 1 Hour = 36000 Milliseconds
	minuets = Math.floor((ms % 3600000) / 60000), // 1 Minutes = 60000 Milliseconds
	seconds = Math.floor(((ms % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
	// build the clock result
	function createClock(unit) {
		// match the pattern to the corresponding variable
		if (pattern.match(unit)) {
			if (unit.match(/h/)) {
				addUnitToClock(hours, unit);
			 }
			if (unit.match(/m/)) {
				 addUnitToClock(minuets, unit);
			}
			if (unit.match(/s/)) {
				addUnitToClock(seconds, unit);
			};
		}
	}
	function addUnitToClock(val, unit) {
		if (val < 10 && unit.length === 2) {
			val = "0" + val;
		}
		clock.push(val); // push the values into the clock array
	}
	// loop over the pattern building out the clock result
	for (var i = 0, j = arrayPattern.length; i < j; i++) {
		createClock(arrayPattern[i]);
  }
	return {
		hours: hours,
		minuets: minuets,
		seconds: seconds,
		clock: clock.join(":")
	};
}

 //////////////////////////////////////////////////  End - User Playlist Function! ///////////////////////////////////////////////

	

	
 //////////////////////////////////////////////////  Start - Share Function! ///////////////////////////////////////////////

    var scroblrBar = (function  (model)
{
    var currentsong = null,
	keepalive = null;

function init () 
{
	resetBar();
	if (model.currentsong !== null) 
	{
			updateNowPlaying(model.currentsong);
	}
	var image =null;
	
}

    function formatDuration (duration) {
		var seconds_total = duration / 1000,
			hours   = Math.floor(seconds_total / 3600),
			minutes = Math.floor((seconds_total - (hours * 3600)) / 60),
			seconds = Math.round((seconds_total - (hours * 3600)) % 60),
			formatted_hour = '';
		if (hours > 0) {
			formatted_hour = hours + ':';
			if (minutes.toString().length < 2) {
				minutes = '0' + minutes;
			}
		}
		if (seconds.toString().length < 2) {
			seconds = '0' + seconds;
		}
		return formatted_hour + minutes + ':' + seconds;
	}


function getCurrentSong () {
		return currentsong;
	}


	function keepAlive () {
		window.clearTimeout(keepalive);
		keepalive = window.setTimeout(resetBar, 15000);
	}


	function message_handler (msg, sender, sendResponse) {
		switch (msg.name) {

			case "keepAlive":
				keepAlive();
				break;
			case "nowPlaying":
				updateNowPlaying(msg.message);
				break;
			case "songInfoRetrieved":
				updateNowPlaying(msg.message);
				break;
			case "updateCurrentSong":
				updateCurrentSong(msg.message);
				break;
		}
	}


	function resetBar () {
		$('#nowPlaying').removeClass().hide().find('.artist, .album, .track').empty();
		showHostControls(false);
		updateCurrentSong({score: 50});
	}

	function showHostControls (data) 
	{
		$('.hostdata').hide();
		if (data) 
		{
			if (data.host) 
			{
				$('#' + data.host).show();
			}
		}
	}

	function updateNowPlaying (data) 
	{
		var nowPlaying = $('#nowPlaying');
		resetBar();
		currentsong = data;
		if (data.name.length && data.artist.length) 
		  {
			 nowPlaying.addClass(data.host).show();
			 if (data.image.length) 
			 {
				$('p.album', nowPlaying).html('<img class="img-circle" src="' + data.image + '" alt="' + "Snowball Music 2013" + '" />');
			 }
			 
			 // Enable public .p Information
	         jQuery('p.track',nowPlaying).html(data.name);
	         jQuery('p.artist',nowPlaying).html(data.artist  + (data.duration > 0 ? formatDuration(data.duration) : ''));
	         jQuery('p.url',nowPlaying).html(data.url2);
		     image = data.image;
		   
			showHostControls(data);
			updateCurrentSong({score: data.score});		 
		 }
	}
	
	function updateCurrentSong (data) 
	{
		if (data.hasOwnProperty('duration')) 
		{
			currentsong.duration = data.duration;
			$('#nowPlaying .track em').text(formatDuration(data.duration));
		}
	}
init();

return {
		getCurrentSong: getCurrentSong,
	   };
	
}(chrome.extension.getBackgroundPage()));

// Getting the facebook Friends

function getFriends(token) 
      { 
        try
         {
          var httpReq = new XMLHttpRequest();
		  httpReq.open("GET",'https://graph.facebook.com/me/friends?'+localStorage.accessToken);
		  httpReq.onreadystatechange = function() 
           {
             if(httpReq.readyState == 4) 
              { 
                if(httpReq.status == 200)
                 {
				   infod1 = JSON.parse(httpReq.responseText)
				   for(var i=0; i<infod1.data.length; i++)
				      {
				        facebookname[i]= infod1.data[i].name;
					    facebookid[i] = infod1.data[i].id;
				      }
					      // Getting the user facebook Id 
				          getMyId();
                 }
                 else
                 {
                    alert(" There is a mistake - getting the Facebook friends"+httpReq.responseText);
                 }
             }
           };
          httpReq.send();
        }
        catch(ex) 
        { 
          alert(" there is a mistake with facebook friends" + ex);
        }
     }

	// Tags that users can type. 
    var tagging = new Array();
	tagging[0] = "Saturday";
    tagging[1] = "Night";
    tagging[2] = "Party";
    tagging[3] = "Rock";
	
    jQuery(".tagManager:eq(0)").tagsManager({
        prefilled: ["Top chart", "New"],
        preventSubmitOnEnter: true,
        typeahead: true,
        typeaheadAjaxSource: null,
		typeaheadSource: tagging,
        blinkBGColor_1: '#FFFF9C',
        blinkBGColor_2: '#CDE69C',
        hiddenTagListName: 'hiddenTagListA'
      });
	  jQuery(".tagManager:eq(1)").tagsManager({
        preventSubmitOnEnter: true,
        typeahead: true,
        typeaheadAjaxSource: null,
        typeaheadSource: facebookname,
		blinkBGColor_1: '#FFFF9C',
        blinkBGColor_2: '#CDE69C',
        hiddenTagListName: 'hiddenTagListB'
      });
	  
      jQuery(".tagManager:eq(2)").tagsManager({
        preventSubmitOnEnter: true,
        typeahead: true,
        typeaheadAjaxSource: '/ajax/countries',
        typeaheadAjaxPolling: true,
        AjaxPush: '/ajax/countries/push',
        blinkBGColor_1: '#FFFF9C',
        blinkBGColor_2: '#CDE69C',
      });
      jQuery(".tagManager:eq(3)").tagsManager({
        preventSubmitOnEnter: true,
        typeahead: true,
        typeaheadSource: funSource,
        blinkBGColor_1: '#FFFF9C',
        blinkBGColor_2: '#CDE69C',
      });

      function funSource(){
        var ret = ["item1", "item2", "item3", "item4", "item5", "item6", "item7", "item8"];
        return ret;
      }

    
      jQuery('#input_name').val( jQuery('p.track').html() );
      jQuery('#input_artist').val( jQuery('p.artist').html() );
      jQuery('#input_url').val( jQuery('p.url').html() );
      jQuery('#input_submit').click( function(){
	   
	 
		
		var facebookNames = jQuery('input[name="hiddenTagListB"]').val();
		var arrayNames = facebookNames.split(",");
		var namesTemporal = new Array(); 
		for(var i=0; i<facebookname.length; i++)
	     {	   
				 if (arrayNames[i]==facebookname[i])
				 {
				     namesTemporal[i]= facebookid[i];
				 }					
		 }
		 
		var namesCommaSeparated= namesTemporal.toString();

		
		if(idList!=null)
		{
		   
		  var suma= parseInt(valorRecibidoidList);
		  
		  var IdListsuma= suma.toString();
		  addSongPlaylist(IdListsuma,returnSongs[0]);
		  addSongInformation(returnSongs[0]);
		  postfacebook(namesCommaSeparated);
		  
		  
		  
		}
		
		// If no, we need to get facebook user ID to add Playlist
		//else if (marker===0)
		if(idList===undefined)
		{

		  addPlaylist(generaluserId);
		  var suma= parseInt(valorRecibidoidList)+1;
		  
		  var IdListsuma= suma.toString();
		  addSongPlaylist(IdListsuma,returnSongs[0]);
		  addSongInformation(returnSongs[0]);
		  
		  postfacebook(namesCommaSeparated);
		  
		}
		

		// End Modified Version July 07 2013
		
    })
    
	jQuery('#myWizard').easyWizard({
        buttonsClass: 'btn',
        submitButtonClass: 'btn btn-info',
        showSteps: false,
		showButtons: true,
		submitButton: false,
		before: function(wizardObj, currentStepObj, nextStepObj) {
			//alert('Hello, I\'am the before callback');
		},
		after: function(wizardObj, prevStepObj, currentStepObj) {
			//alert('Hello, I\'am the after callback');
		},
        beforeSubmit: function(wizardObj) {
            //alert('Hello, I\'am the beforeSubmit callback');
    	}
    });


	
// modified version of getMyId July 06 2013
	
function getMyId() 
{ 
try
    {
	   // Facebbok Userid, we need to know that to post (ex 78921) 
       var url = 'https://graph.facebook.com/me?'+localStorage.accessToken;
       var http4 = new XMLHttpRequest();
       http4.open("GET", url, true);  
	
	   http4.onreadystatechange = function() 
        {
          if(http4.readyState == 4 && http4.status == 200) 
		  {
		   infod2 = JSON.parse(http4.responseText);
		   postFacebookId = infod2.id;
		   // At the same time we verify if user has a playlist!
		   verifyPlaylist(postFacebookId);
		   getUserid(postFacebookId);
		   verifyAfterAdd();
          }
        };
        http4.send();
    }
    catch(ex) 
    {
      alert(" there is a exceptional mistake getting the FacebookId " + ex);
    }
 
}	
	

function verifyPlaylist(idFromFacebook) 
{ 
  try
    {
	   // exploring  if user have created a playlist before.
       var url = 'http://m80.us/apisnow/index.php/playlist/getPlaylist/'+idFromFacebook;
       var http5 = new XMLHttpRequest();
       http5.open("GET", url, true);  
	
	   http5.onreadystatechange = function() 
        {
          if(http5.readyState == 4 && http5.status == 200) 
		  {
		        infod3 = JSON.parse(http5.responseText);
				//alert(infod1[0].id);
				idList=infod3[0].id;
				userIdList=infod3[0].user_id;
				//alert (idList);
				marker=1;
          }
        };
        http5.send();
    }
    catch(ex) 
    {
      alert(" there is a exceptional mistake 5 " + ex);
    }
}


function verifyAfterAdd() 
{ 
  try
    {
	   // exploring  if user have created a playlist before.
       var url = 'http://m80.us/apisnow/index.php/playlist/getLastId/44';
       var http11 = new XMLHttpRequest();
       http11.open("GET", url, true);  
	
	   http11.onreadystatechange = function() 
        {
          if(http11.readyState == 4 && http11.status == 200) 
		  {
		        infod5 = JSON.parse(http11.responseText);
				valorRecibidoidList=infod5[0].id;
		
          }
        };
        http11.send();
    }
    catch(ex) 
    {
      alert(" there is a exceptional mistake 11 " + ex);
    }
}

function postfacebook(idshares) 
{

      var tags = idshares;
	  
       var track = jQuery('p.track').html();
	   
	   var  artist= jQuery('p.artist').html();
	   	   
	   var url = "http://cloud.m80.us/search/"+track+"-"+artist;
	   
	   //var url = "http://cloud.m80.us/song/3DJi3zT9BW";
	  
	   
	   try
    {
        var httpReq4 = new XMLHttpRequest();
        
		httpReq4.open("POST", 'https://graph.facebook.com/me/project_snowball:share?' + localStorage.accessToken + "&song="+url+"&message=Probando ando paseando :)"+"&tags="+tags);

		
		httpReq4.onreadystatechange = function() 
        {
            if(httpReq4.readyState == 4) 
            { 
                //var response = JSON.parse(httpReq.responseText);
				//output = JSON.parse(httpReq.responseText);
                if(httpReq4.status == 200)
                {
				
				 alert("Mensaje posteado");
                }
                else
                {
                    alert("Mensaje no posteado - ha ocurrido un error"+httpReq4.responseText);
                }
            }
        };
        httpReq4.send();
    }
    catch(ex) 
    {
      alert("pilas " + ex);
    } 
  
 
}

// modified version of getUserId July 07 2013


function getUserid(postFacebookId) 
{ 
  try
    {
	   // exploring  if user have created a playlist before.
       var url = 'http://m80.us/apisnow/index.php/user/getUserid/'+postFacebookId;
       var http6 = new XMLHttpRequest();
       http6.open("GET", url, true);  
	
	   http6.onreadystatechange = function() 
        {
          if(http6.readyState == 4 && http6.status == 200) 
		  {
		    infod4 = JSON.parse(http6.responseText);
		    //alert(infod4[0].user_id);
		    generaluserId=infod4[0].user_id;
          }
        };
        http6.send();
    }
    catch(ex) 
    {
      alert(" there is a exceptional mistake 6" + ex);
    }
}


});

 //////////////////////////////////////////////////  End - Share Function! ///////////////////////////////////////////////

