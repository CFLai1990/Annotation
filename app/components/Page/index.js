/*
* Page
*
* This is the Page component.
*/

import React from 'react'
import styled from 'styled-components'

import Flex from 'components/Flex/index'
import Header from 'components/PageHeader/index'
import { pageStyle, headerStyle, bodyStyle } from 'styles/constants'

const PageContainer = Flex.Block.extend`
    width: 100vw;
    height: 100vh;
    min-width: ${Flex.realSize(pageStyle.minWidth)};
    min-height: ${Flex.realSize(pageStyle.minHeight)};
    flex-direction: column;
    text-overflow: ellipsis;
`

const PageHeader = Flex.Block.extend`
    height: ${headerStyle.viewHeight}vh;
    min-height: ${Flex.realSize(headerStyle.minHeight)};
`

const PageBody = Flex.Block.extend`
    min-width: ${Flex.realSize(bodyStyle.minWidth)};
    min-height: ${Flex.realSize(bodyStyle.minHeight)};
    flex-direction: row;
    overflow: auto;
`

const Page = (PageHeaderContents, PageBodyContents) => class extends React.PureComponent {
    // eslint-disable-line react/prefer-stateless-function
    // Page: Container -> { Header, Body }
  render () {
    return (
      <PageContainer>
        <PageHeader role='banner'>
          <PageHeaderContents />
        </PageHeader>
        <PageBody>
          <PageBodyContents />
        </PageBody>
      </PageContainer>
    )
  }
}
Page.style = pageStyle

Header.style = headerStyle

const Body = Flex.Block.extend`
    flex-direction: row;
`
Body.style = bodyStyle

const Col = Flex.Box.extend`
    flex-direction: column;
`

const Row = Flex.Box.extend`
    flex-direction: row;
`

export { Page, Header, Body, Col, Row }
