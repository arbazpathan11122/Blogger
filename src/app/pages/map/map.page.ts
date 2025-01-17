import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/service/alert.service';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';

declare const google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  @ViewChild('map', { static: true }) mapElement: ElementRef;

  map: any;

  mapOptions: any;

  latLng: any;
  bounds: any;
  address = {
    address: '',
    locality: '',
    landMark: '',
    state: '',
    city: '',
    distic: '',
    country: '',
    pincode: null,
  };

  markers: any = [];
  componentForm = {
    street_number: 'long_name',
    sublocality_level_1: 'long_name',
    sublocality_level_2: 'long_name',
    sublocality_level_3: 'long_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'long_name',
    country: 'long_name',
    postal_code: 'short_name'
  };
  restaurantDetails: any = [];
  input: any;

  constructor(
    @Inject(Geolocation) public geolocation: Geolocation,
    @Inject(Router) private router: Router,

    @Inject(AlertService) private alertService: AlertService,

  ) { }

  ngOnInit() {
  }
  // tslint:disable-next-line: use-lifecycle-interface
  async ngAfterViewInit() {
    // this.loadMap();
    this.geolocation.getCurrentPosition().then((position: Geoposition) => {

      this.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      console.log(position);

      this.mapOptions = {
        center: this.latLng,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: false,
        // scaleControl: false,
        fullscreenControl: false
      };
      this.initAutocomplete();

    }, (err) => {
      console.log(err);

    });


  }

  initAutocomplete() {
    this.map = new google.maps.Map(document.getElementById('map'), this.mapOptions);

    // Create the search box and link it to the UI element.
    this.input = document.getElementById('autocomplete');

    const searchBox = new google.maps.places.SearchBox(document.getElementById('autocomplete'), {
      types: ['(restaurant)'], componentRestrictions: { country: 'In' }
    });
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.input);

    // Bias the SearchBox results towards current map's viewport.
    this.map.addListener('bounds_changed', () => {
      searchBox.setBounds(this.map.getBounds());
    });

    searchBox.addListener('places_changed', () => {
      this.restaurantDetails = [];
      const places = searchBox.getPlaces();
      this.restaurantDetails = places[0];
      console.log(places);
      if (places.length === 0) {
        return;
      }

      // Clear out the old markers.

      // Clear out the old markers.
      this.markers.forEach((marker) => {
        marker.setMap(null);
      });
      this.markers = [];





      // Get each component of the address from the place details,
      // and then fill-in the corresponding field on the form.

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < places[0].address_components.length; i++) {
        const addressType = places[0].address_components[i].types[0];
        if (this.componentForm[addressType]) {
          console.log(places[0].address_components[i][this.componentForm[addressType]]);

          if (addressType === 'postal_code') {
            this.address.pincode = places[0].address_components[i][this.componentForm[addressType]] || '';

          }


          if (addressType === 'country') {
            this.address.country = places[0].address_components[i][this.componentForm[addressType]] || '';

          }



          if (addressType === 'administrative_area_level_1') {
            this.address.state = places[0].address_components[i][this.componentForm[addressType]] || '';

          }



          if (addressType === 'locality') {
            this.address.distic = places[0].address_components[i][this.componentForm[addressType]] || '';

          }

          if (addressType === 'street_number') {
            this.address.address = places[0].address_components[i][this.componentForm[addressType]] || '';

          }
          if (addressType === 'route') {
            this.address.landMark = places[0].address_components[i][this.componentForm[addressType]] || '';

          }

          if (addressType === 'neighborhood') {
            this.address.landMark += '  ' + places[0].address_components[i][this.componentForm[addressType]] || '';

          }
          if (addressType === 'sublocality_level_3') {
            this.address.locality = places[0].address_components[i][this.componentForm[addressType]] || '';

          }



          if (addressType === 'sublocality_level_2') {
            this.address.locality += '  ' + places[0].address_components[i][this.componentForm[addressType]];

          }



          if (addressType === 'sublocality_level_1') {
            this.address.city = places[0].address_components[i][this.componentForm[addressType]];

          }

        }
      }
      this.address.address = places[0].vicinity;

      console.log(this.address);
      console.log(this.restaurantDetails);
      // For each place, get the icon, name and location.


      this.setMarkerOnMap();
      google.maps.event.addListener(this.map, 'bounds_changed', () => {
        this.bounds = this.map.getBounds();
        searchBox.setBounds(this.bounds);
      });


      this.changeMapHieght('50vh');

    });


  }


  setMarkerOnMap() {
    this.bounds = new google.maps.LatLngBounds();

    let infoWindow: any;


    const marker = new google.maps.Marker({
      map: this.map,
      title: this.restaurantDetails.name,
      position: this.restaurantDetails.geometry.location,
      draggable: true,
    });
    marker.setAnimation(4);
    this.markers.push(marker);
    infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.setContent(marker.title);
      infoWindow.open(this.map, marker);
    });
    google.maps.event.addListener(marker, 'mouseover', () => {
      // infoWindow.setContent(marker.title);
      console.log('mouseover');

      // infoWindow.open(this.map, marker);
    });
    google.maps.event.addListener(marker, 'dragend', (event) => {
      // infoWindow.setContent(marker.title);
      console.log('dragend');
      console.log(event);
      console.log(event.latLng.lat());
      console.log(event.latLng.lng());
      console.log(event.latLng);
      console.log(marker.getPosition());


      // infoWindow.open(this.map, marker);
    });
    google.maps.event.addListener(marker, 'dragstart', () => {
      // infoWindow.setContent(marker.title);
      console.log('dragstart');

      // infoWindow.open(this.map, marker);
    });
    this.bounds.extend(this.restaurantDetails.geometry.location);

    this.map.fitBounds(this.bounds);
    this.map.setZoom(17);
  }

  changeMapHieght(val) {

    (document.getElementById('map') as HTMLInputElement).style.height = val;

  }

}
