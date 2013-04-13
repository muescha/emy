window.fbapp = {

	authResponse : null,

	showLoader : function(txt)
	{
		if(!emy.$('#loader')) {
			var a = document.createElement('div');
			a.id="loader";
			a.innerHTML = '<span>'+txt+'</span>';
			document.body.appendChild(a);
		} else {
			emy.$('#loader').innerHTML = '<span>'+txt+'</span>';
			emy.$('#loader').className = '';
		}
	},

	hideLoader : function() {
		emy.$('#loader').className = 'hide';
	},

	handleStatusChange : function(response)
	{
		if (response.authResponse)
		{
			fbapp.accesstoken = response.authResponse.accessToken;
			fbapp.userId = response.authResponse.userID;

			emy.$('#userLoginBtn').style.display = 'none';
			emy.$('#userLogoutBtn').style.display = 'block';

			fbapp.init();
		}
	},

	init : function()
	{
    fbapp.showLoader('Loading...');
		FB.api('/me', function(response)
		{
      emy.$('#toolbar').setAttribute('data-hide','false');

			var a = '<ul id="homeList"><li class="group">My datas</li>'+"\n";
			a += '<li><a href="javascript:fbapp.getFriendsList()">My friends</a></li>'+"\n";
			a += '<li><a href="javascript:fbapp.getAlbums()">My photos</a></li>'+"\n";
			a += '<li><a href="javascript:fbapp.getLikes()">My interests (stuffs i liked)</a></li>'+"\n";
			a += '<li class="group">Profile</li>'+"\n";
			a += '<li class="listicon"><img src="https://graph.facebook.com/' + response.id + '/picture">' + response.name + '</li>'+"\n";
			a += '<li><a href="#profile">My profile</a></li></ul>'+"\n";
			emy.$('#home').innerHTML = a;
			a=null;

			// generate my profile
			emy.$('#profileName').innerHTML = response.name;
			emy.$('#profileLastName').value = response.last_name;
			emy.$('#profileFirstName').value = response.first_name;
			emy.$('#profileBirthday').value = response.birthday;
			emy.$('#profileBio').innerHTML = response.bio;
			emy.$('#profileEmail').value = response.email;
			emy.$('#profileEmail').onclick = function() { window.location = "mailto:"+response.email };
			emy.$('#profilePic').src = 'https://graph.facebook.com/' + response.id + '/picture?type=normal';

      // hide loader
      fbapp.hideLoader();
		});
	},


	userLogin : function(response)
	{
	    // show loader
        fbapp.showLoader('Log in...');
        if(response.authResponse)
        {
            emy.$('#userLoginBtn').style.display = 'none';
            emy.$('#userLogoutBtn').style.display = 'block';
            // hide loader
            fbapp.hideLoader();
	    }
	},

	userLogout : function()
	{
		FB.logout(function(response) {
			if(response.authResponse) {
				emy.$('#userLoginBtn').style.display = 'block';
				emy.$('#userLogoutBtn').style.display = 'none';
				document.getElementById('homeList').innerHTML = '<li>Please login</li>';

				setTimeout(function() {
					emy.goBack();
				}, 10);
			}
		});
	},


	posttofriend : function(friendid)
	{
		fbapp.showLoader('Send to friend...');
		FB.ui(
		  {
			method: 'feed',
			name: 'EMY - Efficient Mobile LibrarY',
			link: 'http://remi-grumeau.com/projects/emy/demos/facebook/',
			picture: 'http://remi-grumeau.com/projects/emy/demos/facebook/images/128x128.png',
			to: friendid
		  },
		  function(response) {
			if (response) {
			  alert('Message was published.');
			} else {
			  alert('Message was not published.');
			}
		  }
		);
	},

	sendtofriend : function(friendid)
	{
		fbapp.showLoader('Send to friend...');
		FB.ui(
		  {
			method: 'send',
			to: friendid,
			link: 'http://www.remi-grumeau.com/projects/emy/demos/facebook/',
			display: 'popup',
			show_error: false
		  },
		  function(response) {
			if (response) {
			  alert('Message was published.');
			} else {
			  alert('Message was not published.');
			}
		  }
		);
	},

	getFriendsList : function()
	{
		fbapp.showLoader('Loading friends list...');
		FB.api('/me/friends', function(response) {
			if(response) {
				var friends = response.data;
				friends.sort(function(a, b) {
				 var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
				 if (nameA < nameB) //sort string ascending
				  return -1
				 if (nameA > nameB)
				  return 1
				 return 0 //default return value (no sorting)
				});
				var a='';
				var aPrev='';
				for(var i=0,inb=friends.length;i<inb;i++) {
					var nameLetter = friends[i].name.substring(friends[i].name, 1);
					if(aPrev!=nameLetter) {
						a += '<li class="group">' + nameLetter + '</li>'+"\n";
					}
					a += '<li><a href="javascript:fbapp.getFriend(\'' + friends[i].id + '\')">' + friends[i].name + '</a></li>'+"\n";
					aPrev = nameLetter;
				}
				emy.$('#friends').setAttribute('data-title', 'My friends ('+friends.length+')');
				emy.$('#friendsList').innerHTML = a;
				a=null;
				fbapp.hideLoader();
				emy.gotoView('friends');
			}
		});
	},

	getFriend : function(uid)
	{
		fbapp.showLoader('Getting friend info...');
		FB.api('/'+uid, function(response) {
			if(response) {
				emy.$('#friend').setAttribute('data-title', response.name);
				emy.$('#friend').setAttribute('data-uid', uid);
				emy.$('#friendName').innerHTML = response.name;
				emy.$('#friendLastName').value = response.last_name;
				emy.$('#friendFirstName').value = response.first_name;
				emy.$('#friendPic').src = 'https://graph.facebook.com/' + uid + '/picture?type=normal';
				emy.$('#friendPostWall').innerHTML = (response.gender=="female")?"Post on her wall":"Post on his wall";
				emy.$('#friendPostWall').href = "https://www.facebook.com/dialog/feed?app_id=342091325902549&link=http://www.remi-grumeau.com/projects/emy/demos/facebook/&picture=http://www.remi-grumeau.com/projects/emy/demos/facebook/images/128x128.png&name=Emy%20-%20Efficient%20Mobile%20librarY&redirect_uri=http://www.remi-grumeau.com/projects/emy/demos/facebook/)";
				emy.$('#friendSendMessage').innerHTML = (response.gender=="female")?"Send her a message":"Send him a message";
				emy.$('#friendSendMessage').href = "javascript:fbapp.sendtofriend("+uid+")";
				fbapp.hideLoader();
				emy.gotoView('friend');
			}
		});
	},


	getAlbums : function() {
		fbapp.showLoader('Getting your albums list');
		FB.api('/me/albums?fields=name,id,count,cover_photo', function(response) {
      var albums = response.data;
      if(albums) {
        albums.sort(function(a, b){
          var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
          if (nameA < nameB) //sort string ascending
            return -1
          if (nameA > nameB)
            return 1
          return 0 //default return value (no sorting)
        });

        var a='';
				for(var i=0,inb=albums.length;i<inb;i++) {
				  if(albums[i].count) {
  					a += '<li class="listicon"><a href="javascript:fbapp.getAlbumPhotos(\'' + albums[i].id + '\', \'' + albums[i].name + '\')"><div class="thumb" style="background-image: url(https://graph.facebook.com/'+albums[i].cover_photo+'/picture?type=thumbnail&access_token='+fbapp.accesstoken+')"></div>' + albums[i].name + ' <span class="bubble">' + albums[i].count + '</span></a></li>'+"\n";
    			}
				}
				emy.$('#albumsList').innerHTML = a;
				a=null;
				fbapp.hideLoader();
    	  emy.gotoView('albums');
			} else {
				fbapp.showLoader('Can\'t upload a photo in your "mobile" album');
				setTimeout(function() { fbapp.hideLoader() }, 1500);
			}
		});
	},

	getAlbumPhotos : function(albumId, albumName)
	{
		fbapp.showLoader('Getting photos from this album');
		FB.api('/'+albumId+'/photos', function(response) {
      var photos = response.data;
      console.log(response.data);
      if(photos) {
        var a='';
				for(var i=0,inb=photos.length;i<inb;i++)
				{
				  var img = photos[i].source;
				  var imgWidth = 0;
				  for(var b=0,bnb=photos[i].length;b<bnb;b++) {
            if(photos[i][b].width < screen.width && photos[i][b].width > imgWidth) {
              img = photos[i][b].source;
              imgWidth = photos[i][b].width;
            }
				  }
				  var comments='';
				  if(photos[i].likes) {
				    var likes = (photos[i].likes.data.length==1)?photos[i].likes.data[0].name+' likes this':photos[i].likes.data.length+' people like this';
				    var comments = '<p class="comment" style="min-height: 2em!important">'+likes+'</p>';
				  }
				  if(photos[i].comments)
				  {
            for(var c=0,cnb=photos[i].comments.data.length;c<cnb;c++) {
              comments += '<p class="comment"><img src="https://graph.facebook.com/'+photos[i].comments.data[c].from.id+'/picture?type=square"><span><em>'+photos[i].comments.data[c].from.name+'</em> '+photos[i].comments.data[c].message+'</span></p>';
            }
          }
					a += '<li><div><img src="' + img + '"><p>' + photos[i].name + '</p>'+comments+'</div></li>'+"\n";
				}
				emy.$('#photos').setAttribute('data-title', albumName);
				emy.$('#photosList').innerHTML = a;
				a=null;
				fbapp.hideLoader();
    	  emy.gotoView('photos');
			} else {
				fbapp.showLoader('Can\'t upload a photo in your "mobile" album');
				setTimeout(function() { fbapp.hideLoader() }, 1500);
			}
		});
	},

	getPhoto : function(photoId)
	{
    fbapp.showLoader('Getting photo');
    FB.api('/'+photoId, function(response) {
      var photo = response.data;
      if(photo) {
        var a='';
        emy.$('#albumsList').innerHTML = a;
        a=null;
        fbapp.hideLoader();
        emy.gotoView('photo');
      } else {
        fbapp.showLoader('Can\'t upload a photo in your "mobile" album');
        setTimeout(function() { fbapp.hideLoader() }, 1500);
      }
    });
	},

	addPhoto : function() {
		fbapp.showLoader('Getting your mobile album id');
		FB.api('/me/albums?fields=id,type', function(response) {
			for(var i=0; i<response.data.length; i++) {
				if(response.data[i].type=='mobile')
					var albumId=response.data[i].id;
			}
			if(albumId) {
				fbapp.showLoader('Adding the Emy logo to this album');
				FB.api('/'+albumId+'/photos', 'post', {
					message : 	'EMY - Efficient Mobile librarY http://www.remi-grumeau.com/projects/emy ',
					url: 		'http://www.remi-grumeau.com/projects/emy/demos/facebook/images/share-image.jpg'
				}, function(e) {
					if(e!=undefined)
						fbapp.hideLoader();
					else {
						fbapp.showLoader('An error has occured');
						setTimeout(function() { fbapp.hideLoader() }, 1500);
					}
				});
			} else {
				fbapp.showLoader('Can\'t upload a photo in your "mobile" album');
				setTimeout(function() { fbapp.hideLoader() }, 1500);
			}
		});
	},


	getLikes : function() {
		fbapp.showLoader('Getting stuffs you liked');
		FB.api('/me/likes', function(response) {
      var likes = response.data;
      if(likes) {
        likes.sort(function(a, b){
          var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
          if (nameA < nameB) //sort string ascending
            return -1
          if (nameA > nameB)
            return 1
          return 0 //default return value (no sorting)
        });

        var a='';
				for(var i=0,inb=likes.length;i<inb;i++) {
  				a += '<li>'+likes[i].name+'</li>'+"\n";
				}
				emy.$('#likesList').innerHTML = a;
				a=null;
				fbapp.hideLoader();
    	  emy.gotoView('likes');

			} else {
				fbapp.showLoader('Can\'t access your likes');
				setTimeout(function() { fbapp.hideLoader() }, 1500);
			}
		});
	},


};

window.fbAsyncInit = function() {
	FB.init({
		appId      : '363157200440698', // App ID
		channelUrl : '//www.remi-grumeau.com/projects/emy/demos/facebook/channel.php', // Channel File
		status     : true, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		xfbml      : true  // parse XFBML
	});

	FB.Event.subscribe('auth.statusChange', fbapp.handleStatusChange);
};


// Load the SDK Asynchronously
(function(d){
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));
