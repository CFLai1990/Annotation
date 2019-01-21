/*
 * View
 *
 * This is the component for rendering a view window
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Flex from "components/Flex/index";

const viewMargin = { w: 0.5, h: 0.5 };

// The size of View is relative to its parent element
const ViewPort = Flex.Box.extend`
  background: ${props => props.background};
  border: ${props => Flex.realSize(props.borderWidth)} solid;
  border-radius: ${props => Flex.realSize(props.borderRadius)};
  border-color: ${props => props.borderColor};
`;

ViewPort.defaultProps = {
  background: "#f0f0f0",
  margin: { w: viewMargin.w, h: viewMargin.h },
  borderWidth: 0.2,
  borderRadius: 1,
  borderColor: "#bdbdbd"
};

class View extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    return <ViewPort {...this.props} />;
  }
}

View.propTypes = {
  size: PropTypes.shape({ w: PropTypes.number, h: PropTypes.number }),
  margin: PropTypes.number,
  borderWidth: PropTypes.number,
  borderColor: PropTypes.string,
  background: PropTypes.string
};

const Decorator = ViewContents =>
  class extends React.PureComponent {
    static defaultProps = {
      inner: {
        size: { w: 90, h: 90 } // Inner: 90% space by default
      }
    };
    render() {
      return (
        <View {...this.props}>
          <ViewContents parentSize={this.props.size} inner={this.props.inner} />
        </View>
      );
    }
  };

View.Decorator = Decorator;

export default View;
