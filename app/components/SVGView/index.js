import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import flowRight from 'lodash/flowRight'

import View from 'components/View/index'
import Flex from 'components/Flex/index'
import { pageStyle } from 'styles/constants'

const SVGViewPort = styled.svg`
    width: ${props =>
        Flex.width(props.size, props.margin, props.parentSize)}vw;
    height: ${props =>
        Flex.height(props.size, props.margin, props.parentSize)}vh;
    min-width: ${props =>
        Flex.minWidth(props.size, props.margin, props.parentSize)};
    min-height: ${props =>
        Flex.minHeight(props.size, props.margin, props.parentSize)};
    background: ${props => props.background};
    margin: ${props => props.margin.h + 'vh ' + props.margin.w + 'vw'};
`

SVGViewPort.defaultProps = {
  parentSize: [0, 0], // The size of its parent node
  size: { w: 90, h: 90 }, // The size of the whole svg
  sizeRatio: { w: 0.9, h: 0.9 }, // The size ratio of the svg in its parent node
  margin: { w: 0, h: 0 }, // Margin of the svg
  background: '#fff'
}

// parentSize is passed from View
class SVGUnit extends React.PureComponent {
  render () {
    return (
      <SVGViewPort
        parentSize={this.props.parentSize}
        {...this.props.inner}
            />
    )
  }
}
const SVGView = View.Decorator(SVGUnit)

SVGView.propTypes = {
  parentSize: PropTypes.shape({ w: PropTypes.number, h: PropTypes.number }),
  size: PropTypes.shape({ w: PropTypes.number, h: PropTypes.number }),
  margin: PropTypes.number,
  borderWidth: PropTypes.number,
  borderColor: PropTypes.string,
  background: PropTypes.string
}

// Props passed to View
const Decorator = SVGContents =>
    class extends React.PureComponent {
      constructor (props) {
        super(props)
        let sizeRatio = props.inner.sizeRatio
        props.inner.size = {w: sizeRatio.w * 100, h: sizeRatio.h * 100}
        this.defaults = {
          viewBox: { w: 100, h: 100 }, // viewBox: the real viewport size
          preserveAspectRatio: 'xMidYMid meet' // How to preserve the aspect ratio
          // Preserve:              [xMin, xMid, xMax] * [YMin, YMid, YMax] * [meet, slice]
          // Don't preserve:  none
        }
      }
      render () {
        const inner = Object.assign({}, this.defaults, this.props.inner)
        return (
          <SVGViewPort
            parentSize={this.props.parentSize}
            {...this.props.inner}
            viewBox={`0,0,${inner.viewBox.w},${inner.viewBox.h}`}
            preserveAspectRatio={inner.preserveAspectRatio}
                >
            <SVGContents viewBox={inner.viewBox} />
          </SVGViewPort>
        )
      }
    }

// The flowRight function executes the input functions from right to left
SVGView.Decorator = SVGContents => {
  return flowRight(View.Decorator, Decorator)(SVGContents)
}

export default SVGView
