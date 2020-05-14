import * as React from 'react';
import Mcd from "../assets/mcd.png"
import Kfc from "../assets/kfc.png"
import Burgerking from "../assets/bk.png"
import Subway from "../assets/subway.png"

// Initializing map variables globally
let map = null;
let H = null;
let clusteringLayer = null;
let clusteredDataProvider = null;
let ui = null;

function getBubbleContent(data, showCustomIcons) {
  if (showCustomIcons) {
    // when non clustered view, show name,lat, lng details 
    return `<div style="font-size : 9px ; width: 100px;display:flex; flex-direction:column"><a style="flex:1">Name: ${data.name}</a><a style="flex:1"> Lat: ${data.lat}</a><a  style="flex:1"> Lng: ${data.lng}</a></div>`;
  }
  // when clustered view, show alert to switch to custom icons view 
  return `<a style="font-size : 10px; width: 100px;display:flex;">Please switch to custom icons view to view details of marker</a>`
}
function returnIcons(name) {
  //function to return icons based on name selected
  switch (name) {
    case "Burger King":
      return Burgerking;
    case "McDonalds":
      return Mcd;
    case "KFC":
      return Kfc;
    case "Subway":
      return Subway;
    default:
      break;
  }
}
var CUSTOM_THEME = {
  getClusterPresentation: function (cluster) {
    // Get random DataPoint from our cluster
    var randomDataPoint = getRandomDataPoint(cluster),
      // Get a reference to data object that DataPoint holds
      data = randomDataPoint.getData();

    // Create a marker from a random point in the cluster
    var clusterMarker = new H.map.Marker(cluster.getPosition(), {
      icon: new H.map.Icon(returnIcons(data.name), {
        size: { w: 20, h: 20 },
        anchor: { x: 25, y: 25 }
      }),

      // Set min/max zoom with values from the cluster,
      // otherwise clusters will be shown at all zoom levels:
      min: cluster.getMinZoom(),
      max: cluster.getMaxZoom()
    });

    // Link data from the random point from the cluster to the marker,
    // to make it accessible inside onMarkerClick
    clusterMarker.setData(data);

    return clusterMarker;
  },
  getNoisePresentation: function (noisePoint) {
    // Get a reference to data object our noise points
    var data = noisePoint.getData(),
      // Create a marker for the noisePoint
      noiseMarker = new H.map.Marker(noisePoint.getPosition(), {
        // Use min zoom from a noise point
        // to show it correctly at certain zoom levels:
        min: noisePoint.getMinZoom(),
        icon: new H.map.Icon(returnIcons(data.name), {
          size: { w: 15, h: 15 },
          anchor: { x: 10, y: 10 }
        })
      });

    // Link a data from the point to the marker
    // to make it accessible inside onMarkerClick
    noiseMarker.setData(data);

    return noiseMarker;
  }
};


// Helper function for getting a random point from a cluster object
function getRandomDataPoint(cluster) {
  var dataPoints = [];

  // Iterate through all points which fall into the cluster and store references to them
  cluster.forEachDataPoint(dataPoints.push.bind(dataPoints));

  // Randomly pick an index from [0, dataPoints.length) range
  // Note how we use bitwise OR ("|") operator for that instead of Math.floor
  return dataPoints[Math.random() * dataPoints.length | 0];
}

function onMarkerClick(e, showCustomIcons) {

  // Get position of the "clicked" marker
  var position = e.target.getGeometry(),
    // Get the data associated with that marker
    data = e.target.getData(),
    // Merge default template with the data and get HTML
    bubbleContent = getBubbleContent(data, showCustomIcons),
    bubble = onMarkerClick.bubble;

  // For all markers create only one bubble, if not created yet
  bubble = new H.ui.InfoBubble(position, {
    content: bubbleContent
  });
  //Remove all bubbles and create a new bubble
  ui.getBubbles().forEach(bub => ui.removeBubble(bub));
  ui.addBubble(bubble);
  // Cache the bubble object
  onMarkerClick.bubble = bubble;

  // Move map's center to a clicked marker
  map.setCenter(position, true);
}
export default class Map extends React.Component {
  mapRef = React.createRef();
  state = {
    map: null
  };
  constructor(props) {
    super(props);


  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.dataPoints !== this.props.dataPoints || (nextProps.showCustomIcons !== this.props.showCustomIcons)) {

      this.startClustering(map, ui, nextProps.dataPoints, nextProps.showCustomIcons);
      setTimeout(() => {
        this.setState(map)

      }, 100);
    }
    return true
  }


  componentDidMount() {

    H = window.H;
    const platform = new H.service.Platform({
      apikey: "EGk_R4FchaVGWR_bRawSlEsESiEfIl2zA7xyCLoGVJc"
    });

    const defaultLayers = platform.createDefaultLayers();

    map = new H.Map(
      this.mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: this.props.center,
        zoom: 8,
        pixelRatio: window.devicePixelRatio || 1
      }
    );


    // add a resize listener to make sure that the map occupies the whole container
    window.addEventListener('resize', () => map.getViewPort().resize());
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    // This variable is unused and is present for explanatory purposes
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    // Create the default UI components to allow the user to interact with them
    // This variable is unused
    ui = H.ui.UI.createDefault(map, defaultLayers);
    this.startClustering(map, ui, this.props.dataPoints, this.props.showCustomIcons);

  }

  startClustering(map, ui, data, showCustomIcons) {
    // First we need to create an array of DataPoint objects,
    // for the ClusterProvider
    var dataPoints = data.map(function (item) {

      return new H.clustering.DataPoint(item.lat, item.lng, null, item);

    });
    // Create a clustering provider with custom options for clusterizing the input
    clusteredDataProvider = new H.clustering.Provider(dataPoints, {
      clusteringOptions: {
        // Maximum radius of the neighbourhood
        eps: 32,
        // minimum weight of points required to form a cluster
        minWeight: 2
      }, theme: showCustomIcons ? CUSTOM_THEME : undefined

    });
    //remove previous infobubbles on icon theme change
    ui.getBubbles().forEach(bub => ui.removeBubble(bub));
    // Note that we attach the event listener to the cluster provider, and not to
    // the individual markers
    clusteredDataProvider.addEventListener('tap', (e) => onMarkerClick(e, showCustomIcons));
    map.removeLayer(clusteringLayer);

    // Create a layer tha will consume objects from our clustering provider
    clusteringLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);

    // To make objects from clustering provder visible,
    // we need to add our layer to the map
    if (dataPoints.length > 0) {
      map.addLayer(clusteringLayer);

    }

  }

  componentWillUnmount() {
    this.state.map.dispose();
  }

  render() {
    return <div ref={this.mapRef} style={{ height: "90vh" }} />;
  }
}
