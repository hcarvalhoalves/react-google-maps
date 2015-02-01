!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ReactGmaps=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/** @jsx React.DOM */
// use strict

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);


// Helper functions

function geometryToLatLon(geometry) {
  if (geometry && geometry.location) {
    var loc = geometry.location;
    return [loc.lat(), loc.lng()];
  }
  return null;
}

function latlonToGeometry(latlon) {
  var latlon = latlon ? latlon.split(',') : [null, null];
  return {k: latlon[0], A: latlon[1]};
}

// Convert a pair of coordinates to google.maps.LatLngBounds
function arrayToBounds(bounds) {
  return new google.maps.LatLngBounds(
    new google.maps.LatLng(this.props.bounds[0]),
    new google.maps.LatLng(this.props.bounds[1]));
}

// Get the raiuds of a google.maps.LatLngBounds
function radiusFromBounds(bounds) {
  center = bounds.getCenter();
  ne = bounds.getNorthEast();

  // r = radius of the earth in statute miles
  // var r = 3963.0;
  var r = 6378100.0;

  // Convert lat or lng from decimal degrees into radians (divide by 57.2958)
  var lat1 = center.lat() / 57.2958;
  var lon1 = center.lng() / 57.2958;
  var lat2 = ne.lat() / 57.2958;
  var lon2 = ne.lng() / 57.2958;

  // distance = circle radius from center to Northeast corner of bounds
  return r * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
}


// Components

var MapWidget = React.createClass({displayName: "MapWidget",
  getInitialState: function(){
    return {
      map : null,
      markers : []
    };
  },
  getDefaultProps: function(){
    return {
      latitude: 0,
      longitude: 0,
      zoom: 4,
      width: 400,
      height: 400,
      draggable: false,
      scrollwheel: false,
      zoomControl: true,
      scaleControl: false,
      panControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      overviewMapControl: false,
      points: []
    }
  },
  componentDidMount: function() {
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var mapOptions = {
      zoom: this.props.zoom,
      center: this.getCenter(),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      draggable: this.props.draggable,
      scrollwheel: this.props.scrollwheel,
      zoomControl: this.props.zoomControl,
      scaleControl: this.props.scaleControl,
      panControl: this.props.panControl,
      mapTypeControl: this.props.mapTypeControl,
      streetViewControl: this.props.streetViewControl,
      overviewMapControl: this.props.overviewMapControl
    };
    var map = new google.maps.Map(this.getDOMNode(), mapOptions);

    this.setState({map : map});
    this.updateMarkers(this.props.points);
    this.forceUpdate();
  },
  componentWillReceiveProps: function(props) {
    if(props.points) this.updateMarkers(props.points);
  },
  componentDidUpdate: function () {
    var map = this.state.map;
    var bounds = this.getBounds();
    if (bounds) {
      map.setCenter(bounds.getCenter()); //or use custom center
      if (this.props.points.length > 1)
        map.fitBounds(bounds);
      if (this.props.points.length == 1)
        map.setZoom(15);
    } else {
      map.setCenter(this.getCenter());
    }
  },
  getCenter: function() {
    var props = this.props;
    return new google.maps.LatLng(props.latitude, props.longitude);
  },
  getBounds: function() {
    var map = this.state.map;
    if (this.props.points.length > 0) {
      var bounds = new google.maps.LatLngBounds();
      this.props.points.forEach(function(p){
        bounds.extend(new google.maps.LatLng(p.latitude, p.longitude));
      });
      return bounds;
    }
  },
  updateMarkers: function(points){
    var markers = this.state.markers;
    var map = this.state.map;

    // remove everything
    markers.forEach(function(marker){
      marker.setMap(null);
    });

    this.state.markers = [];

    // add new markers
    points.forEach(function(point, i) {
      var location = new google.maps.LatLng(point.latitude, point.longitude);
      var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: point.title || null,
        icon: point.icon || null
      });
      // Listen for click event
      google.maps.event.addListener(marker, 'click', point.onClick || null);
      markers.push(marker);
    });

    this.setState({markers: markers});
  },
  render: function() {
    var style = {
        width: this.props.width,
        height: this.props.height
    }
    return (React.createElement("div", {style: style}));
  },
});

var StaticMapWidget = React.createClass({displayName: "StaticMapWidget",
  getDefaultProps: function() {
    return {
      latitude: 0,
      longitude: 0,
      zoom: 15,
      width: 300,
      height: 300,
      scale: 1
    };
  },
  render: function() {
    var params = [
      'center=' + this.props.latitude + ',' + this.props.longitude,
      'zoom=' + this.props.zoom,
      'size=' + this.props.width + 'x' + this.props.height,
      'scale=' + this.props.scale
    ].join('&')
    return this.transferPropsTo(React.createElement("img", {src: "http://maps.googleapis.com/maps/api/staticmap?" + params}));
  }
});

var AutocompleteField = React.createClass({displayName: "AutocompleteField",
  getInitialState: function(){
    return {
      valid: false,
      empty: true
    };
  },
  getDefaultProps: function() {
    return {
      types: ['geocode'],
      country: null,
      bounds: null,
      onPlaceChanged: function(){}
    }
  },
  componentDidMount: function(){
    var input = this.getDOMNode(),
        // https://developers.google.com/maps/documentation/javascript/places-autocomplete#add_autocomplete
        options = {
          types: this.props.types
        };

    if (this.props.bounds)
      options.bounds = arrayToBounds(this.props.bounds);
    if (this.props.country)
      options.componentRestrictions = {country: this.props.country};

    this.autocomplete = new google.maps.places.Autocomplete(input, options);
    google.maps.event.addListener(this.autocomplete, 'place_changed', this.handlePlaceChange);

    if (this.props.defaultPlace) {
      input.value = this.props.defaultPlace.name;
      this.props.onPlaceChanged(this.props.defaultPlace.location);
    }
  },
  handleInputChange: function(e){
    this.setState({
      empty: e.target.value.length == 0
    });
  },
  handlePlaceChange: function(){
    var place = this.autocomplete.getPlace(),
        empty = place.name.length == 0,
        valid = place && place.geometry,
        hasViewport = valid && place.geometry.viewport,
        latlon = valid ? geometryToLatLon(place.geometry) : null,
        distance = hasViewport ? radiusFromBounds(place.geometry.viewport) : null;
    this.setState({
      valid: valid,
      empty: empty
    }, function(){
      // trigger event if field is empty
      if (valid || empty) {
        this.props.onPlaceChanged(latlon, distance);
      }
    }.bind(this));
  },
  render: function(){
    return this.transferPropsTo(React.createElement("input", {type: "text", onChange: this.handleInputChange}));
  }
});

module.exports = {
	MapWidget: MapWidget,
	StaticMapWidget: StaticMapWidget,
	AutocompleteField: AutocompleteField
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});