var React = require('react'),
	GMaps = require('react-google-maps');

var StaticExample = React.createClass({
	render: function() {
		return <GMaps.StaticMapWidget latitude={37.4847771} longitude={-122.1485497} width={640} />;
	}
});

var MapExample = React.createClass({
	render: function() {
		var poi = [{
			latitude: 37.4847772,
			longitude: -122.1485498,
			title: "Coffee Machine",
			icon: "http://icons.iconarchive.com/icons/pixture/coffee/32/CoffeeCup-icon.png"
		}];
		return <GMaps.MapWidget latitude={37.4847771} longitude={-122.1485497} width={640} points={poi} />;
	}
});

var AutocompleteExample = React.createClass({
	render: function() {
		var cb = function(latlon, distance) {
			var v = {
				latlon: latlon,
				distance: distance
			};
			document.getElementById('autocomplete-result').innerHTML = 'Place changed to<br/><code>' + JSON.stringify(v) + '</code>';
		};
		return <GMaps.AutocompleteField onPlaceChanged={cb}/>;
	},
});

React.render(<StaticExample />, document.getElementById('StaticExample'));
React.render(<MapExample />, document.getElementById('MapExample'));
React.render(<AutocompleteExample />, document.getElementById('AutocompleteExample'));
