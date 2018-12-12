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
        <svg height="500" width="500">
          <circle cx="50%" cy="50%" r="25%" stroke="black" stroke-width="3" fill="red" />
          <circle cx="25%" cy="25%" r="10%" stroke="black" stroke-width="3" fill="red" />
          <circle cx="75%" cy="25%" r="10%" stroke="black" stroke-width="3" fill="red" />
          <circle cx="75%" cy="75%" r="10%" stroke="black" stroke-width="3" fill="red" />
          <circle cx="25%" cy="75%" r="10%" stroke="black" stroke-width="3" fill="red" />
        </svg>
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
