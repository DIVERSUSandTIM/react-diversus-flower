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
    const component = TestUtils.renderIntoDocument(
        <DiversusFlower title="Pretty Flower" demoMode={false}/>
    );

    const titleNode = ReactDOM.findDOMNode(component);
    expect(titleNode.textContent).toEqual('Pretty Flower');
  });

});
