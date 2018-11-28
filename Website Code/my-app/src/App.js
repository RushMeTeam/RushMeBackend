import React, { Component } from 'react';
import rushMeLogo from './rushMeLogo.png'
import './App.css';
import {returnCorrectPassword, returnCorrectUsername, returnCorrectKey, returnCorrectSecret} from './rushMePasswords.js';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
var AWS = require('aws-sdk');


const AWSKey = returnCorrectKey();
const AWSSecretKey = returnCorrectSecret();

AWS.config.update({
  region: "us-east-2",
  accessKeyId: AWSKey, 
  secretAccessKey: AWSSecretKey
});

var docClient = new AWS.DynamoDB.DocumentClient();

const defaultOption = {label : 'Please Select a Fraternity to Edit'};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
        password : '',
        uname : '',
        page : 'password',
        selectedFraternity : 'NONE',
        fratData : [{}],
        newAddress : '',
        newChapter : '',
        newCoordinates : '',
        newDescription : '',
        newMemberCount : ''
    };


    this.updatePassword = this.updatePassword.bind(this);
    this.updateUname = this.updateUname.bind(this);
    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
    this.getFraternityData = this.getFraternityData.bind(this);
    this.fratSelected = this.fratSelected.bind(this);
    this.getFraternityObject = this.getFraternityObject.bind(this);
    this.updateNewCoordinates = this.updateNewCoordinates.bind(this);
    this.handleFratUpdateSubmit = this.handleFratUpdateSubmit.bind(this);
    this.handleAddressSubmit = this.handleAddressSubmit.bind(this);
    this.handleChapterSubmit = this.handleChapterSubmit.bind(this);
    this.handleCoordinatesSubmit = this.handleCoordinatesSubmit.bind(this);
    this.handleDescriptionSubmit = this.handleCoordinatesSubmit.bind(this);
    this.handleMemberCountSubmit = this.handleMemberCountSubmit.bind(this);
    this.updateNewAddress = this.updateNewAddress.bind(this);
    this.updateNewChapter = this.updateNewChapter.bind(this);
    this.updateNewCoordinates = this.updateNewCoordinates.bind(this);
    this.updateNewDescription = this.updateNewDescription.bind(this);
    this.updateNewMemberCount = this.updateNewMemberCount.bind(this);
    this.getFraternityData();
  }
  readTextFile(file)
  {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status === 0)
            {
                var allText = rawFile.responseText;
                console.log(allText);
            }
        }
    }
    rawFile.send(null);
  }
  
  
  getFraternityData(){
    var params = {
      TableName: "FraternityInfo"
    };
    if (params != null){
      console.log(params);
    }
    
    docClient.scan(params,(err, data) => {
      if(err){
        console.log(err);
      } else{
        var items = data.Items.sort(function(a,b) {
          var keyA = a.namekey;
          var keyB = b.namekey;
          if(keyA < keyB) return -1;
          if(keyA > keyB) return 1;
          return 0;
        });
        for(let i = 0; i < items.length; i++) {
          items[i].label = items[i].namekey;
        }
        this.setState({fratData : items})
        console.log(data.Items);
      }
    });
  }
  
  handlePasswordSubmit(event){
    if ((this.state.password === returnCorrectPassword()) && (this.state.uname === returnCorrectUsername())){
      console.log("Correct input");
      this.setState({page : 'main'});
    }
    event.preventDefault();
  }
  
  updatePassword(event){
    this.setState({password : event.target.value});
  }
  
  updateUname(event){
    this.setState({uname : event.target.value});
  }
  updateNewCoordinates(event){
    this.setState({coordinates : event.target.value});
  }
  
  fratSelected(event) {
    console.log(event.label);
    this.setState({ page : 'fraternityEdit' });
    this.setState({ selectedFraternity : event.label });
    console.log(this.state.fratSelected);
    
  }
  
  getFraternityObject(){
    let namekey = this.state.selectedFraternity;
    let data = this.state.fratData;
    let desiredFraternityInfo = null;
    for(let i = 0; i < data.length; i++) {
      //Namekey matches, set return value and break.
      if (data[i].namekey === namekey) {
        desiredFraternityInfo = data[i];
        break;
      }
    }
    return desiredFraternityInfo;
  }
  
  handleFratUpdateSubmit(field, value) {
    //TODO: Implement
    console.log("FIELD: " + field + "\nVALUE: " + value);
  }
  
  handleAddressSubmit() {
    this.handleFratUpdateSubmit('address', this.state.newAddress);
  }
  
  handleChapterSubmit() {
    this.handleFratUpdateSubmit('chapter', this.state.newChapter);
  }
  
  handleCoordinatesSubmit() {
    this.handleFratUpdateSubmit('coordinates', this.state.newCoordinates);
  }
  
  handleDescriptionSubmit() {
    this.handleFratUpdateSubmit('description', this.state.newDescription);
  }
  
  handleMemberCountSubmit() {
    this.handleFratUpdateSubmit('member_count', this.state.newMemberCount);
  }
  
  updateNewAddress(event) {
    this.setState({newAddress : event.target.value});
  }
  
  updateNewChapter(event) {
    this.setState({newChapter : event.target.value});
  }
  
  updateNewCoordinates(event) {
    this.setState({newCoordinates : event.target.value});
  }
  
  updateNewDescription(event) {
    this.setState({newDescription : event.target.value});
  }
  
  updateNewMemberCount(event) {
    this.setState({newMemberCount : event.target.value});
  }
  
  render() {
    // Upon loading the page initially load the password portion.
    if(this.state.page === 'password') {
      return (
      <div className="App">
        <header className="App-header">
          <img src={rushMeLogo} className="App-logo" alt="Logo" />
          <h1>
            RushMe Admin Portal
          </h1>
        <form onSubmit={this.handlePasswordSubmit}>
          <label>
            Username: <input type="text" value={this.state.uname}  onChange={this.updateUname}></input><br/>
            Password:  <input type="password" value={this.state.password}  onChange={this.updatePassword} ></input><br/>
            <input type="submit" value="Submit " />
          </label>
        </form>
        </header>
      </div>
    );
    } else if (this.state.page === 'main') {
      return(
      <div className="App">
        <h1>
          RushMe Admin Portal Edit Page
        </h1>
        <Dropdown options={this.state.fratData} onChange={this.fratSelected} value={defaultOption} placeholder="Select an option" />
      </div> 
    
    );
    } else if (this.state.page === 'fraternityEdit') {
      var data = this.getFraternityObject();
      return(
      <div className="App">
        <h1>
          RushMe Admin Portal
        </h1>
        <h1>
          You are editing {this.state.selectedFraternity}'s Fraternity Data
          Submit any field to update it.
        </h1>
        <h3>
          Current Chapter(Alpha Chapter of LCA for example):
        </h3>
        <form onSubmit={this.handleChapterSubmit}>
          <label>
            <input type="text" value={data.chapter}  onChange={this.updateNewChapter}></input><br/>
            <input type="submit" value="Submit " />
          </label>
        </form>
        <h3>
          Current Member Count:
        </h3>
        <form onSubmit={this.handleMemberCountSubmit}>
          <label>
            <input type="text" value={data.member_count}  onChange={this.updateNewMemberCount}></input><br/>
            <input type="submit" value="Submit " />
          </label>
        </form>
        <h3>
          Current Address:
        </h3>
        <form onSubmit={this.handleAddressSubmit}>
          <label>
            <input type="text" value={data.address}  onChange={this.updateNewAddress}></input><br/>
            <input type="submit" value="Submit " />
          </label>
        </form>
        <h3>
          Current Description: 
        </h3>
        <form onSubmit={this.handleDescriptionSubmit}>
          <label>
            <textarea name="text" rows="10" cols="150" wrap="soft" value={data.description} onChange={this.updateNewDescription}> </textarea> <br/>
            <input type="submit" value="Submit " />
          </label>
        </form>
        <h3>
          Current Coordinates 
          (form lattitude,longitude): 
        </h3>
        <form onSubmit={this.handleCoordinatesSubmit}>
          <label>
            <input type="text" style={{width:'750px'}} value={data.coordinates}  onChange={this.updateNewCoordinates}></input><br/>
            <input type="submit" value="Submit " />
          </label>
        </form>
      </div> 
    
    );
    }
  }
}

export default App;
