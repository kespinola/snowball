chrome.extension.sendMessage({loaded: window.location.href});

var isJango = (window.location.hostname.toLowerCase().indexOf('jango') >= 0 ? true : false),
	isJangoPlayer = (isJango && $('#player_info').length ? true : false),
	scroblr;

if (!isJango || isJangoPlayer) {

	scroblr = (function () {


		var host = '',
			interval = '',
			song = {
				album: '',
				artist: 'undefined',
				duration: 0,
				elapsed: 0,
				host: host,
				image: '',
				loved: false,
				name: 'undefined',
				score: 50,
				stopped: false,
				tags: [],
				timestamp: null,
				url: '',
				url2: '',
				url_album: '',
				url_artist: ''
			};


		function calculateDuration (timestring) {
			var seconds = 0;
			for (var i = 0, max = arguments.length; i < max; i += 1) {
				if (arguments[i].toString().length) {
					timeSegments = arguments[i].split(':');
					// Iterate over timeSegments in reverse calculating the number
					// of seconds represented by the seconds, minutes, and hours
					// fields.
					for (var j = timeSegments.length - 1, pow = 0; (j >= 0) && (j >= (timeSegments.length - 3)); j -= 1, pow += 1) {
						seconds += parseFloat(timeSegments[j].replace('-', '')) * Math.pow(60, pow);
					}
				}
			}
			return seconds * 1000;
		}


		function getCurrentSongInfo () {
			var currentsong = {
					album: '',
					artist: '',
					duration: 0,
					elapsed: 0,
					host: host,
					image: '',
					loved: false,
					name: '',
					score: 50,
					stopped: false,
					tags: [],
					timestamp: Math.round((new Date()).getTime() / 1000.0),
					url: '',
					url2: '',
					url_album: '',
					url_artist: ''
				},
				scrape = {

					accuradio: function () {
						var artist = $('#span_information_artist').text();

						if (artist.indexOf("Click here") >= 0) {
							artist = "";
						}

						return {
							album: $('#span_information_album').text(),
							artist: artist,
							name: $('#span_information_title').text(),
							stopped: $('#player_lowest_controls_wrapper #play').length ? true : false
						};
					},

					amazon: function () {
						return {
							artist: $('#nowPlayingSection .currentSongDetails .title').next().text().substring(3),
							duration: calculateDuration($('#nowPlayingSection .currentSongStatus #currentTime').next().next().text()),
							name: $('#nowPlayingSection .currentSongDetails .title').text(),
							stopped: $('#mp3Player .mp3Player-MasterControl .mp3MasterPlayGroup').hasClass('paused')
						};
					},

					bandcamp: function () {
						var discover, info;

						discover = (window.location.pathname.slice(1) === "discover" ? true : false);
						info = {
							stopped: (!$('.inline_player .playbutton').hasClass('playing'))
						};

						if (!info.stopped) {
							if (discover) {
								info.artist = $("#detail_body_container .itemsubtext a").text();
							} else {
								info.artist = $('span[itemprop="byArtist"]').text();
							}
							info.name = $('.track_info .title').first().text();
							info.duration = calculateDuration($('.inline_player .track_info .time_total').text());
							info.elapsed = calculateDuration($('.inline_player .track_info .time_elapsed').text());

							if (info.name === '') {
								info.name = $('.trackTitle').first().text();
							}
						}
						return info;
					},

					google: function () {
						var info = {
							//artist: $('#player-artist .fade-out-content').text(),
							//'http://deezer.com/track/' + $('#h_love').find('a').attr('onclick').replace(/(.*)"SNG_ID":"([0-9]+)"(.*)/i, '$2')
							duration: calculateDuration($('#duration').text()),
							name: $('#playerSongTitle .fade-out-content').text(),
							stopped: ($('#playPause').attr('title') == 'Play')
						};
						return info;
					},
					
					deezer: function () {
					//if ($('.h_icn_pause').is(':visible'))
				//{
						var info = {
							//artist: $('#player-artist .fade-out-content').text(),
							// Este es 
							artist: $('#title').text(),
							url2:'http://deezer.com/track/' + $('#h_love').find('a').attr('onclick').replace(/(.*)"SNG_ID":"([0-9]+)"(.*)/i, '$2'),
							//duration: calculateDuration($('#duration').text()),
							//name: $('#playerSongTitle .fade-out-content').text(),
							name:$('#current-track').text(),
							//stopped: ($('#playPause').attr('title') == 'Play')
						};
						return info;
				//}		
					},
					
					rdio: function () {
			
						var info = {
							//artist: $('#player-artist .fade-out-content').text(),
							// Este es 
							artist: $('.footer .artist_title').text(),
							//url2:'http://deezer.com/track/' + $('#h_love').find('a').attr('onclick').replace(/(.*)"SNG_ID":"([0-9]+)"(.*)/i, '$2'),
							//duration: calculateDuration($('#duration').text()),
							//name: $('#playerSongTitle .fade-out-content').text(),
							name:$('.footer .song_title').text(),
							//stopped: ($('#playPause').attr('title') == 'Play')
						    url2: 'http://www.rdio.com/artist'+$('.footer .song_title').attr('href'),
							
	
						};
						return info;
						
					},
					
					spotify: function () {
			
						var info = {
							//artist: $('#player-artist .fade-out-content').text(),
							// Este es 
							artist: $('#track-name').text(),
							//url2:'http://deezer.com/track/' + $('#h_love').find('a').attr('onclick').replace(/(.*)"SNG_ID":"([0-9]+)"(.*)/i, '$2'),
							//duration: calculateDuration($('#duration').text()),
							//name: $('#playerSongTitle .fade-out-content').text(),
							name:$('#track-artist').text(),
							//stopped: ($('#playPause').attr('title') == 'Play')
						    //url2: 'http://www.rdio.com/artist'+$('.footer .song_title').attr('href'),
							
	
						};
						return info;
						
					},
					
					
					youtube: function () 
			   {
			
			       if (typeof $('meta[name=title]').attr('content') !== 'undefined')
				   {
						var info = {
							//artist: $('#player-artist .fade-out-content').text(),
							// Este es 
							artist:$('link[itemprop="url"]').attr('href'),
							//url2:'http://deezer.com/track/' + $('#h_love').find('a').attr('onclick').replace(/(.*)"SNG_ID":"([0-9]+)"(.*)/i, '$2'),
							//duration: calculateDuration($('#duration').text()),
							//name: $('#playerSongTitle .fade-out-content').text(),
							name:$('meta[name=title]').attr('content'),
							//stopped: ($('#playPause').attr('title') == 'Play')
						    //url2: 'http://www.rdio.com/artist'+$('.footer .song_title').attr('href'),
							
	
						};
						return info;
					}
				},
				
				
					tunein: function () 
			   {
			
				if ($('#tuner').hasClass('playing'))
				   {
						var info = {
							//artist: $('#player-artist .fade-out-content').text(),
							// Este es 
							//artist:$('link[itemprop="url"]').attr('href'),
							//url2:'http://deezer.com/track/' + $('#h_love').find('a').attr('onclick').replace(/(.*)"SNG_ID":"([0-9]+)"(.*)/i, '$2'),
							//duration: calculateDuration($('#duration').text()),
							//name: $('#playerSongTitle .fade-out-content').text(),
							name:$('.line1').find('.info').text() + ' - ' + $('.line2').find('.title').text(),
							//stopped: ($('#playPause').attr('title') == 'Play')
						    //url2: 'http://www.rdio.com/artist'+$('.footer .song_title').attr('href'),
							
	
						};
						return info;
					}
				},

					indieshuffle: function () {
						return {
							artist: $("#now-playing-title strong").text(),
							duration: calculateDuration($("#jplayer_total_time").text()),
							elapsed: calculateDuration($("#jplayer_play_time").text()),
							name: $("#now-playing-title a").clone().find("strong").remove().end().text(),
							stopped: !$("#play-pause").hasClass("playing")
						};
					},

					jango: function () {
						var artist = $("#player_info #player_current_artist a").text();

						if (artist.indexOf(String.fromCharCode(8230)) >= 0) {
							artist = document.title.split(":")[0];
						}

						return {
							artist: artist,
							duration: calculateDuration($('#player_info #timer').text().substring(1)),
							name: $('#player_info #current-song').text().replace(/^\s+/, '').replace(/\s+$/, ''),
							stopped: $('#btn-playpause').hasClass('pause')
						};
					},

					pandora: function () {
						function stripChildrensLabel (string) {
							return string.replace(/\s+\(Children's\)$/i, '');
						}
						function stripHolidayLabel (string) {
							return string.replace(/\s+\(Holiday\)$/i, '');
						}
						function cleanseArtist (string) {
							var artist = stripChildrensLabel(string);
							return stripHolidayLabel(artist);
						}
						return {
							album: $('#playerBar .playerBarAlbum').text(),
							artist: cleanseArtist($('#playerBar .playerBarArtist').text()),
							duration: calculateDuration($('#playbackControl .elapsedTime').text(), $('#playbackControl .remainingTime').text()),
							elapsed: calculateDuration($('#playbackControl .elapsedTime').text()),
							name: $('#playerBar .playerBarSong').text(),
							stopped: $('#playerBar .playButton').is(':visible')
						};
					},

					playerfm: function() {

						var elapsedString       = $('.permaplayer .current .play-monitor .time-elapsed').text();
						var timeRemainingString = $('.permaplayer .current .play-monitor .time-remaining').text();

						return {
							artist:   $('.permaplayer .track-wrapper .current-series-link').text(),
							name:     $('.permaplayer .track-wrapper .current-episode-link').text(),
							elapsed:  calculateDuration(elapsedString),
							duration: calculateDuration(elapsedString, timeRemainingString),
							stopped:  $('.container .mainflow .playpause .icon-play').is(':visible')
						};
					},

					rhapsody: function () {
						return {
							artist: $('#player-artist-link').text(),
							duration: calculateDuration($('#player-total-time').text()),
							elapsed: calculateDuration($('#player-current-time').text()),
							name: $('#player-track-link').text(),
							stopped: ($('#player-play').css('display') == 'block')
						};
					},

					songza: function () {
						return {
							artist: $('#player .szi-roll-song .szi-info .szi-artist').text(),
							name: $('#player .szi-roll-song .szi-info .szi-title').text(),
							percent: parseFloat($('#player .szi-progress .szi-bar').width() / $('#player .szi-progress').width()),
							stopped: ($('#player .sz-player-state-pause').length > 0)
						};
					},

					soundcloud: function() {
						var soundcloudNext = $('body > #app').length > 0;

						if (soundcloudNext) {
							var playing = $('.sc-button-play.sc-button-pause'),
									info = {
										stopped: (playing.length == 0)
									};

							if (!info.stopped) {
								var player = playing.parents('.sound');

								//info.artist = player.find('.soundTitle__username').text();
								
								//info.url = player.find('.soundTitle__title').text();
								
								
								// Workssssssssssssssssssssssssssssss
								//info.artist = player.find('.soundTitle__title').text();
								//info.duration = calculateDuration(player.find('.timeIndicator__total').text().replace('.', ':'));
								//info.elapsed = calculateDuration(player.find('.timeIndicator__current').text().replace('.', ':'));
								//info.name = player.find('.soundTitle__title').text();
								//info.name = 'http://soundcloud.com/'+player.find('.soundTitle__title').attr('href');
								//
								
								
								info.artist = player.find('.soundTitle__username').text();
								info.duration = calculateDuration(player.find('.timeIndicator__total').text().replace('.', ':'));
								info.elapsed = calculateDuration(player.find('.timeIndicator__current').text().replace('.', ':'));
								info.name = player.find('.soundTitle__title').text();
								info.url2 = 'http://soundcloud.com/'+player.find('.soundTitle__title').attr('href');
								
								var selector = $('.sc-button-pause').parent().parent();
								if (selector.length)
				                  {
								  	info.image = selector.parent().parent().parent().find('a').find('div').find('img').attr('src');
								  }
							}
							return info;
						}
						else {
							var playing = $('.play.playing'),
								info = {
									stopped: (playing.length == 0)
								};

							if (!info.stopped) {
								var player = playing.parents('div.player');

								info.artist = player.find('.user-name').text();
								info.duration = calculateDuration(player.find('.timecodes span:last').text().replace('.', ':'));
								info.elapsed = calculateDuration(player.find('.timecodes span:first').text().replace('.', ':'));
								info.name = player.find('h3 a').text();
							}
							return info;
						}
					},

					thisismyjam: function () {
						var info = {
								stopped: $('#playPause').hasClass('paused')
							};
						if (!info.stopped) {
							info.artist = $('#artist-name').text();
							info.duration = calculateDuration($('#totalTime').text().substring(3));
							info.elapsed = calculateDuration($('#currentTime').text());
							info.name = $('#track-title').text();
						}
						return info;
					},

					turntable: function () {
						var info = {};
						if ($('#songboard-artist').text().length) {
							info.artist = $('#song-log-panel .song:first-child .details > span').contents();
							info.duration = calculateDuration(info.artist[info.artist.length - 1].textContent);
							info.artist = info.artist[0].textContent;
							info.name = $('#song-log-panel .song:first-child .title').text();
							info.score = parseFloat($('#song-log-panel .song:first-child .score').text().replace(/[^0-9]+/g, ''));
						}
						return info;
					},

					twonky: function () {
						if ($('.meta_title').text().length) {
							return {
								album: $('.meta_album').text(),
								artist: $('.meta_artist').text(),
								duration: calculateDuration($('.meta_duration').text()),
								name: $('.meta_title').text(),
								stopped: $('.trackPlayerButtonIcon').hasClass('play')
							};
						}
					},

					we7: function () {
						return {
							artist: $('#track-marquee #track-title a').eq(0).text(),
							name: $('#track-marquee #track-title a').eq(1).text(),
							duration: calculateDuration($('#elapsed').text(), $('#remaining').text()),
							elapsed: calculateDuration($('#elapsed').text())
						};
					}

				};

			return $.extend(currentsong, scrape[host]());

		}


		function getElapsedTime (data) {
			var elapsed = data.elapsed;
			if (elapsed === 0) {
				var now = (new Date()).getTime() / 1000.0;
				elapsed = Math.round(now - song.timestamp) * 1000;
			}
			return elapsed;
		}


		function getHost () {

			var host, hostname;

			host = false;
			hostname = window.location.hostname.toLowerCase();

			if (hostname.indexOf('accuradio') >= 0) {
				host = 'accuradio';
			}
			else if (hostname.indexOf('amazon') >= 0 && window.location.pathname.indexOf('music') >= 0) {
				host = 'amazon';
			}
			else if (hostname.indexOf('bandcamp') >= 0) {
				host = 'bandcamp';
			}
			else if (hostname.indexOf('google') >= 0) {
				host = 'google';
			}
			else if (hostname.indexOf('indieshuffle') >= 0) {
				host = 'indieshuffle';
			}
			else if (hostname.indexOf('jango') >= 0) {
				host = 'jango';
			}
			else if (hostname.indexOf('pandora') >= 0) {
				host = 'pandora';
			}
			else if (hostname.indexOf('player.fm') >= 0) {
				host = 'playerfm';
			}
			else if (hostname.indexOf('rhapsody') >= 0 || hostname.indexOf('napster') >= 0) {
				if ($('#container').length) {
					host = 'rhapsody';
				}
			}
			else if (hostname.indexOf('songza') >= 0) {
				if ($('#player').length) {
					host = 'songza';
				}
			}
			else if (hostname.indexOf('soundcloud') >= 0) {
				host = 'soundcloud';
			}
			else if (hostname.indexOf('thisismyjam') >= 0) {
				host = 'thisismyjam';
			}
			else if (hostname.indexOf('turntable') >= 0) {
				host = 'turntable';
			}
			
			else if (hostname.indexOf('deezer') >= 0) {
				host = 'deezer';
			}
			
			else if (hostname.indexOf('tunein') >= 0) {
				host = 'tunein';
			}
			
			else if (hostname.indexOf('rdio') >= 0) {
				host = 'rdio';
			}
			
			else if (hostname.indexOf('spotify') >= 0) {
				host = 'spotify';
			}
			
			else if (hostname.indexOf('youtube') >= 0) {
				host = 'youtube';
			}
			
			else if (hostname.indexOf('twonky') >= 0) {
				if ($('body.musicDashboard').length) {
					host = 'twonky';
				}
			}
			else if (hostname.indexOf('we7') >= 0) {
				if ($('#player-section').length) {
					host = 'we7';
				}
			}
			return host;
		}


		function init () {
			host = getHost();
			if (host === false) {
				return false;
			}
			interval = window.setInterval(pollSongInfo, 5000);
		}


		function pollSongInfo () {
			var currentsong = getCurrentSongInfo(),
				currentsong_update_object = {};

			currentsong.album = $.trim(currentsong.album);
			currentsong.artist = $.trim(currentsong.artist);
			currentsong.name = $.trim(currentsong.name);

			if (currentsong.name != song.name || currentsong.artist != song.artist) {
				song = currentsong;
				sendMessage('nowPlaying', song);
			}
			else if (currentsong.name.length && currentsong.artist.length) {
				if (currentsong.hasOwnProperty('percent') && currentsong.duration === 0) {
					currentsong.duration = Math.round((currentsong.timestamp * 1000 - song.timestamp * 1000) / currentsong.percent);
					currentsong.elapsed = Math.round(currentsong.duration * currentsong.percent);
				}
				if (currentsong.duration > song.duration || song.duration - currentsong.duration > 200000) {
					currentsong_update_object.duration = song.duration = currentsong.duration;
				}
				if (currentsong.score != song.score) {
					currentsong_update_object.score = song.score = currentsong.score;
				}
				currentsong_update_object.elapsed = song.elapsed = getElapsedTime(currentsong);
				sendMessage('updateCurrentSong', currentsong_update_object);
			}
			sendMessage('keepAlive', null);
		}


		function sendMessage (name, message) {
			if (typeof chrome != 'undefined') {
				chrome.extension.sendMessage({
					name: name,
					message: message
				});
			}
			else if (typeof safari != 'undefined') {
				safari.self.tab.dispatchMessage(name, message);
			}
		}


		// Initialize on document ready
		$(function () {
			init();
		});


		return {
			getCurrentSongInfo: getCurrentSongInfo
		};


	}());

}

