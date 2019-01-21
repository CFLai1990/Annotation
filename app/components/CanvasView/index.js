import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import flowRight from 'lodash/flowRight'
import * as $ from 'jQuery'

import View from 'components/View/index'
import Flex from 'components/Flex/index'
import { pageStyle } from 'styles/constants'

const Canvas = styled.canvas`
  background: ${props => props.background};
`

Canvas.defaultProps = {
  width: 100, // The width of the canvas (actual size)
  height: 100, // The width of the canvas (actual size)
  parentSize: {w: 0, h: 0}, // The size of its parent node (actual size)
  size: 90, // The relative size of the whole canvas (percentage)
  sizeRatio: 0.9, // The size ratio of the canvas in its parent node (ratio)
  margin: { w: 0, h: 0 }, // Margin of the canvas (percentage)
  background: '#fff'  // Background color of the canvas
}

const CanvasViewPort = Flex.Block.extend`
    width: ${props => props.finalSizeRatio.w}vw;
    height: ${props => props.finalSizeRatio.h}vh;
    min-width: ${props =>
        Flex.minWidth(props.size, props.margin, props.parentSize)};
    min-height: ${props =>
        Flex.minHeight(props.size, props.margin, props.parentSize)};
    margin: ${props => props.margin.h + 'vh ' + props.margin.w + 'vw'};
    background: ${props => props.background};
`

CanvasViewPort.defaultProps = {
  parentSize: { w: 0, h: 0 }, // The size of its parent node (actual size)
  size: { w: 90, h: 90 }, // The relative size of the whole canvas (percentage)
  sizeRatio: { w: 0.9, h: 0.9 }, // The size ratio of the canvas in its parent node (ratio)
  margin: { w: 0, h: 0 }, // Margin of the canvas (percentage)
  background: '#fff'  // Background color of the canvas
}

// parentSize is passed from View
class CanvasUnit extends React.PureComponent {
  render () {
    return (
      <CanvasViewPort
        parentSize={this.props.parentSize}
        {...this.props.inner}
      >
        <Canvas />
      </CanvasViewPort>
    )
  }
}
const CanvasView = View.Decorator(CanvasUnit)

CanvasView.propTypes = {
  parentSize: PropTypes.shape({ w: PropTypes.number, h: PropTypes.number }),
  size: PropTypes.shape({ w: PropTypes.number, h: PropTypes.number }),
  margin: PropTypes.number,
  borderWidth: PropTypes.number,
  borderColor: PropTypes.string,
  background: PropTypes.string
}

// Props passed to View
const Decorator = CanvasContents =>
    class extends React.PureComponent {
      constructor (props) {
        super(props)
        let inner = props.inner
        let viewBox = inner.viewBox
        let sizeRatio = inner.sizeRatio
        let size = {w: sizeRatio.w * 100, h: sizeRatio.h * 100}
        this.inner = {
          ...inner,
          viewBox: inner.viewBox || { w: 100, h: 100 }, // viewBox: the real viewport size
          aspectRatio: viewBox.w / viewBox.h,
          size: size,
          finalSizeRatio: {
            w: Flex.width(size, inner.margin, props.parentSize),
            h: Flex.height(size, inner.margin, props.parentSize)
          }
        }
      }
      getNewSize () {
        const inner = this.inner
        const windowSize = {w: window.innerWidth, h: window.innerHeight}
        const parentAspectRatio = (this.div) ? (this.div.offsetWidth / this.div.offsetHeight) : (windowSize.w * inner.finalSizeRatio.w) / (windowSize.h * inner.finalSizeRatio.h)
        const selfToParentRatio = inner.aspectRatio / parentAspectRatio
        return {
          w: `${selfToParentRatio >= 1 ? 100 : 100 * selfToParentRatio}%`,
          h: `${selfToParentRatio >= 1 ? 100 / selfToParentRatio : 100}%`
        }
      }
      render () {
        const inner = this.inner
        let canvasSize = this.getNewSize()
        return (
          <CanvasViewPort
            innerRef={div => { this.div = div }}
            parentSize={this.props.parentSize}
            {...inner}
                >
            <CanvasContents
              viewBox={inner.viewBox}
              resize={canvas => {
                let canvasSize = this.getNewSize()
                $(canvas).css('width', canvasSize.w)
                $(canvas).css('height', canvasSize.h)
              }}
              style={{
                width: `${canvasSize.w}`,
                height: `${canvasSize.h}`
              }}
            />
          </CanvasViewPort>
        )
      }
    }

// The flowRight function executes the input functions from right to left
CanvasView.Decorator = CanvasContents => {
  return flowRight(View.Decorator, Decorator)(CanvasContents)
}

export {CanvasView, Canvas}
