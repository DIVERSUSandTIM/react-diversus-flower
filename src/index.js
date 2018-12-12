import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

export default class DiversusFlower extends React.Component {
	constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
  	const {title} = this.props;
    return (
      <h1>{title}</h1>
    );
  }
}

// Proptypes
DiversusFlower.propTypes = {
  title: PropTypes.string.isRequired
};

// Default proptypes
DiversusFlower.defaultProps = {
  title: "Hello"
};
