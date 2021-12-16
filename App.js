//
//  Connect SDK React Native API Sampler by LG Electronics
//
//  To the extent possible under law, the person who associated CC0 with
//  this sample app has waived all copyright and related or neighboring rights
//  to the sample app.
//
//  You should have received a copy of the CC0 legalcode along with this
//  work. If not, see http://creativecommons.org/publicdomain/zero/1.0/.
//

import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  BackHandler,
  Platform
} from 'react-native';

const ConnectSDK = require('connectsdk-react-native/src/ConnectSDK');
const Capabilities = require('./Capabilities');
const discoveryController = require('./controllers/DiscoveryManagerController');
const deviceController = require('./controllers/ConnectableDeviceController');

var subscribeVolume, subscribeChannel, subscribeGetMessage;
var subscription;
var webAppId = {
  "webOS TV": "SampleWebApp",
  "Chromecast": "DDCEDE96",
  "AirPlay": "https://redirect.lgsmartplatform.com/apps/SampleWebApp/"
},
appId= {
  "Netcast TV": "125071",
  "webOS TV": "redbox",
  "Roku": "13535"
},
dialAppId = "Levak";
youtubeContentId = "eRsGyueVLvQ",
webAppSession = null,
image = {
  url: "http://connectsdk.com/ConnectSDK_Logo.jpg",
  mimeType: "image/jpeg",
  title: "Sintel Character Design",
  description: "Blender Open Movie Project",
  iconUrl: "http://connectsdk.com/ConnectSDK_Logo.jpg"
},
audio = {
  url: "http://connectsdk.com/ConnectSDK.mp3",
  mimeType: "audio/mp3",
  title: "The Song that Doesn't End",
  description: "Lamb Chop's Play Along",
  iconUrl: "http://connectsdk.com/ConnectSDK_Logo.jpg",
  shouldLoop: false
},
video = {
  url: "http://connectsdk.com/ConnectSDK.mp4",
  mimeType: "video/mp4",
  title: "Sintel Trailer",
  description: "Blender Open Movie Project",
  iconUrl: "http://connectsdk.com/ConnectSDK_Logo.jpg",
  shouldLoop: false,
  subtitles: {
      label: "English",
      language: "en",
      SRT: {
          url: "http://connectsdk.com/ConnectSDK.srt",
          mimeType: "text/srt"
      },
      WebVTT: {
          url: "http://connectsdk.com/ConnectSDK.vtt",
          mimeType: "text/vtt"
      }
  }
},
playlist = {
  url: "http://ec2-54-201-108-205.us-west-2.compute.amazonaws.com/samples/media/example-m3u-playlist.m3u",
  mimeType: "application/x-mpegurl",
  title: "Playlist",
  description: "An M3U Playlist",
  shouldLoop: false
},
mediaPlayer = {
  launchSession: null,
  mediaControl: null,
  playlistControl: null
}

class App extends Component {
  constructor (props) {
    super(props);
    this.state = { connectedDeviceName: "Connect"};
    this._devices = {};
  }
  
  startDiscovery = () => {
    discoveryController.startDiscovery();
  }

  stopDiscovery() {
    discoveryController.stopDiscovery();
  }
	
  componentDidMount() {
    console.log('componentDidMount');
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.startDiscovery();
  }
 
  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.exitApp = false; 
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton = () => { 
    if (this.exitApp == undefined || !this.exitApp) {
      // Alert.show('한번 더 누르시면 종료됩니다.'); 
      this.exitApp = true;
      this.timeout = setTimeout( () => {
        this.exitApp = false;
      }, 2000);
    }
    else { 
     clearTimeout(this.timeout);
     BackHandler.exitApp();
    }  
    return true; 
  }

  getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
    if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
            return;
        }
        seen.add(value);
    }
    return value;
    };
  }

  deviceHasCapability = (cap) => {
    const device = deviceController.getDevice();
    console.log("cap: " + cap + " " + !!(device && device.hasCapability(cap)));
		return !!(device && device.hasCapability(cap));
	}
  
  connectClick = () => {
    // ConnectSDK.execute("pickDevice", JSON.stringify([]), null);
    discoveryController.showPicker();
  }

  displayImageClick = () => {
		var url = image.url;
		var mimeType = image.mimeType;

		var options = {
			title: image.title,
			iconUrl: image.iconUrl,
			description: image.description
		};


    const device = deviceController.getDevice();

    if (device) {
      var request = device.getMediaPlayer().displayImage(url, mimeType, options).success(function (launchSession) {
        // Release any old launchSession you have, and store the launchSession for future use
        if (mediaPlayer.launchSession !== null) {
          mediaPlayer.launchSession.release();
        }
        mediaPlayer.launchSession = launchSession && launchSession.acquire();
      });
    }
	}

  playVideoClick = () => {
		var url = video.url;
		var mimeType = video.mimeType;

		var options = {
			title: video.title,
			iconUrl: video.iconUrl,
			description: video.description,
			shouldLoop: video.shouldLoop
		};

    const device = deviceController.getDevice();
    if (device) {
      var request = device.getMediaPlayer().playMedia(url, mimeType, options).success(function (launchSession, mediaControl) {
        // Release any old launchSession you have, and store the launchSession for future use
        if (mediaPlayer.launchSession !== null) {
          mediaPlayer.launchSession.release();
        }
        mediaPlayer.launchSession = launchSession && launchSession.acquire();

        // Release any old mediaControl you have, and store the launchSession for future use
        if (mediaPlayer.mediaControl !== null) {
          mediaPlayer.mediaControl.release();
        }
        mediaPlayer.mediaControl = mediaControl && mediaControl.acquire();
      }).error(function (err) { console.log(JSON.stringify(err)); });
    }
	}

  playVideoWithSubtitlesClick = () => {
		var url = video.url;
		var mimeType = video.mimeType;

		var options = {
			title: video.title,
			iconUrl: video.iconUrl,
			description: video.description,
			shouldLoop: video.shouldLoop
		};

    const device = deviceController.getDevice();
    if (device) {
      // Subtitles
      if (device.hasCapability(Capabilities.MediaPlayer.Subtitle.WebVTT) || device.hasCapability(Capabilities.MediaPlayer.Subtitle.SRT)) {
        options.subtitles = {
          url: device.hasCapability(Capabilities.MediaPlayer.Subtitle.WebVTT) ? video.subtitles.WebVTT.url : video.subtitles.SRT.url,
          label: video.subtitles.label,
          language: video.subtitles.language,
          mimeType: device.hasCapability(Capabilities.MediaPlayer.Subtitle.WebVTT) ? video.subtitles.WebVTT.mimeType : video.subtitles.SRT.mimeType
        };
      }

      var request = device.getMediaPlayer().playMedia(url, mimeType, options).success(function (launchSession, mediaControl) {
        // Release any old launchSession you have, and store the launchSession for future use
        if (mediaPlayer.launchSession !== null) {
          mediaPlayer.launchSession.release();
        }
        mediaPlayer.launchSession = launchSession && launchSession.acquire();

        // Release any old mediaControl you have, and store the launchSession for future use
        if (mediaPlayer.mediaControl !== null) {
          mediaPlayer.mediaControl.release();
        }
        mediaPlayer.mediaControl = mediaControl && mediaControl.acquire();

      }).error(function (err) { console.log(JSON.stringify(err)); });
    }
	}

  playAudioClick = () => {
		var url = audio.url;
		var mimeType = audio.mimeType;

		var options = {
			title: audio.title,
			iconUrl: audio.iconUrl,
			description: audio.description,
			shouldLoop: audio.shouldLoop
		};

    const device = deviceController.getDevice();
    if (device) {
      var request = device.getMediaPlayer().playMedia(url, mimeType, options).success(function (launchSession, mediaControl) {
        // Release any old launchSession you have, and store the launchSession for future use
        if (mediaPlayer.launchSession !== null) {
          mediaPlayer.launchSession.release();
        }
        mediaPlayer.launchSession = launchSession && launchSession.acquire();

        // Release any old mediaControl you have, and store the launchSession for future use
        if (mediaPlayer.mediaControl !== null) {
          mediaPlayer.mediaControl.release();
        }
        mediaPlayer.mediaControl = mediaControl && mediaControl.acquire();
      }).error(function (err) { console.log(JSON.stringify(err)); });
    }
	}

  mediaPlayClick = () => {
		// mediaPlayer.mediaControl is cached from the response to device.getMediaPlayer().playMedia
		// See handlePlayAudio, handlePlayVideo, handlePlayVideoWithSubtitles and handlePlayPlaylist for samples
		if (mediaPlayer.mediaControl) {
			mediaPlayer.mediaControl.play();
		}
	}

	/*
		Pause playback of a playing video/audio/playlist
		Capabilities: MediaControl.Pause
	*/
	mediaPauseClick = () =>  {
		// mediaPlayer.mediaControl is cached from the response to device.getMediaPlayer().playMedia
		// See handlePlayAudio, handlePlayVideo, handlePlayVideoWithSubtitles and handlePlayPlaylist for samples
		if (mediaPlayer.mediaControl) {
			mediaPlayer.mediaControl.pause();
		}
	}

	/*
		Stop playback of a playing video/audio/playlist
		Capabilities: MediaControl.Stop
	*/
	mediaStopClick = () =>  {
		// mediaPlayer.mediaControl is cached from the response to device.getMediaPlayer().playMedia
		// See handlePlayAudio, handlePlayVideo, handlePlayVideoWithSubtitles and handlePlayPlaylist for samples
		if (mediaPlayer.mediaControl) {
			mediaPlayer.mediaControl.stop();
		}
	}

  mediaRewindClick = () => {
		// mediaPlayer.mediaControl is cached from the response to device.getMediaPlayer().playMedia
		// See handlePlayAudio, handlePlayVideo, handlePlayVideoWithSubtitles and handlePlayPlaylist for samples
		if (mediaPlayer.mediaControl) {
			mediaPlayer.mediaControl.rewind();
		}
	}

	/*
		Fast-forward a playing video/audio/playlist
		Capabilities: MediaControl.FastForward
	*/
	mediaFastForwardClick = () => {
		// mediaPlayer.mediaControl is cached from the response to device.getMediaPlayer().playMedia
		// See handlePlayAudio, handlePlayVideo, handlePlayVideoWithSubtitles and handlePlayPlaylist for samples
		if (mediaPlayer.mediaControl) {
			mediaPlayer.mediaControl.fastForward();
		}
	}

	/*
		Navigate playlist to the previous item
		Capabilities: PlaylistControl.Previous
	*/
	mediaPreviousClick = () => {
		if (mediaPlayer.playlistControl) {
			mediaPlayer.playlistControl.previous();
		}
	}

	/*
		Navigate playlist to the next item
		Capabilities: PlaylistControl.Next
	*/
	mediaNextClick = () => {
		if (mediaPlayer.playlistControl) {
			mediaPlayer.playlistControl.next();
		}
	}

	/*
		Navigate playlist to a specific index
		Capabilities: PlaylistControl.JumpToTrack
	*/
	mediaJumpToTrackClick = () => {
		if (mediaPlayer.playlistControl) {
			mediaPlayer.playlistControl.jumpToTrack(itemIndex);
		}
	}

	/*
		Seek the media to a particular time (in seconds)
		Capabilities: MediaControl.Seek
	*/
	mediaSeekTo = (inEvent) => {
    console.log('mediaSeekTo ' + inEvent.position);
		if (mediaPlayer.mediaControl) {
			mediaPlayer.mediaControl.seek(inEvent.position).success(function () {}).error(function () {});
		}
	}

	/*
		Get the duration (in seconds) of the playing media
		Capabilities: MediaControl.Duration
	*/
	mediaGetDuration = () => {
		if (mediaPlayer.mediaControl) {
			mediaPlayer.mediaControl.getDuration().success(function (duration) {
				// 'duration' contains the media duration in seconds;
        //set UI duration
        console.log('mediaGetDuration ' + duration);
        Alert.alert('duration: ' + duration);
			}).error(function (err) { console.log(JSON.stringify(err)); });
		}
	}

	/*
		Get the position (in seconds) of the playing media
		Capabilities: MediaControl.Position
	*/
	mediaGetPositionClick = () => {
		if (mediaPlayer.mediaControl) {
			mediaPlayer.mediaControl.getPosition().success(function (position) {
				// 'position' contains the media position in seconds
        //set position
        }).error(function (err) { console.log(JSON.stringify(err)); });
		}
	}

  getChannel(channel) {
    Alert.alert('channel: ' + JSON.stringify(channel));
    console.log('channel: ' + JSON.stringify(channel));
  }

  subscribeChannelClick = () => {
    const device = deviceController.getDevice();
    if (device) 
    {
      subscription = device.getTVControl().subscribeCurrentChannel().success(this.getChannel, this);
      subscribeChannel = ConnectSDK.eventEmitter.addListener(subscription.getCommandId(), this.getChannel);
    }
  }

  cancelSubscribeChannelClick = () => {
    if (subscription && subscribeChannel) {
      subscription.unsubscribe(subscribeChannel);
      subscribeChannel = 0;
      subscription = 0;
    }
  }

  channelUpClick = () => {
    console.log('channelUpClick');
    const device = deviceController.getDevice();
    if (device)
      device.getTVControl().channelUp();
  }
  
  channelDownClick = () => {
    console.log('channelDownClick');
    const device = deviceController.getDevice();
    if (device)
      device.getTVControl().channelDown();
  }

  subscribeVolumeClick = () => {
    const device = deviceController.getDevice();
    if (device) 
    {
      subscription = device.getVolumeControl().subscribeVolume().success(this.getVolume, this);
      subscribeVolume = ConnectSDK.eventEmitter.addListener(subscription.getCommandId(), this.getVolume);
    }
  }

  cancelSubscribeVolumeClick = () => {
    if (subscription && subscribeVolume) {
      subscription.unsubscribe(subscribeVolume);
      subscribeVolume = 0;
      subscription = 0;
    }
  }

  setChannelClick = (inEvent) => {
    var channelInfo = inEvent.channel; // Should be a ChannelInfo object (returned from TVControl.getChannelList; see handleGetChannelList sample
    console.log('setChannelClick ' + JSON.stringify(channelInfo));
    const device = deviceController.getDevice();
    if (device)
      device.getTVControl().setChannel(channelInfo);
  }

  getVolume(vol) {
    Alert.alert('volume: ' + vol);
    console.log('volume: ' + vol);
  }

  setMuteClick = () => {
    const device = deviceController.getDevice();
    if (device) {
      device.getVolumeControl().getMute().success(function(getMute) {
        var mute = !getMute;
        Alert.alert('mute: ' + mute);
        console.log('mute: ' + mute);
        device.getVolumeControl().setMute(mute);
      });
    }
  }

  volumeUpClick = () => {
    const device = deviceController.getDevice();
    if (device)
      device.getVolumeControl().volumeUp();
  }
  
  volumeDownClick = () => {
    const device = deviceController.getDevice();
    if (device)
      device.getVolumeControl().volumeDown();
  }

  getDeviceListClick = () => {
    var devices = ConnectSDK.discoveryManager.getDeviceList();
    Alert.alert(JSON.stringify(devices[0]._deviceId));
  }

  toastClick = () => {
    const device = deviceController.getDevice();
    if (device)
      device.getToastControl().showToast('Test toast');
  }

  getMessage = (message) => {
    Alert.alert(JSON.stringify(message));
  }

  /*
		Launch a web 
		Capabilities: WebAppLauncher.Launch
	*/
	launchWebAppClick = () => {
		var tempWebAppId;

    const device = deviceController.getDevice();
    if (device) {
      for (var service in webAppId) {
        if (!tempWebAppId && webAppId.hasOwnProperty(service)) {
          if (device.hasService(service)) {
            tempWebAppId = webAppId[service];
          }
        }
      }

      device.getWebAppLauncher().launchWebApp(tempWebAppId).success(function (session) {
        webAppSession = session.acquire();
      }, this);
    }
	}

	/*
		Connect to web app app-to-app session
		Capabilities: WebAppLauncher.Connect
	*/
	connectWebAppClick = () => {
    if (webAppSession) {
      subscribeGetMessage = webAppSession.connect().success(function () {
        console.log(subscribeGetMessage.getCommandId());
        ConnectSDK.eventEmitter.addListener(subscribeGetMessage.getCommandId(), this.getMessage);
      }, this).error(function (err) {
        console.log(JSON.stringify(err));
      }, this);
    }
	}

	/*
		Send a string message to a connected web app
		Capabilities: WebAppLauncher.Message.Send
	*/
  sendMessageClick = (inEvent) => {
    var text = inEvent.message;
		if (webAppSession) {
			console.log("Sending message: " + text);
			webAppSession.sendText(text);
		}
	}

	/*
		Send JSON formatted data to a connected web app
		Capabilities: WebAppLauncher.Message.Send.JSON
	*/
	sendJSONClick = (inEvent) => {
    var json = inEvent.message;
		if (webAppSession) {
			console.log("Sending JSON: ", json);
			webAppSession.sendJSON(json);
		}
	}

	/*
		Close a web app
		Capabilities: WebAppLauncher.Close
	*/
  closeWebAppClick = () => {
		if (webAppSession) {
			webAppSession.close().success(function () {
				webAppSession = null;
			}, this).error(function (err) {
				console.log(JSON.stringify(err));
			}, this);
		}
	}

	/*
		Leave a web app
		Capabilities: WebAppLauncher.Disconnect
	*/
  leaveWebAppClick = () => {
    subscribeGetMessage = 0;
		if (webAppSession) {
			webAppSession.disconnect();
		}
	}

	/*
		Pin a web app
		Capabilities: WebAppLauncher.Pin
	*/
  pinWebAppClick = () => {
    const device = deviceController.getDevice();
    if (device)
      device.getWebAppLauncher().pinWebApp("WebAppTester").error(function (err) {
			  console.log(JSON.stringify(err));
		  });
	}

	/*
		Unpin a web app
		Capabilities: WebAppLauncher.Pin
	*/
  unpinWebAppClick = () => {
    const device = deviceController.getDevice();
    if (device)
      device.getWebAppLauncher().unPinWebApp("WebAppTester").error(function (err) {
        console.log(JSON.stringify(err));
		  });
	}

  /*
		Simulate up press
		Capabilities: KeyControl.Up
	*/
	buttonUpClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getKeyControl().up();
	}

  /*
		Simulate down press
		Capabilities: KeyControl.Down
	*/
	buttonDownClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getKeyControl().down();
	}

	/*
		Simulate left press
		Capabilities: KeyControl.Left
	*/
	buttonLeftClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getKeyControl().left();
	}

	/*
		Simulate right press
		Capabilities: KeyControl.Right
	*/
	buttonRightClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getKeyControl().right();
	}

	/*
		Simulate OK press
		Capabilities: KeyControl.OK
	*/
	buttonOKClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getKeyControl().ok();
	}

	/*
		Simulate home press
		Capabilities: KeyControl.Home
	*/
	buttonHomeClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getKeyControl().home();
	}

	/*
		Simulate back press
		Capabilities: KeyControl.Back
	*/
	buttonBackClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getKeyControl().back();
	}

	/*
		Resume media playback
		Capabilities: MediaControl.Play
	*/
	buttonPlayClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getMediaControl().play();
	}

	/*
		Pause media playback
		Capabilities: MediaControl.Pause
	*/
	buttonPauseClick = () => {
    if (device)
  		device.getMediaControl().pause();
	}

	/*
		Stop media playback
		Capabilities: MediaControl.Stop
	*/
	buttonStopClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getMediaControl().stop();
	}

	/*
		Rewind media
		Capabilities: MediaControl.Rewind
	*/
	buttonRewindClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getMediaControl().rewind();
	}

	/*
		Fast forward media
		Capabilities: MediaControl.FastForward
	*/
	buttonFastForwardClick = () => {
    const device = deviceController.getDevice();
    if (device)
      device.getMediaControl().fastForward();
	}

	/*
		List the device's external inputs
		Capabilities: ExternalInputControl.List
	*/
	getExternalInputListClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getExternalInputControl().getExternalInputList().success(function (inputs) {
			// Inputs contains an array of external inputs
      console.log(JSON.stringify(inputs));
      Alert.alert(JSON.stringify(inputs));
		}).error(function (err) {
      console.log(JSON.stringify(err));
		});
	}

	/*
		Switch the device to an external input
		Capabilities: ExternalInputControl.Set
	*/
	openExternalInputClick = (inEvent) => {
    var input = inEvent.input;
    const device = deviceController.getDevice();
    if (device)
  		device.getExternalInputControl().setExternalInput(input);
	}

	/*
		Show the device's input picker
		Capabilities: ExternalInputControl.Picker.Launch
	*/
	showInputPickerClick = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getExternalInputControl().showExternalInputPicker();
	}

	/*
		Power off the device
		Capabilities: PowerControl.Off
	*/
	powerOffClick = () => {
    const device = deviceController.getDevice();
    if (device)
      device.getPowerControl().powerOff();
	}

	/*
		Connect the mouse
		Capabilities: MouseControl.Connect
	*/
	mouseConnect = () => {
    const device = deviceController.getDevice();
    if (device)
  		device.getMouseControl().connectMouse();
	}

	/*
		Move the mouse
		Capabilities: MouseControl.Move
	*/
	mouseMoveClick = (inEvent) => {
    var dx = inEvent.dx; // Integer, the change in x position of the mouse
		var dy = inEvent.dy; // Integer, the change in y position of the mouse
    console.log('dx: '+dx + ' dy: '+dy);
    const device = deviceController.getDevice();
    if (device)
  		device.getMouseControl().move(dx, dy);
	}

  launchBrowser = (inEvent) => {
    var url = inEvent.url;
    const device = deviceController.getDevice();
    if (device)
      device.getLauncher().launchBrowser(url);
	}

	/*
		Launch a DIAL app
		Capabilities: Launcher.App, Launcher.Params
	*/
  launchDIALApp = () => {
    const device = deviceController.getDevice();
    if (device)
      device.getLauncher().launchApp(dialAppId);
	}

  /*
		Open Hulu
		Capabilities: Launcher.Hulu, Launcher.Hulu.Params
	*/
	launchHulu = (inEvent) => {
    var contentId = inEvent.contentId;
    const device = deviceController.getDevice();
    if (device)
      device.getLauncher().launchHulu(contentId);
	}
	/*
		Open Netflix
		Capabilities: Launcher.Netflix, Launcher.Netflix.Params
	*/
	launchNetflix = (inEvent) => {
    var contentId = inEvent.contentId;
    const device = deviceController.getDevice();
    if (device)
      device.getLauncher().launchNetflix(contentId);
	}

	/*
		Launch the device app store with optional deep linking
		Capabilities: Launcher.AppStore, Launcher.AppStore.Params
	*/
  launchAppStore = () => {
		// To deep link to an app we need the app id
    var tempAppId;

    const device = deviceController.getDevice();
    if (device) {
      for (var service in appId) {
        if (!tempAppId && appId.hasOwnProperty(service)) {
          if (device.hasService(service)) {
            tempAppId = appId[service];
          }
        }
      }
      device.getLauncher().launchAppStore(tempAppId);
    }
}

	/*
		Launch Youtube with optional deep linking to a video
		Capabilities: Launcher.YouTube, Launcher.YouTube.Params
	*/
  launchYoutube = () => {
    const device = deviceController.getDevice();
    if (device)
      device.getLauncher().launchYouTube(youtubeContentId);
	}

	/*
		List the device's installed apps
		Capabilities: Launcher.List
	*/
	getAppList = () => {
    const device = deviceController.getDevice();
    if (device)
		  device.getLauncher().getAppList().success(function (apps) {
		    // Inputs contains an array of apps
        Alert.alert(JSON.stringify(apps));
      }).error(function (err) {
        console.log(JSON.stringify(err));
      });
	}

	/*
		Open an app on the device
		Capabilities: Launcher.App
	*/
	openApp = (inEvent) => {
    var appId = inEvent.appId;
    const device = deviceController.getDevice();
    if (device)
      device.getLauncher().launchApp(appId);
	}

  /*
		Simulate remote button press
		Capabilities: KeyControl.KeyCode
	*/
	buttonPress = (inEvent) => {
    var keyCode = inEvent.keyCode;
    const device = deviceController.getDevice();
    if (device)
      device.getKeyControl().sendKeyCode(keyCode);
	}

  render() {
    return (
      <ScrollView style={styles.container}>
      <View style={Platform.OS === 'ios' ? {flexDirection: 'row', height: 50,padding: 20} : {}}/>
        <TouchableOpacity style={styles.button} onPress={this.connectClick}>
        <Text>{this.state.connectedDeviceName}</Text>
        </TouchableOpacity>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        <View style={{flexDirection: 'row'}}>
        <TouchableOpacity style={styles.button} onPress={this.displayImageClick} disabled={!!this.deviceHasCapability(Capabilities.MediaPlayer.Display.Image)}>
            <Text>Display{'\n'}Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.playVideoClick}>
            <Text>Play{'\n'}Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.playAudioClick}>
            <Text>Play{'\n'}Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => this.mediaSeekTo({position:5})}>
            <Text>Seek{'\n'}to 5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.mediaGetDuration}>
            <Text>Duration</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={this.mediaRewindClick}>
            <Text>Rewind</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.mediaPlayClick}>
            <Text>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.mediaPauseClick}>
            <Text>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.mediaStopClick}>
            <Text>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.mediaFastForwardClick}>
            <Text>Fast{'\n'}Forward</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={this.channelUpClick}>
            <Text>Channel{'\n'}up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.channelDownClick}>
            <Text>Channel{'\n'}down</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.subscribeChannelClick}>
            <Text>Subscribe{'\n'}Channel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.cancelSubscribeChannelClick}>
            <Text>Cancel{'\n'}Subscribe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => this.setChannelClick({channel:{number:11}})}>
            <Text>Set{'\n'}Channel</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={this.volumeUpClick}>
            <Text>Volume{'\n'}up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.volumeDownClick}>
            <Text>Volume{'\n'}down</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.subscribeVolumeClick}>
            <Text>Subscribe{'\n'}Volume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.cancelSubscribeVolumeClick}>
            <Text>Cancel{'\n'}Subscribe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.setMuteClick}>
            <Text>Mute{'\n'}Volume</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={this.toastClick}>
            <Text>Test toast</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.getExternalInputListClick}>
            <Text>External{'\n'}InputList</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.openExternalInputClick({input:{id:'HDMI_1'}})}}>
            <Text>Open{'\n'}HDMI1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.powerOffClick}>
            <Text>Power{'\n'}Off</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={this.launchWebAppClick}>
            <Text>Launch{'\n'}WebApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.connectWebAppClick}>
            <Text>Join{'\n'}WebApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => this.sendJSONClick({message: {type: "message", "contents": "This is a test JSONmessage"}})}>
            <Text>Send{'\n'}JSON</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => this.sendMessageClick({message:"This is a test message."})}>
            <Text>Send{'\n'}Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.leaveWebAppClick}>
            <Text>Leave{'\n'}WebApp</Text>
            </TouchableOpacity>
        </View>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={this.closeWebAppClick}>
            <Text>Close{'\n'}WebApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.pinWebAppClick}>
            <Text>Pin{'\n'}WebApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.unpinWebAppClick}>
            <Text>Unpin{'\n'}WebApp</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={this.buttonRewindClick}>
            <Text>Rewind</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.buttonPlayClick}>
            <Text>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.buttonPauseClick}>
            <Text>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.buttonStopClick}>
            <Text>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.buttonFastForwardClick}>
            <Text>Forward</Text>
            </TouchableOpacity>
        </View>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={this.buttonHomeClick}>
            <Text>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.buttonOKClick}>
            <Text>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.buttonLeftClick}>
            <Text>Left</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.buttonUpClick}>
            <Text>Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.buttonDownClick}>
            <Text>Down</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.buttonRightClick}>
            <Text>Right</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={this.mouseConnect}>
            <Text>Mouse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.mouseMoveClick({dx:parseInt(Math.random() * 100), dy:parseInt(Math.random() * 100)})}}>
            <Text>Mouse{'\n'}Move</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={() => {this.launchBrowser("https://google.com")}}>
            <Text>Browser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.launchDIALApp}>
            <Text>My DIAL{'\n'}App</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.launchHulu("80017467")}}>
            <Text>Hulu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.launchYoutube}>
            <Text>Youtube</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.launchNetflix("70217913")}}>
            <Text>Netflix</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={this.launchAppStore}>
            <Text>Appstore</Text>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 10,padding: 10}}/>
        {Platform.OS !== 'ios' && <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 1})}}>
            <Text>  1  </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 2})}}>
            <Text>  2  </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 3})}}>
            <Text>  3  </Text>
            </TouchableOpacity>
        </View>}
        {Platform.OS !== 'ios' && <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 4})}}>
            <Text>  4  </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 5})}}>
            <Text>  5  </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 6})}}>
            <Text>  6  </Text>
            </TouchableOpacity>
        </View>}
        {Platform.OS !== 'ios' && <View style={{flex: 1, flexDirection: 'row', visibility:Platform.OS === 'ios' ? "hidden" : "visible"}}>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 7})}}>
            <Text>  7  </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 8})}}>
            <Text>  8  </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 9})}}>
            <Text>  9  </Text>
            </TouchableOpacity>
        </View>}
        {Platform.OS !== 'ios' && <View style={{flex: 1, flexDirection: 'row', visibility:Platform.OS === 'ios' ? "hidden" : "visible"}}>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 10})}}>
            <Text>  -  </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 0})}}>
            <Text>  0  </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {this.buttonPress({keyCode: 11})}}>
            <Text>  Enter  </Text>
            </TouchableOpacity>
        </View>}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    height: 50
  }
})

export default App;