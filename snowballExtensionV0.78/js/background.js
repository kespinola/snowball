       // Is better on popup.js!
   
      /*var url = "http://cloud.m80.us/social/test.php";
       var http = new XMLHttpRequest();
       http.open("GET", url, true);  
	
	   http.onreadystatechange = function() 
        {
          if(http.readyState == 4 && http.status == 200) 
		  {
		   session= http.responseText;
		   localStorage.accessToken =session;
          }
        };
        http.send(); */

var successURL = 'https://www.facebook.com/connect/login_success.html';
function onFacebookLogin() {
                if (!localStorage.accessToken) {
                    chrome.tabs.getAllInWindow(null, function(tabs) {
                        for (var i = 0; i < tabs.length; i++) {
                            if (tabs[i].url.indexOf(successURL) == 0) {
                                var params = tabs[i].url.split('#')[1];
access = params.split('&')[0]
                                console.log(access);
                                localStorage.accessToken = access;
                                chrome.tabs.onUpdated.removeListener(onFacebookLogin);
                                return;
                            }
                        }
                    });
                }
            }
            chrome.tabs.onUpdated.addListener(onFacebookLogin);

			
 //////////////////////////////////////////////////  Start - Player Function! ///////////////////////////////////////////////

		
//////////////////////////////////////////////////  End  - Player Function! ///////////////////////////////////////////////
	
// Changes this value!!!!!!!!!!!!
	
var api_key = 'da52bab746bdd623780bc381a06c3667',
	api_sec = '79924df85aa58621e9306731e22db885',
	api_url = 'http://ws.audioscrobbler.com/2.0/',
	lf_session = localStorage.lf_session ? JSON.parse(localStorage.lf_session) : null,
	lf_sessioncache = localStorage.lf_sessioncache ? JSON.parse(localStorage.lf_sessioncache) : {},
	lf_auth_waiting = false,
	currentsong = null,
	keepalive = null;

function getOptionStatus (option) {
	if (typeof chrome != 'undefined') {
		return (localStorage['enable_' + option] == 'false' ? false : true);
	}
}

function get_song_info (data) {
	var params;
	if (data.name.length && data.artist.length) {
		params = {
			api_key: api_key,
			artist: data.artist,
			track: data.name
		};
		if (lf_session != null && lf_session.name.length) {
			params.username = lf_session.name;
		}
		sendRequest('track.getInfo', params, get_song_info_callback);
	}
}

function get_song_info_callback (data) {
	currentsong.url = $('track > url', data).text() || '';
	currentsong.url_album = $('track > album url', data).text() || '';
	currentsong.url_artist = $('track > artist url', data).text() || '';
	currentsong.album = $('track > album title', data).text() || currentsong.album.length ? currentsong.album : '';
	currentsong.image = $('track > album image[size="large"]', data).text() || '';
	currentsong.loved = $('track userloved').text() == 1 ? true : false;
	currentsong.tags = [];
	$('track tag', data).each(function () {
		currentsong.tags.push({
			name: $(this).find('name').text(),
			url: $(this).find('url').text()
		});
	});
	sendMessage('songInfoRetrieved', currentsong);
}

// Deebugging!

function handleFailure () {
	console.log(arguments);
}

// Initialize Function
function initialize () {
	if (typeof chrome != 'undefined') {
		chrome.extension.onMessage.addListener(message_handler);
	}	
}


function keepAlive () {
	window.clearTimeout(keepalive);
	keepalive = window.setTimeout(function () {
		currentsong = null;
	}, 15000);
}


 //Handle event messages
 
function message_handler (msg) {
	switch (msg.name) {
		case "keepAlive":
			keepAlive();
			break;
		case "nowPlaying":
			update_now_playing(msg.message);
			get_song_info(msg.message);
			break;
		case "updateCurrentSong":
			update_current_song(msg.message);
			break;
	}
}

// Notification when song starts playing

function notify (notification) {
	var notification;
	if (window.webkitNotifications && getOptionStatus('messaging')) {
		notification = webkitNotifications.createNotification('img/snowball64.png', notification.title, notification.message);
		notification.show();
		if (getOptionStatus('auto_dismiss')) {
			window.setTimeout(function () {
				notification.cancel()
			}, 5000);
		}
	}
}

// Messaging extension

function sendMessage (name, message) {
	var bars, i;
	if (typeof chrome != 'undefined') {
		chrome.extension.sendMessage({
			name: name,
			message: message
		});
	}
}

// Sending Last.fm API requests.
 
function sendRequest (method, params, callback) {
	var type = 'GET';
	if ($.inArray(method, ['track.updateNowPlaying']) >= 0) {
		type = 'POST';
	}
	params.method = method;
	$.ajax({
		url: api_url,
		type: type,
		data: params,
		success: function (data) {
			if (typeof callback == 'function') {
				callback(data);
			}
		},
		failure: handleFailure
	});
}

// Updating the  properties in the current song object.
 
function update_current_song (data) {
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			currentsong[key] = data[key];
		}
	}
}

// Updating the music from different hosts.

function update_now_playing (data) {
	var params,
		hostEnabled = getOptionStatus(data.host);
	if (currentsong != null) {
	}
	currentsong = data;
	if (hostEnabled && data.name.length && data.artist.length) {
		notify({
			message: data.artist + ' - ' + data.name,
			title: 'Snowball Playing :)'
		});
		if (lf_session) {
			params = {
				api_key: api_key,
				artist: data.artist,
				sk: lf_session.key,
				track: data.name
			};
			if (data.album) {
				params.album = data.album;
			}
			params.duration = data.duration / 1000;
			if (data.name.length && data.artist.length) {
				sendRequest('track.updateNowPlaying', params);
			}
		}
	}
}

initialize();