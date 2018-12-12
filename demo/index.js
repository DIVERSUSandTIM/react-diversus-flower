import React from 'react';
import ReactDOM from 'react-dom';
import DiversusFlower from '../dist/index';

class App extends React.Component {
	render() {
		return <DiversusFlower title="Pretty Flower"/>;
	}
}

ReactDOM.render(<App/>, document.querySelector('#root'));
