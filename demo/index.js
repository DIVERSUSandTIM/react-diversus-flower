import React from 'react';
import ReactDOM from 'react-dom';
import DiversusFlower from '../dist/index';

class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('call me useless will you?');
  }
  whoDad(kiddo) {
    this.bambino = kiddo;
    return this;
  }

  addRandomPetal() {
    let args = {relPos: Math.random(), key: Math.random()};
    //console.log("args",args);
    this.bambino.addPetal(args);
  }
  toggleRandomStream() {
    this.bambino.toggleRandomStream();
  }
  // https://stackoverflow.com/questions/38394015/how-to-pass-data-from-child-component-to-its-parent-in-reactjs
  render() {
    window.myBogusApp = this;
    return (
      <div>
        <button onClick={this.addRandomPetal.bind(this)}>add random</button>
        <input type="checkbox" onChange={this.toggleRandomStream.bind(this)}/>
        <DiversusFlower title="Pretty Flower"
           whosYourDaddy={this.whoDad.bind(this)}/>
      </div>
    )
  }
}

ReactDOM.render(<App/>, document.querySelector('#root'));
