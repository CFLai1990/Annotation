/*
 * Flex Components
 *
 */

import styled from 'styled-components'
import { sizeSuffix, pageStyle } from 'styles/constants'
import PMath from 'utils/pmath'
import MsgBox from 'components/MsgBox'

const msg = new MsgBox('FLEX')

// Get the real size according to the size suffix, such as 'px', 'em', 'rem', etc.
const getSize = function (size) {
  return size + sizeSuffix
}

// Get the width vw
const getWidth = function (
    childSize = { w: 100, h: 100 },
    childMargin = { w: 0, h: 0 },
    parentSize = { w: 100, h: 100 }
) {
  return parentSize.w * (childSize.w - childMargin.w * 2) * 0.01
}

// Get the height vh
const getHeight = function (
    childSize = { w: 100, h: 100 },
    childMargin = { w: 0, h: 0 },
    parentSize = { w: 100, h: 100 }
) {
  return parentSize.h * (childSize.h - childMargin.h * 2) * 0.01
}

// Get the min-width sizeSuffix
const getMinWidth = function (
    childSize = { w: 100, h: 100 },
    childMargin = { w: 0, h: 0 },
    parentSize = { w: 100, h: 100 }
) {
  return getSize(
        parentSize.w *
            (childSize.w - childMargin.w * 2) *
            pageStyle.minWidth *
            1e-4
    )
}

// Get the min-height sizeSuffix
const getMinHeight = function (
    childSize = { w: 100, h: 100 },
    childMargin = { w: 0, h: 0 },
    parentSize = { w: 100, h: 100 }
) {
  return getSize(
        parentSize.h *
            (childSize.h - childMargin.h * 2) *
            pageStyle.minHeight *
            1e-4
    )
}

// FlexBlock: It is the basic container type in the flex-based layouts.
const FlexBlock = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    align-content: space-evenly;
    flex-shrink: 1;
`

// FlexBox: A finer-level flex-style container whose size needs to be determined
const FlexBox = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    align-content: space-evenly;
    flex-shrink: 1;
    width: ${props => getWidth(props.size, props.margin)}vw;
    height: ${props => getHeight(props.size, props.margin)}vh;
    min-width: ${props => getMinWidth(props.size, props.margin)};
    min-height: ${props => getMinHeight(props.size, props.margin)};
    margin: ${props => props.margin.h + 'vh ' + props.margin.w + 'vw'};
`

FlexBox.defaultProps = {
  size: { w: 0, h: 0 },
  margin: { w: 0, h: 0 }
}

// flexUnit: A hierarchical FlexBox containers. Its size is defined relative to its parent node.
class FlexUnit {
  constructor (w, h) {
        // Size: in percent (vw, vh)
    this.size = { w: w, h: h }
    this.children = []
  }
  child (wRto, hRto) {
        // Get the size of a childNode
    let ratioRange = [0, 1]
    if (!PMath.isLegal(wRto, ratioRange) || !PMath.isLegal(hRto, ratioRange)) {
      msg.error('Illegal parameter!')
      return false
    }
    let w = this.size.w * wRto
    let h = this.size.h * hRto
    let child = new FlexUnit(w, h)
    this.children.push(child)
    return child
  }
}

export default {
  Block: FlexBlock,
  Box: FlexBox,
  Unit: FlexUnit,
  realSize: getSize,
  width: getWidth,
  height: getHeight,
  minWidth: getMinWidth,
  minHeight: getMinHeight
}
