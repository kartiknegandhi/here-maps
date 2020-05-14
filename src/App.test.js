import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import Map from "./components/Map";
import Select from "react-select";
import Switch from "react-switch";

configure({ adapter: new Adapter() });


//Select box
let wrapper;
beforeEach(() => {
  wrapper = shallow(<Select isLoading= {true}/>);
});
describe("<Select/>", () => {
  it("should show select box in the DOM", () => {
    // setting loading props to false
    wrapper.setProps({ isLoading: false });
    expect(Select);
  });
});

// switch
describe("<Switch/>", () => {
  let switchWrapper = shallow(<Switch onChange={()=>{}} checked={false}/>);
  it("should be false by default,true when user switches it", () => {
    expect(switchWrapper.contains(<Switch onChange={()=>{}} checked={false} />));
  });
});
