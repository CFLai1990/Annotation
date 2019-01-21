/*
 * DataLoader
 *
 * This is a component for loading data from files
 *
 */

import React from 'react'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { makeSelectData } from './selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import DropDown from 'components/DropDown/index'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import MsgBox from 'components/MsgBox'

const msg = new MsgBox('DATA_LOADER')

// Read the data options
import dataCollection from 'data/options.json' // Data options, name: info

// Actions to change the language
import actionCreators from './actions'

const options =
  typeof dataCollection === 'object'
    ? Object.keys(dataCollection).map((name, index) => ({
      description: name,
      event: name,
      key: index.toString()
    }))
    : {}

const bindLoadData = function (loadFunc) {
  // Return url from the dropdown selection
  return name => {
    loadFunc(name)
  }
}

class DataLoader extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render () {
    return (
      <DropDown
        title={this.props.intl.formatMessage({
          id: 'app.components.data'
        })}
        options={options}
        activeKey={this.props.dataSelection}
        onSelect={bindLoadData(this.props.actionCreators.loadData)}
      />
    )
  }
}

DataLoader.propTypes = {
  intl: intlShape.isRequired,
  dataSelection: PropTypes.string
}

const mapStateToProps = createSelector(makeSelectData(), dataSelection => ({
  dataSelection
}))

function mapDispatchToProps (dispatch) {
  return {
    actionCreators: bindActionCreators(actionCreators, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(DataLoader)
)
