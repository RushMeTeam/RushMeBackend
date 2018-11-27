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

const options = [
  { value: 'one', label: 'LXA' },
  { value: 'two', label: 'CHP'}
];

var docClient = new AWS.DynamoDB.DocumentClient();

const defaultOption = options[0];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
        password : '',
        uname : '',
        page : 'password',
        fratData : [{}]
    };


    this.updatePassword = this.updatePassword.bind(this);
    this.updateUname = this.updateUname.bind(this);
    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
    this.getFraternityData = this.getFraternityData.bind(this);
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
        var items = data.Items;
        for(let i = 0; i < items.length; i++) {
          items[i].label = items[i].namekey;
        }
        this.setState({fratData : data.Items})
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
    } else {
      console.log("HERE:");
      console.log(this.state.fratData);
      return(
      <div className="App">
        <h1>
          RushMe Admin Portal Edit Page
        </h1>
        <Dropdown options={this.state.fratData} onChange={this._onSelect} value={defaultOption} placeholder="Select an option" />
      </div> 
    
    );
    }
  }
}

export default App;
