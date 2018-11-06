import React, { Component } from 'react';
import rushMeLogo from './rushMeLogo.png'
import './App.css';
import {returnCorrectPassword, returnCorrectUsername} from './rushMePasswords.js';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const options = [
  { value: 'one', label: 'LXA' },
  { value: 'two', label: 'CHP'}
];

const defaultOption = options[0];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
        password : '',
        uname : '',
        page : 'password'
    };


    this.updatePassword = this.updatePassword.bind(this);
    this.updateUname = this.updateUname.bind(this);
    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
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
            Password: <input type="password" value={this.state.password}  onChange={this.updatePassword} ></input><br/>
            <input type="submit" value="Submit " />
          </label>
          </form>
          <br/>
          
        </header>
      </div>
    );
    } else {
      return( 
      <div className="App">
        <header className="App-header">
          <h1>
            RushMe Admin Portal Edit Page
          </h1>
        </header>
        <Dropdown options={options} onChange={this._onSelect} value={defaultOption} placeholder="Select an option" />
      </div> 
    
    );
    }
  }
}

export default App;
