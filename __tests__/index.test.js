'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import DiversusFlower from '../src/index';

describe('DiversusFlower Component', () => {
  it('should render correctly', () => {
    // Render the DiversusFlower component
    const component = TestUtils.renderIntoDocument(
      <DiversusFlower title="Pretty Flower"/>
    );

    const titleNode = ReactDOM.findDOMNode(component);
    expect(titleNode.textContent).toEqual('Pretty Flower');
  });
});
