'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import {petalRelPosToFrondLoc, DiversusFlower} from '../src/index';

describe('DiversusFlower Component', () => {
  it('should have support funcs', () => {
    expect(petalRelPosToFrondLoc(.1,4)).toEqual([0, 1/8]);
    expect(petalRelPosToFrondLoc(.3,4)).toEqual([1, 3/8]);
    expect(petalRelPosToFrondLoc(.6,4)).toEqual([2, 5/8]);
    expect(petalRelPosToFrondLoc(.8,4)).toEqual([3, 7/8]);
    expect(petalRelPosToFrondLoc(.5,1)).toEqual([0, 1/2]);
    expect(petalRelPosToFrondLoc(.1,2)).toEqual([0, 1/4]);
    expect(petalRelPosToFrondLoc(.9,2)).toEqual([1, 3/4]);
    expect(petalRelPosToFrondLoc(.1,3)).toEqual([0, 1/6]);
    expect(petalRelPosToFrondLoc(.5,3)).toEqual([1, 1/2]);
    expect(petalRelPosToFrondLoc(.9,3)).toEqual([2, 5/6]);
  });


  it('should render correctly', () => {
    // Render the DiversusFlower component
    var grab = {};
    function dadFunc(kiddo) {
      grab.kid = kiddo;
      return {};
    }
    const component = TestUtils.renderIntoDocument(
        <DiversusFlower title="Pretty Flower" demoMode={false} whosYourDaddy={dadFunc}/>
    );

    const titleNode = ReactDOM.findDOMNode(component);
    expect(grab.kid.props.demoMode).toEqual(false);
    expect(grab.kid.state.dists[0]).toEqual(0); // distance from center to itself is 0
    expect(grab.kid.state.dists[1]).toEqual(grab.kid.state.radii[0] +
                                            grab.kid.state.radii[1]);
    expect(grab.kid.state.dists[2]).toEqual(grab.kid.state.radii[0] +
                                            grab.kid.state.radii[1]*2 +
                                            grab.kid.state.radii[2]);
  });

});
