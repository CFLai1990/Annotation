/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react'
import styled from 'styled-components'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'

import Flex from 'components/Flex/index'
import { Page, Header, Body, Row, Col } from 'components/Page/index'
import ImageView from 'containers/ImageView/Loadable'
import DescriptionView from 'containers/DescriptionView/Loadable'

class HomePageHeader extends React.PureComponent {
    // eslint-disable-line react/prefer-stateless-function
  render () {
    return (
      <Header title={this.props.intl.formatMessage({ id: 'app.components.title' })} language data />
    )
  }
}

HomePageHeader.propTypes = {
  intl: intlShape.isRequired
}

class HomePageBody extends React.PureComponent {
    // eslint-disable-line react/prefer-stateless-function
  constructor (props) {
    super(props)
    // // Row 1
    // this.R1 = new Flex.Unit(Body.style.viewWidth, Body.style.viewHeight * 0.95) // The real (vw, vh)
    // this.R1_View1 = this.R1.child(0.5, 1.0)
    // this.R1_View1_Dsp = {
    //   sizeRatio: {w: 0.8, h: 0.8}
    // }
    // this.R1_View2 = this.R1.child(0.5, 1.0)
    // this.R1_View2_Img = {
    //   sizeRatio: {w: 0.8, h: 0.8}
    // }
    // // Row 2
    // this.R2 = new Flex.Unit(Body.style.viewWidth, Body.style.viewHeight * 0.05) // The real (vw, vh)
    // this.R2_View1 = this.R2.child(1.0, 1.0)

    // Row 1
    this.R1 = new Flex.Unit(Body.style.viewWidth, Body.style.viewHeight * 0.95) // The real (vw, vh)
    this.R1_C1 = this.R1.child(1.0, 1.0)
    this.R1_C1_View1 = this.R1.child(0.5, 1.0)
    this.R1_C1_View2 = this.R1.child(0.5, 1.0)

    this.View_Dsp = {
      sizeRatio: {w: 0.9, h: 0.9}
    }
    this.R1_C2_View = this.R1.child(1.0, 0.5)

    this.View_Img = {
      sizeRatio: {w: 0.9, h: 0.9}
    }
    // Row 2
    this.R2 = new Flex.Unit(Body.style.viewWidth, Body.style.viewHeight * 0.05) // The real (vw, vh)
  }
  render () {
    return (
      <Body>
        <Row size={this.R1.size}>
          <ImageView size={this.R1_C1_View1.size} inner={this.View_Img} />
          <DescriptionView size={this.R1_C1_View2.size} inner={this.View_Dsp} />
        </Row>
      </Body>
    )
  }
}

export default Page(injectIntl(HomePageHeader), HomePageBody)
