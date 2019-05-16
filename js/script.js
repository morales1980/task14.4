(function() {

  // tablica z danymi nt slajdow
  var images = [
    {
      image: 'http://via.placeholder.com/400x200/aaeeff/000000?text=slide1',
      alt: 'Photo placeholder',
      title: 'lorem ipsum',
      description: 'dolor sit amet',
      id: '1',
      coords: {lat: 64.050156, lng: -16.180056} //jokulsarlon
    },
    {
      image: 'http://via.placeholder.com/400x200/058faa/000000?text=slide2',
      alt: 'Photo placeholder',
      title: 'lorem ipsum',
      description: 'dolor sit amet',
      id: '2',
      coords: {lat: 65.717648, lng: -16.754463} //krafla volcano
    },
    {
      image: 'http://via.placeholder.com/400x200/1159fa/000000?text=slide3',
      alt: 'Photo placeholder',
      title: 'lorem ipsum',
      description: 'dolor sit amet',
      id: '3',
      coords: {lat: 63.532125, lng: -19.511411} //Skogafoss waterfall
    },
    {
      image: 'http://via.placeholder.com/400x200/ffffaa/000000?text=slide4',
      alt: 'Photo placeholder',
      title: 'lorem ipsum',
      description: 'dolor sit amet',
      id: '4',
      coords: {lat: 65.606323, lng: -20.635247} //Hvitserkur rock formation
    },
    {
      image: 'http://via.placeholder.com/400x200/fafe01/000000?text=slide5',
      alt: 'Photo placeholder',
      title: 'lorem ipsum',
      description: 'dolor sit amet',
      id: '5',
      coords: {lat: 63.879411, lng: -22.445377} //Blue Lagoon
    }
  ];

  //Mustache.Js templates
  var templateCell = document.querySelector('#template-carousel-cell').innerHTML;
  var templateCarousel = document.querySelector('#template-carousel').innerHTML;
  var carouselContainer = document.querySelector('#carousel-container');


  Mustache.parse(templateCell);

  var carouselCells = '';

  for(var i = 0; i < images.length; i++) {
    carouselCells += Mustache.render(templateCell, images[i]);
  }

  var fullCarousel = Mustache.render(templateCarousel, {carouselItems: carouselCells});

  carouselContainer.insertAdjacentHTML('beforeend', fullCarousel);

  //Carousel spawn
  var flkty = new Flickity( '.carousel', {
    cellAlign: 'left',
    contain: true,
    wrapAround: true,
    hash: true
  });

  flkty.select( 0, true, true );

  // funkcjonalnosc restart button
  var buttonRestart = document.querySelector('.button-restart');
  buttonRestart.addEventListener('click', function(e) {
    flkty.select( 0 );
  });
  //funkcjonalnosc progress bar
  var progressBar = document.querySelector('.progress-bar')

  flkty.on('scroll', function( progress ) {
    progress = Math.max( 0, Math.min( 1, progress ) );
    progressBar.style.width = progress * 100 + '%';
  });

  //Google Maps plugin
  window.initMap = function() {

    var locations = [
      {lat: 64.050156, lng: -16.180056},
      {lat: 65.717648, lng: -16.754463},
      {lat: 63.532125, lng: -19.511411},
      {lat: 65.606323, lng: -20.635247},
      {lat: 63.879411, lng: -22.445377}
    ];

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 6,
      center: {lat: 64.866623, lng: -18.461201}
    });

    var markers = [];

    for(var i = 0; i < locations.length; i++) {
      var marker = new google.maps.Marker({
        position: locations[i],
        map: map
      });

      markers.push(marker);
    }

    //dodawanie eventow do markerow - po kliknieciu w marker karuzela przewija sie do konkretnego slajdu - CLOSURE
    for(var j = 0; j < markers.length; j++) {
      (function() {
        var k = j;

        markers[k].addListener('click', function () {
          flkty.select( k );
        })
      })();

    };

    // plynne przewijanie i zoomowanie mapy po kliknieciu w marker
    var smoothPanAndZoom = function(map, zoom, coords){

      var jumpZoom = zoom - Math.abs(map.getZoom() - zoom);
      jumpZoom = Math.min(jumpZoom, zoom -1);
      jumpZoom = Math.max(jumpZoom, 3);


      smoothZoom(map, jumpZoom, function(){

        smoothPan(map, coords, function(){

          smoothZoom(map, zoom);
        });
      });
    };

    var smoothZoom = function(map, zoom, callback) {
      var startingZoom = map.getZoom();
      var steps = Math.abs(startingZoom - zoom);


      if(!steps) {

        if(callback) {

          callback();
        }

        return;
      }

      var stepChange = - (startingZoom - zoom) / steps;

      var i = 0;

      var timer = window.setInterval(function(){

        if(++i >= steps) {

          window.clearInterval(timer);

          if(callback) {

            callback();
          }
        }

        map.setZoom(Math.round(startingZoom + stepChange * i));
      }, 80);
    };

    var smoothPan = function(map, coords, callback) {
      var mapCenter = map.getCenter();
      coords = new google.maps.LatLng(coords);

      var steps = 12;
      var panStep = {lat: (coords.lat() - mapCenter.lat()) / steps, lng: (coords.lng() - mapCenter.lng()) / steps};

      var i = 0;
      var timer = window.setInterval(function(){
        if(++i >= steps) {
          window.clearInterval(timer);
          if(callback) callback();
        }
        map.panTo({lat: mapCenter.lat() + panStep.lat * i, lng: mapCenter.lng() + panStep.lng * i});
      }, 1000/30);
    };

    // przewijanie mapy po zmianie slajdu
    flkty.on( 'change', function( index ) {
      smoothPanAndZoom(map, 7, images[index].coords);
    });
  }
})();
