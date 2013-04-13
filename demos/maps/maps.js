window.mapApp = {

	map: null,
	apiService : null,

	init : function()
	{
		// hide & show toolbar buttons
		emy.$('#aboutBtn').style.display='block';
		emy.$('#locateBtn').style.display='none';
	},

	setMapCallBack : function(functionName)
	{
		emy.$('#aboutBtn').style.display='none';
		emy.$('#map').setAttribute('data-onshow', functionName+'()');	// set onshow attribute
	},

	clearMap : function()
	{
		emy.$('#aboutBtn').style.display='block';
		emy.$('#locateBtn').style.display='none';
		mapApp.map=null;
		emy.$('#map').innerHTML='';	// clear map screen
	},


	loadGoogleMap : function()
	{
	  mapApp.apiService = 'google';
    var mapOptions = {
      zoom: 8,
      center: new google.maps.LatLng(50.635, 3.06),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    mapApp.map = new google.maps.Map(document.getElementById('map'),
        mapOptions);
	},

	loadGoogleMapWithMarkers : function()
	{
	  mapApp.apiService = 'google';
		var myLatlng=new google.maps.LatLng(50.635, 3.06);
        var mapOptions = {
          zoom: 8,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        mapApp.map = new google.maps.Map(document.getElementById('map'),
            mapOptions);

        mapApp.myPositionMarker = new google.maps.Marker({
            position: myLatlng,
            map: mapApp.map
        });
        google.maps.event.addListener(mapApp.myPositionMarker, 'click', function() {
        	mapApp.showPositionInfos(this.position);
        });
	},

	loadGoogleMapWithGeolocation : function()
	{
	  mapApp.apiService = 'google';
		emy.$('#aboutBtn').style.display='none';
		emy.$('#locateBtn').style.display='block';

		var myLatlng=new google.maps.LatLng(40.635, -73.06);
        var mapOptions = {
          zoom: 3,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        mapApp.map = new google.maps.Map(document.getElementById('map'),
            mapOptions);

        mapApp.getMyPosition();
	},

	getMyPosition : function()
	{
    if(navigator.geolocation)
    {
			mapApp.showLoader('Detect your location...');
			navigator.geolocation.getCurrentPosition(function(position)
			{
				mapApp.showLoader('Got you!');
				if(mapApp.apiService=='google')
				{
          var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

          mapApp.map.panTo(pos);

          mapApp.myPositionMarker = new google.maps.Marker({
            position: pos,
            map: mapApp.map,
            animation: google.maps.Animation.DROP,
            title: 'This is you'
          });

          google.maps.event.addListener(mapApp.myPositionMarker, 'click', function() {
            mapApp.showPositionInfos(this.position);
          });
        }
        else if(mapApp.apiService=='bing')
        {
          var pinPosition = new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude);
          var pin = new Microsoft.Maps.Pushpin(pinPosition, {text: 'This is you'});
          mapApp.map.entities.push(pin);
          Microsoft.Maps.Events.addHandler(pin, 'click', mapApp.showPositionInfos);

        }

				setTimeout(function() {
					mapApp.hideLoader();
				}, 1000);
			},
			function()
			{
				alert('Error: The Geolocation service failed.');
				mapApp.hideLoader();
			});
		} else {
			alert("Error: Your browser does not support geolocation.");
			mapApp.hideLoader();
		}

	},

	showPositionInfos : function(pos)
	{
		mapApp.showLoader('Geocoding your location...');
    if(mapApp.apiService=='google')
    {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'latLng': pos}, function(res, status)
      {
        if (status == google.maps.GeocoderStatus.OK)
        {
          mapApp.showLoader('Got it!');
          var a = res[0].address_components;

          var b = '';
          for(i=0;i<a.length;i++) {
            b += '<div class="row"><p><strong>'+a[i].types[0]+'</strong><br />'+a[i].long_name+'</p></div>';
          }

          emy.$('#map_info').innerHTML = "<h2>"+res[0].formatted_address+"</h2><fieldset>"+b+"</fieldset>";
          mapApp.hideLoader();
          setTimeout(function() {
            emy.gotoView('map_info');
          }, 10);
        }
        else
          alert("Geocoder failed due to: " + status);
  		});
  	}
  	else if(mapApp.apiService=='bing')
  	{

  	}
	},


  // this credential key is linked to http://www.remi-grumeau.com/projects/emy/demos/maps/maps.html url.
  // to get yours, visit bingmapsportal.com/
	loadBingMap : function()
	{
	  mapApp.apiService = 'bing';

	  var mapOptions = {
      credentials:  "Al3pZfIdFHKxh2pk5f9EArGtRk8P1SibrVHSnt-qJ8wD1n40Z0kCw677iTKOzup_",
      center:       new Microsoft.Maps.Location(40.7623, -73.9883),
      mapTypeId:    Microsoft.Maps.MapTypeId.road,
      zoom:         11
    }

	  mapApp.map = new Microsoft.Maps.Map(emy.$("#map"), mapOptions);
	},


	loadBingMapWithPin : function()
	{
	  mapApp.apiService = 'bing';

    var mapCenter = new Microsoft.Maps.Location(40.7623, -73.9883);
	  var mapOptions = {
      credentials:  "Al3pZfIdFHKxh2pk5f9EArGtRk8P1SibrVHSnt-qJ8wD1n40Z0kCw677iTKOzup_",
      center:       mapCenter,
      mapTypeId:    Microsoft.Maps.MapTypeId.aerial,
      zoom:         11
    }

	  mapApp.map = new Microsoft.Maps.Map(emy.$("#map"), mapOptions);

	  var pin = new Microsoft.Maps.Pushpin(mapCenter, {text: 'Y'});
    mapApp.map.entities.push(pin);
	},




	loadMapBoxMap : function()
	{
    mapbox.load('examples.map-vyofok3q', function(o) {
    mapApp.map = mapbox.map('map');
    mapApp.map.centerzoom({lat: 50.635, lon: 3.06 }, 8);
    mapApp.map.addLayer(o.layer);
    mapApp.map.ui.zoomer.add();

    // Create an empty markers layer
    var markerLayer = mapbox.markers.layer();
    mapApp.map.addLayer(markerLayer);

    markerLayer.add_feature({
        geometry: {
          coordinates: [3.06, 50.635]
        },
        properties: {
          'marker-color': '#000',
          'marker-symbol': 'star-stroked',
          title: 'Example Marker',
          description: 'This is a single marker.'
        }
      });
    });
	},


	showLoader : function(txt)
	{
		var a = emy.$('#loadingPrompt');
		if(!a)
		{
			var divLoading = document.createElement('div');
			divLoading.id = "loadingPrompt";
			divLoading.innerHTML = '<p>'+txt+'</p>';
			document.body.appendChild(divLoading);
		} else {
			a.innerHTML = '<p>'+txt+'</p>';
			a.style.display = 'block';
		}
	},

	hideLoader : function() {
		var a = emy.$('#loadingPrompt');
		if(a) { a.style.display = 'none'; }
	}
}