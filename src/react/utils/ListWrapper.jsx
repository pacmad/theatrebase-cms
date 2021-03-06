import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { FormattedJson, PageTitle } from '../components';

class ListWrapper extends React.Component {

	render () {

		const { pageTitleText, instances } = this.props;

		return (
			<React.Fragment>

				<PageTitle text={pageTitleText} />

				<FormattedJson data={instances} />

			</React.Fragment>
		);

	}

}

ListWrapper.propTypes = {
	pageTitleText: PropTypes.string.isRequired,
	instances: ImmutablePropTypes.list.isRequired
};

export default ListWrapper;
