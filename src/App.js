import React, { Component } from "react";
import logo from './logo.svg';
import './App.css';
import Map from './components/Map';
import * as d3 from 'd3';
import data from "./dataSet/poiData.csv";
import Select from 'react-select'
import Switch from "react-switch";

let geoData = [];
const defaultOptions = [{ "label": "Burger King", "value": "Burger King" }, { "label": "McDonalds", "value": "McDonalds" }, { "label": "KFC", "value": "KFC" }, { "label": "Subway", "value": "Subway" }]

class App extends Component {
  constructor(props) {
    super(props)
    // centering Munich, Germany
    this.center = { lat: 48.1351, lng: 11.5820 }
    this.state = {
      poiGeoData: [],
      isDataLoaded: false,
      checked: false,
      loading: false

    };
  }


  filterColors = (inputValue) => {
    return this.geoDataOptionsList.filter(i =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterColors(inputValue));
    }, 1000);
  };
  async componentDidMount() {
    // loading the csv and parsing it
    await d3.csv(data, function (data) {
      geoData.push(data);
    });
    this.setState({ poiGeoData: geoData })
    let distinctOptions = await [... new Set(geoData.map(data => data["name"] = data.name))]
    this.geoDataOptionsList = [];
    distinctOptions.map((data) => {
      let obj = {}
      obj["label"] = data;
      obj["value"] = data;
      this.geoDataOptionsList.push(obj);
      this.setState({ isDataLoaded: true })
    })
    console.log("OPTIONSSS", JSON.stringify(this.geoDataOptionsList))
    this.showLoader(4000)

  }
  handleOnChange = async (val) => {
    this.showLoader(3000)
    console.log("handleOnChangeeeee", val)
    if (val && val.length > 0) {
      let filteredData = [];
      let final = [];
      val.map(async (el) => {
        console.log("ellll", el)

        let filtered = await geoData.filter(i =>
          i.name.toLowerCase().includes(el.label.toLowerCase())
        );

        filteredData = filteredData.concat(filtered)
      })
      setTimeout(() => {

        this.setState({ poiGeoData: filteredData })
      }, 100);

    } else if (val == null || val.length == 0) {
      this.setState({ poiGeoData: [] })


    }
  }



  handleSwitchChange(checked) {
    this.showLoader(3000)

    this.setState({ checked });
  }
  // generic function to show and hide loader
  showLoader(time) {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false })
    }, time);
  }

  render() {
    const { isDataLoaded, poiGeoData } = this.state
    return (
      isDataLoaded && (<div style={{
        padding: '10px',
        alignItems: "center", textAlign: "center",
        justifyContent: "center"
      }} >
        <div >
          <a style={{ fontWeight: "bold" }}>FAST FOOD RESTAURANTS APP USING HERE MAPS</a>

        </div>
        <div style={{ display: "flex", flexDirection: "row", alignSelf: "center" }}>

          <div style={{ width: "600px", flexDirection: "row", margin: "10px 0 10px 0" }}>
            {/* using react select in multi select config  */}
            <Select
              defaultValue={defaultOptions}
              isMulti
              isLoading={this.state.loading}
              options={this.geoDataOptionsList}
              onChange={this.handleOnChange}
              placeholder="Click Dropdown or type here to find Fast Food Restaurants In Germany"

            />

          </div>
          <div style={{ alignItems: "center", display: "flex", flex: 1, textAlign: "center", alignItems: "center", justifyContent: "center" }}>
            {this.state.loading && <a style={{ alignSelf: "center" }}>
              Loading data, please wait...
              </a>}
          </div>
          <div   style={{ display: "flex", flex: 1, justifyContent: "center", alignSelf: "center", alignItems: "center" }}>
            <a style={{ textAlign: "center", margin: "0 10px 0 10px" }}>Custom Icons</a>
            <Switch  className="switchClass" onChange={(checked) => this.handleSwitchChange(checked)} checked={this.state.checked} />
          </div>
        </div>
        <div style={{
          margin: "5px", boxShadow: "1px 3px 1px #9E9E9E"
        }}>
          {/* displaying the map component */}
          <Map center={this.center} dataPoints={poiGeoData} showCustomIcons={this.state.checked}></Map>
        </div>
      </div>)
    );
  }

}
export default App;

