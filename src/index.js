import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';
//import Ball from './Ball';
//import Petal from './Petal';

class Reticle extends React.Component {
  renderLines() {
    var x,y,
        rays = this.props.rays,
        rayLength = this.props.rayLength,
        lines = [],
        i = 0,
        twoPI = Math.PI * 2,
        inc = twoPI/rays;

    while (i < twoPI) {
      x = Math.cos(i) * rayLength;
      y = Math.sin(i) * rayLength;
      lines.push(<line x2={x} y2={y}/>)
      i = i + inc;
    }

    lines.push((<line x1={-100} y1={-100} x2={100} y2={100} stroke="red"/>));
    lines.push((<line x1={100} y1={-100} x2={-100} y2={100} stroke="red"/>));

    return lines;
  }
  render() {
    return (
      <g stroke={this.props.color} x1={this.props.cx} y1={this.props.cy} strokeWidth="1">
        {this.renderLines()}
      </g>
    )
  }
}

Reticle.propTypes = {
  rays: PropTypes.number.isRequried,
  rayLength: PropTypes.number.isRequried,
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired
}

Reticle.defaultProps = {
  rays: 24,
  rayLength: 250,
  cx: 0,
  cy: 0,
  color: 'lightgrey'
}

export class Petal extends React.Component {
  constructor(props) {
    super(props);
    this.flower = props.flower;
    if (!this.flower) {
      throw new Error('no flower for ',this.props.relPos)
    }
    // state:
    //   petalRadius: 12 // the radius (in pixels) of the petal
    //   angle: 0 // the angle of the center of this petal to its parent's center
    //   cx: 0.0  // the x coordinate of the center of this petal
    //   cy: 0.0  // the y coordinate of the center of this petal
  }
  calcPetalRadius() {
    let theta = (Math.PI*2)/this.flower.props.numberOfPrimaryPetals;
    let st2 = Math.sin(theta/2);
    let R = this.flower.state.centralRadius;
    /*
        r = (R * sin(theta/2) /(1 - sin(theta/2))
    */
    let r = ((R * st2) / (1 - st2));
    return r;
  }
  getAngle(relPos) {
    return (2 * Math.PI) * relPos - Math.PI/2;
  }
  componentWillMount() {
    // https://developmentarc.gitbooks.io/react-indepth/content/life_cycle/birth/premounting_with_componentwillmount.html
    let centralRadius = this.flower.state.centralRadius  // the radius of the central circle
        , angle = this.getAngle(this.props.relPos)
        , petalRadius = this.calcPetalRadius()
        , deltaState = {
          petalRadius: petalRadius
          , cx: (Math.cos(angle) * (centralRadius + petalRadius))
          , cy: (Math.sin(angle) * (centralRadius + petalRadius))};
    //console.log(deltaState);
    //console.log("this.state:",this.state);
    this.setState(deltaState);
  }

  render() {
    const {fill} = this.props;
    const {cx, cy, centralRadius, petalRadius} = this.state;

    console.log("render", this.state)
    //         <line x1=0 y1=0 x2={cx} y2={cy} strokeWidth="3" stroke="black" />
    return (
      <g strokeWidth="1" stroke="black" x1="0" y1="0" fontSize="5px">
        <line x2={cx} y2={cy} stroke="none"/>
        <circle cx={cx} cy={cy} r={petalRadius} stroke="black" fill={fill}/>
        <text stroke="none" fill="white"
           x={cx} y={cy}>{this.props.relPos.toString().substring(0,4)}</text>
      </g>
    )
  }
}

Petal.propTypes = {
  relPos: PropTypes.number.isRequired,
  key: PropTypes.string.isRequired,
  fill: PropTypes.string.isRequired,
  initialPriority: PropTypes.number.isRequired
};

Petal.defaultProps = {
  fill: 'orange',
  initialPriority: 1.0
};

const divStyle = {
  'height': '500px',
  'width': '500px'
}

export default class DiversusFlower extends React.Component {
  constructor(props) {
    super(props);
    this.state = {centralRadius: 50};
    if (props.whosYourDaddy) {
      this.daddy = props.whosYourDaddy(this)
    }
    this.petals = [];
  }

