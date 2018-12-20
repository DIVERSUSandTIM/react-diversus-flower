import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';
//import Ball from './Ball';
//import Petal from './Petal';

export function petalRelPosToFrondLoc(relPos, numberOfFronds) {
  let idx = getBinIdx(relPos, numberOfFronds);
  return [idx, getBinMid(idx, numberOfFronds)];
}
function getBinIdx(relPos, numberOfFronds) {
  return ( numberOfFronds * (Math.floor((relPos * numberOfFronds))/numberOfFronds));
}
function getBinMid(idx, numberOfFronds) {
  return ((1 + idx)/numberOfFronds) - (1/(2*numberOfFronds));
}
function getAngle(relPos) {
  return (2 * Math.PI) * relPos - Math.PI/2;
}
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
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
      lines.push(<line x2={x} y2={y} key={'ray'+i}/>)
      i = i + inc;
    }
    lines.push((<line x1={-100} y1={-100} x2={100} y2={100} stroke="red" key="tlbr"/>));
    lines.push((<line x1={100} y1={-100} x2={-100} y2={100} stroke="red" key="trbl"/>));
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
  rays: PropTypes.number.isRequired,
  rayLength: PropTypes.number.isRequired,
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
    /*
        r = (R * sin(theta/2) /(1 - sin(theta/2))
    */
    let theta = (Math.PI*2)/this.flower.props.numberOfFronds,
        st2 = Math.sin(theta/2),
        R = this.flower.state.centralRadius,
        r = ((R * st2) / (1 - st2));
    return r;
  }
  componentWillMount() {
    // https://developmentarc.gitbooks.io/react-indepth/content/life_cycle/birth/premounting_with_componentwillmount.html
    let centralRadius = this.flower.state.centralRadius  // the radius of the central circle
        , angle = getAngle(this.props.relPos)
        , petalRadius = this.calcPetalRadius()
        , deltaState = {
          petalRadius: petalRadius
          , cx: (Math.cos(angle) * (centralRadius + petalRadius))
          , cy: (Math.sin(angle) * (centralRadius + petalRadius))};
    this.setState(deltaState);
  }
  render() {
    const petalOpacity = this.flower.props.petalOpacity;
    const {fill} = this.props;
    const {cx, cy, centralRadius, petalRadius} = this.state;
    return (
      <g strokeWidth="1" stroke="black" x1="0" y1="0" fontSize="5px">
        <line x2={cx} y2={cy} stroke="none"/>
        <circle cx={cx} cy={cy} r={petalRadius} stroke="black"
           opacity={petalOpacity} fill={fill}/>
        <text stroke="none" fill="white"
           textAnchor="middle" alignmentBaseline="middle"
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

class Heir extends React.Component {
  // <SomeHeirSubclass whosYourDaddy={this.whoDad.bind(this) />
  constructor(props) {
    super(props);
    if (props.whosYourDaddy) {
      this.daddy = props.whosYourDaddy(this)
    }
  }
}


const divStyle = {
  'height': '500px',
  'width': '500px'
}

export class DiversusFlower extends Heir {
  constructor(props) {
    super(props);
    this.state = {
      centralRadius: 50,
      fronds: [],
      petals: []
    };
  }
  whoDad(aFrond) { // Fronds call this to know their Flower
    // Register Frond (aFrond) on their DiversusFlower (this) here, if needed
    return this;
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
    interval = interval || 100;
    console.log('startRandomStream');
    let dis = this;
    this.randomStreamTimer = setInterval( function(){dis.addRandomPetal()}, interval)
    this.addRandomPetal(); // run one now!
  }
  stopRandomStream(){
    if (this.randomStreamTimer) {
      clearInterval(this.randomStreamTimer);
      delete this.randomStreamTimer;
    } else {
      console.log('no randomStreamTimer found');
    }
  }
  addRandomPetal() {
    this.randomPetalCount = this.randomPetalCount || 0;
    this.randomPetalCount++;
    let args = {relPos: Math.random(), key: Math.random(), sortKey: Math.random(), fillColor: getRandomColor()};
    //console.log("args",args);
    this.addPetal(args);
    if (this.randomPetalCount > this.props.maxRandomPetalCount) {
      this.stopRandomStream();
    }
  }
  getOrCreateFrond(relPos) {
    let idx = getBinIdx(relPos, this.props.numberOfFronds);
    let frondRelPos = getBinMid(idx, this.props.numberOfFronds);
    return this.state.fronds[idx] || {key: idx, relPos: frondRelPos, petals: []};
  }
  addPetal(args) {
    let idx = getBinIdx(args.relPos, this.props.numberOfFronds);
    let frondRelPos = getBinMid(idx, this.props.numberOfFronds);
    let aFrond = this.state.fronds[idx] || {key: idx, relPos: frondRelPos, petals: []};
    aFrond.petals.push(args);
    this.state.fronds[idx] = aFrond;
    this.setState({fronds: this.state.fronds});
    //console.log(JSON.stringify(this.state).length, JSON.stringify(aFrond))
  }
  renderFronds() {
    let retval = [];
    for (let frondIdx = 0; frondIdx < this.state.fronds.length; frondIdx++) {
      let aFrond = this.state.fronds[frondIdx];
      if (!aFrond) {
        continue;
      }
      for (let petalIdx = 0; petalIdx < aFrond.petals.length; petalIdx++) {
        let {key, relPos, fillColor} = aFrond.petals[petalIdx];
        //console.log("<Petal>", key, relPos);
        if (typeof key == 'undefined') throw new Error('no key');
        retval.push((<Petal relPos={aFrond.relPos} key={key}
                     fill={fillColor} flower={this}/>));
      }
    }
    return retval;
  }
  renderRingOfPetals() {
    // https://en.wikipedia.org/wiki/Malfatti_circles
    // https://math.stackexchange.com/questions/1407779/arranging-circles-around-a-circle
    // http://www.packomania.com/
    let retval = []
    let max = this.props.numberOfFronds;
    for (let i = 0; i < max; i++) {
      retval.push((<Petal relPos={i/max} key={i}
                       fill="purple" flower={this}/>));
    }
    return retval;
  }
  XXXrenderPetals() {
    let retval = [];
    for (let i = 0; i < this.state.petals.length; i++) {
      let {key, relPos} = this.state.petals[i];
      retval.push((<Petal relPos={relPos} key={key}
                       fill="yellow" flower={this}/>));
    }
    return retval;
  }

  /*
    The use of generators for rendering petals would be clean but...
      https://github.com/babel/babel-loader/issues/484
    this issue is popping up and I have not tried the fix.

  *renderGen(){
    if (!this.state.renderedGen) {
      this.state.renderedGen = true
      yield (<Petal relPos={Math.random()} />);
    }
  }

    This is how to invoke it in render() below....
          {[...this.renderGen()]}
   */
  // https://nvbn.github.io/2017/03/14/react-generators/
  componentWillMount() {
    // https://developmentarc.gitbooks.io/react-indepth/content/life_cycle/birth/premounting_with_componentwillmount.html
    /*
      Prepare the initial state of the flower, here doing whatever calcs
      should preceed render() and follow constructor()
    */
    let flowerMinDimension = 100; // TODO get this from the parent somehow?
    this.setState({
      centralRadius: this.props.proportionOfCenter  * flowerMinDimension
    });
  }
  componentDidMount() {
    if (this.props.demoMode) {
      this.startRandomStream()
    }
  }

  // https://codeburst.io/4-four-ways-to-style-react-components-ac6f323da822
  // https://www.sarasoueidan.com/blog/svg-coordinate-systems/
  //               {this.renderRingOfPetals()}
  //             {this.renderPetals()}
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
            <circle cx="0" cy="0" r={this.state.centralRadius}
               stroke="black" strokeWidth="1" fill="red"
               onClick={this.toggleRandomStream.bind(this)}/>
            {this.renderFronds()}
          </g>
        </svg>
      </div>
    );
  }
}

DiversusFlower.propTypes = {
  title: PropTypes.string.isRequired,
  numberOfFronds: PropTypes.number.isRequired,
  proportionOfCenter: PropTypes.number.isRequired,
  reticleRays: PropTypes.number,
  reticleRayLength: PropTypes.number,
  petalOpacity: PropTypes.number,
  demoMode: PropTypes.bool
};

DiversusFlower.defaultProps = {
  title: "Hello",
  numberOfFronds: 11,
  proportionOfCenter: .33,
  reticleRays: 80,
  reticleRayLength: 90,
  petalOpacity: 0.80,
  maxRandomPetalCount: 50,
  demoMode: true
};
