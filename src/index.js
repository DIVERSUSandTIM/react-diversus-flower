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
function calcRadiusOfPackedCircles(centralRadius, numPacked) {
  /*
    r = (R * sin(theta/2) /(1 - sin(theta/2))
  */
  let theta = (Math.PI*2)/numPacked,
      st2 = Math.sin(theta/2),
      R = centralRadius,
      r = ((R * st2) / (1 - st2));
  return r;
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
    if (!this.props.flower) {
      throw new Error('no flower for ',this.props.relPos)
    }
    // state:
    //   petalRadius: 12 // the radius (in pixels) of the petal
    //   angle: 0 // the angle of the center of this petal to its parent's center
    //   cx: 0.0  // the x coordinate of the center of this petal
    //   cy: 0.0  // the y coordinate of the center of this petal
  }
  componentWillMount() {
    // https://developmentarc.gitbooks.io/react-indepth/content/life_cycle/birth/premounting_with_componentwillmount.html
    let flower = this.props.flower;
    let orderIdx = this.props.orderIdx;
    let centralRadius = flower.state.centralRadius;  // the radius of the central circle
    let angle = getAngle(this.props.relPos);
    let petalRadius = flower.state.radii[orderIdx];
    let distFromFlowerCenter = flower.state.dists[orderIdx];
    let deltaState = {
          petalRadius: petalRadius
          , cx: (Math.cos(angle) * (distFromFlowerCenter))
          , cy: (Math.sin(angle) * (distFromFlowerCenter))};
    this.setState(deltaState);
    //console.log("<Petal> state:", this.state, deltaState);
  }
  render() {
    const {fill, orderIdx, flower} = this.props;
    const petalOpacity = flower.props.petalOpacity;
    const {cx, cy, centralRadius} = this.state;
    const petalRadius = flower.state.radii[orderIdx];
    //console.log("Petal.render()", cx, cy, centralRadius, petalRadius);
    let label = this.props.relPos.toString().substring(0,4);
    label = "d:" + Math.round(flower.state.dists[orderIdx]) + ";r:"+Math.round(petalRadius);
    label = "";
    return (
      <g strokeWidth="1" stroke="black" x1="0" y1="0" fontSize="5px">
        <line x2={cx} y2={cy} stroke="none"/>
        <circle cx={cx} cy={cy} r={petalRadius} stroke="black"
           opacity={petalOpacity} fill={fill}/>
        <text stroke="none" fill="white"
           textAnchor="middle" alignmentBaseline="middle"
           x={cx} y={cy}>{label}</text>
      </g>
    )
  }
}

Petal.propTypes = {
  relPos: PropTypes.number.isRequired,
  initialRadius: PropTypes.number,
  key: PropTypes.string.isRequired,
  fill: PropTypes.string.isRequired,
  initialPriority: PropTypes.number.isRequired
};

Petal.defaultProps = {
  fill: 'orange',
  initialPriority: 1.0
  //, initialRadius: 20
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
    interval = interval || this.props.randomStreamInterval;
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
    let args = {
      relPos: Math.random(),
      key: Math.random(),
      sortKey: Math.random(),
      fillColor: getRandomColor()
    };
    //console.log("args",args);
    this.addPetal(args);
    if (this.randomPetalCount > this.props.maxRandomPetalCount) {
      this.stopRandomStream();
    }
  }
  calcFrondRadius() {
    return calcRadiusOfPackedCircles(this.state.centralRadius,
                                     this.props.numberOfFronds);
  }
  getOrCreateFrond(relPos) {
    let idx = getBinIdx(relPos, this.props.numberOfFronds);
    let frondRelPos = getBinMid(idx, this.props.numberOfFronds);
    return this.state.fronds[idx] || {key: idx, relPos: frondRelPos, petals: []};
  }
  addPetal(args) {
    let idx = getBinIdx(args.relPos, this.props.numberOfFronds);
    let frondRelPos = getBinMid(idx, this.props.numberOfFronds);
    let aFrond = this.state.fronds[idx] || {
      key: idx,
      relPos: frondRelPos,
      petals: [],
      radius: this.state.frondRadius
    };
    aFrond.petals.push(args);
    this.state.fronds[idx] = aFrond;
    this.setState({fronds: this.state.fronds});
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
                     orderIdx={petalIdx+1}
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
  // https://nvbn.github.io/2017/03/14/react-generators/
  calcFrondRadius(centralRadius) {  // receiving centralRadius as param is an ugly hack
    return calcRadiusOfPackedCircles(centralRadius || this.state.centralRadius,
                                     this.props.numberOfFronds);
  }
  calcRadii(centralRadius) {
    let maxFrondLength = 50;
    let radii = [centralRadius];
    let packNum = this.props.numberOfFronds;
    for (let i = 1; i < maxFrondLength; i++) {
      radii[i] = calcRadiusOfPackedCircles(radii[i-1], packNum);
      packNum = this.props.packingOfPetals;
    }
    return radii;
  }
  calcDists(radii) {
    // idx=0 represents the rootPetal which is 0 from the center of the Reticle
    let dists = [],
        dist = 0,
        radius = 0;
    for (let idx = 0; idx < radii.length ; idx++) {
      dists[idx] = dist;
      dist = dists[idx] + radii[idx] + radii[idx+1];
    }
    return dists;
  }
  componentWillMount() {
    // https://developmentarc.gitbooks.io/react-indepth/content/life_cycle/birth/premounting_with_componentwillmount.html
    /*
      Prepare the initial state of the flower, here doing whatever calcs
      should preceed render() and follow constructor()
    */
    let centralRadius = this.props.proportionOfCenter * this.props.flowerMinDimension;
    console.log("setting centralRadius", centralRadius);
    this.setState({centralRadius: centralRadius});
    let radii = this.calcRadii(centralRadius);
    let dists = this.calcDists(radii);
    this.setState({radii: radii});
    this.setState({dists: dists});
    this.setState({frondRadius: this.calcFrondRadius(centralRadius)}); // HACK sending centralRadius
  }
  componentDidMount() {
    if (this.props.demoMode) {
      this.startRandomStream()
    } else {
      this.addRandomPetal();
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
  packingOfPetals: PropTypes.number,
  proportionOfCenter: PropTypes.number.isRequired,
  reticleRays: PropTypes.number,
  reticleRayLength: PropTypes.number,
  petalOpacity: PropTypes.number,
  demoMode: PropTypes.bool
};

DiversusFlower.defaultProps = {
  title: "Hello",
  numberOfFronds: 11,
  packingOfPetals: 8,
  proportionOfCenter: .30, // times the flowerMinDimension this controls the radius of the root
  reticleRays: 80,
  reticleRayLength: 90,
  petalOpacity: 0.80,
  maxRandomPetalCount: 50,
  flowerMinDimension: 100, // distance from center to closest top or side of SVG in pixels
  demoMode: true
};

/*
From Martin:
* BG Colour/Opacity of Flower-Canvas
* Colour/Opacity of circular grid strokes (I call the circular grid “gauge”)
* Border-width (stroke)
* Start-Size of the root 0-1
    * Non-active Size of the root (when another Petal has been activated)
* Size of the active Petal (the one chosen and clicked/activated by the user)
* Size of the directly adjacent neighbour Petals to the active Petal (a question of clickability)
* Duration of construction-animation (when the flower gets construction in the beginning. eg. when the user double-clicked a Petal in order to make it a new root, then flower has to get assembled newly)
* In case there are springs (animations), tensions or fractions (in case you use physics) in the magnifier-animation it would be cool to have their properties available
*/
