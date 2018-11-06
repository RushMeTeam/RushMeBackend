import React, { Component } from 'react';
import rushMeLogo from './rushMeLogo.png'
import './App.css';
import {returnCorrectPassword, returnCorrectUsername} from './rushMePasswords.js';

class App extends Component {
  
  handlePasswordSubmit(){
    returnCorrectPassword();
    console.log(returnCorrectUsername());
  }
  
  render() {
    this.handlePasswordSubmit();
    return (
      <div className="App">
        <header className="App-header">
          <img src={rushMeLogo} className="App-logo" alt="Logo" />
          <h1>
            RushMe Admin Portal
          </h1>
          <form>
            Username: <input type="text" name="username"></input><br/>
            Password: <input type="text" name="password"></input><br/>
          </form>
          <br/>
          <button onClick={this.handlePasswordSubmit()}>
            Submit
          </button>
        </header>
      </div>
    );
  }
}

export default App;
