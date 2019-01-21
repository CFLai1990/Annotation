/*
 * LanguageChanger
 *
 * This is a component for changing the language of the website
 *
 */

import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import DropDown from 'components/DropDown/index'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { DEFAULT_LOCALE } from 'containers/LanguageProvider/constants'

// Read the language options
import locales from 'translations/options.json' // Language options, locale: {lang: code}

// Actions to change the language
import actionCreators from 'containers/LanguageProvider/actions'
import { createSelector } from 'reselect'
import { makeSelectLocale } from './selectors'

const options =
  typeof locales === 'object'
    ? Object.keys(locales).map((lang, index) => ({
      description: lang,
      event: locales[lang],
      key: index.toString()
    }))
    : {}

const bindChangeLocale = function (changeFunc) {
  // Return code from the dropdown selection
  return code => {
    const langs = Object.keys(locales)
    for (let lang of langs) {
      if (code == locales[lang]) {
        changeFunc(code)
        break
      }
    }
  }
}

export class LanguageChanger extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render () {
    return (
      <DropDown
        title={this.props.intl.formatMessage({
          id: 'app.components.language'
        })}
        options={options}
        activeKey={this.props.locale}
        onSelect={bindChangeLocale(this.props.actionCreators.changeLocale)}
      />
    )
  }
}

LanguageChanger.propTypes = {
  intl: intlShape.isRequired,
  locale: PropTypes.string
}

const mapStateToProps = createSelector(makeSelectLocale(), locale => ({
  locale
}))

function mapDispatchToProps (dispatch) {
  return {
    actionCreators: bindActionCreators(actionCreators, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(LanguageChanger)
)