  toggleRandomStream() {
    if (this.randomStreamTimer) {
      console.log("TOGGLE randomStream off")
      this.stopRandomStream();
    } else {
      console.log("TOGGLE randomStream on")
      this.startRandomStream();
    }
  }
  startRandomStream(interval) {
    interval = interval || 800;
    console.log('startRandomStream');
    this.daddy.addRandomPetal(); // run one now!
    let daddy = this.daddy; // is this needed anymore?
    this.randomStreamTimer = setInterval( function(){daddy.addRandomPetal()}, interval)
  }
  stopRandomStream(){
    if (this.randomStreamTimer) {
      clearInterval(this.randomStreamTimer);
      delete this.randomStreamTimer;
    } else {
      alert('no randomStreamTimer found');
    }
  }

  addPetal(args) {
    this.petals.push((<Petal relPos={args.relPos} flower={this}/>));
    //this.forceUpdate();
  }
  renderRingOfPetals() {
    // https://en.wikipedia.org/wiki/Malfatti_circles
    // https://math.stackexchange.com/questions/1407779/arranging-circles-around-a-circle
    // http://www.packomania.com/
    let retval = []
    let max = this.props.numberOfPrimaryPetals;
    for (let i = 0; i < max; i++) {
      retval.push((<Petal relPos={i/max} fill="purple" flower={this}/>));
    }
    return retval;
  }
  renderPetals() {
    var retval = [];
    //for (let i = 0; i < this.petals.length; i++) {
    this.petals.forEach(function(args, i) {
      var {key, relPos} = args;
      retval.push((<Petal relPos={relPos} key={key} flower={this}/>));
      })
    return retval;
  }

  componentWillMount() {
    // https://developmentarc.gitbooks.io/react-indepth/content/life_cycle/birth/premounting_with_componentwillmount.html
    // prepare the initial state of the flower, here doing whatever calcs should preceed render() and follow constructor()
    console.log('componentWillMount()');
    let flowerMinDimension = 100; // TODO get this from the parent somehow?
    this.setState({
      centralRadius: this.props.proportionOfCenter  * flowerMinDimension
    });
  }

  // https://codeburst.io/4-four-ways-to-style-react-components-ac6f323da822
  // https://www.sarasoueidan.com/blog/svg-coordinate-systems/
  render() {
    //  transform="translate(250,250)"
    const {title} = this.props;
    window.zeFlower = this;
    return (
      <div  style={divStyle}>
        <svg height="100%" width="100%" viewBox="-100 -100 200 200" >
          <title>{title}</title>
          <g>
            <Reticle rayLength={this.props.reticleRayLength} rays={this.props.reticleRays}/>
            <circle cx="0" cy="0" r={this.state.centralRadius} stroke="black" strokeWidth="1" fill="red"
               onClick={this.toggleRandomStream.bind(this)}/>

            {this.renderRingOfPetals()}
            {this.renderPetals()}
          </g>
        </svg>
      </div>
    );
  }
}

/*
            <Petal relPos=".125" fill={'yellow'} flower={this}/>
            <Petal relPos=".25" fill={'yellow'} flower={this}/>
            <Petal relPos=".375" fill={'yellow'} flower={this}/>
            <Petal relPos=".50" fill={'yellow'} flower={this}/>
            <Petal relPos=".625" fill={'yellow'} flower={this}/>
            <Petal relPos=".75" fill={'yellow'} flower={this}/>
            <Petal relPos=".875" fill={'yellow'} flower={this}/>
            <Petal relPos="1.0" fill={'yellow'} flower={this}/>
            <Petal relPos=".58" flower={this}/>
*/

// Proptypes
DiversusFlower.propTypes = {
  title: PropTypes.string.isRequired,
  numberOfPrimaryPetals: PropTypes.number.isRequired,
  proportionOfCenter: PropTypes.number.isRequired,
  reticleRays: PropTypes.number.isRequired,
  reticleRayLength: PropTypes.number.isRequired
};

// Default proptypes
DiversusFlower.defaultProps = {
  title: "Hello",
  numberOfPrimaryPetals: 11,
  proportionOfCenter: .33,
  reticleRays: 80,
  reticleRayLength: 90
};
