import classNames from 'classnames';
import { List, Map, is, getIn, removeIn, setIn, updateIn } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import createBlankMap from '../../../lib/create-blank-map';
import { camelCaseToSentenceCase, capitalise } from '../../../lib/strings';
import mapHasNonEmptyString from '../../../lib/map-has-non-empty-string';
import { ArrayItem, Input, InputErrors } from '.';
import { createInstance, updateInstance, deleteInstance } from '../../../redux/actions/model';
import { FORM_ACTIONS, FORM_CONCEALED_KEYS } from '../../../utils/constants';

class Form extends React.Component {

	constructor (props) {

		super(props);

		this.state = this.createObjectWithImmutableContent(props.instance);

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleDelete = this.handleDelete.bind(this);

	}

	componentDidUpdate (prevProps) {

		if (!is(prevProps.instance, this.props.instance)) {

			this.setState({ uuid: undefined, ...this.createObjectWithImmutableContent(this.props.instance) });

		}

	}

	createObjectWithImmutableContent (immutableMap) {

		const object = {};

		immutableMap.entrySeq().forEach(([key, value]) => object[key] = value);

		return object;

	}

	isRemovalButtonRequired (index, listSize) {

		return !((index + 1) === listSize);

	}

	getNewStateForRootAttr (rootAttr, statePath, eventTargetValue) {

		let newStateForRootAttr = setIn(this.state[rootAttr], statePath, eventTargetValue);

		const indexOfLastNumberInStatePath =
			statePath
				.map(pathItem => typeof pathItem === 'number')
				.lastIndexOf(true);

		const statePathToInnermostList = statePath.slice(0, indexOfLastNumberInStatePath);

		const innermostList = getIn(newStateForRootAttr, statePathToInnermostList);

		// If changed input was in a List.
		if (List.isList(innermostList)) {

			const lastListItem = innermostList.get(-1);

			const blankListItemAppendageRequired = mapHasNonEmptyString(lastListItem);

			if (blankListItemAppendageRequired) {

				const blankListItem = createBlankMap(lastListItem);

				newStateForRootAttr =
					updateIn(newStateForRootAttr, statePathToInnermostList, list => list.push(blankListItem));

			}

		}

		return newStateForRootAttr;

	}

	handleChange (statePath, event) {

		const rootAttr = statePath.shift();

		this.setState({ [rootAttr]: this.getNewStateForRootAttr(rootAttr, statePath, event.target.value) });

	}

	handleRemovalClick (statePath, event) {

		event.preventDefault();

		const rootAttr = statePath.shift();

		this.setState({ [rootAttr]: removeIn(this.state[rootAttr], statePath) });

	}

	handleSubmit (event) {

		event.preventDefault();

		switch (this.props.action) {

			case FORM_ACTIONS.create:
				return this.props.createInstance(this.state);

			case FORM_ACTIONS.update:
				return this.props.updateInstance(this.state);

		}

	}

	handleDelete (event) {

		event.preventDefault();

		this.props.deleteInstance(this.state);

	}

	render () {

		if (this.props.redirectPath) {

			const redirectToProps = {
				pathname: this.props.redirectPath,
				state: {
					redirectPathOriginStateProp: `${this.state.model}FormData`
				}
			};

			return (
				<Redirect to={redirectToProps} />
			);

		}

		const submitButtonText = capitalise(this.props.action);

		const isDeleteButtonRequired = this.props.action === FORM_ACTIONS.update;

		const handleValue = (value, statePath, errors) =>
			Map.isMap(value)
				? renderAsForm(value, statePath)
				: List.isList(value)
					? value.map((item, index) =>
						renderAsForm(item, [...statePath, index], this.isRemovalButtonRequired(index, value.size))
					)
					: (
						<React.Fragment>
							<Input
								value={value}
								hasErrors={!!errors}
								handleChange={this.handleChange.bind(this, statePath)}
							/>
							{
								!!errors && (
									<InputErrors
										errors={errors}
										statePath={statePath}
									/>
								)
							}
						</React.Fragment>
					);

		const renderAsForm = (map, statePath = [], isRemovalButtonRequired = false) => {

			const isArrayItem = statePath.some(item => !isNaN(item));

			const isNestedArrayItem = statePath.filter(item => !isNaN(item)).length > 1;

			const fieldsetModuleClassName = classNames({
				'fieldset__module': isArrayItem,
				'fieldset__module--nested': isNestedArrayItem
			});

			return (
				<div className={fieldsetModuleClassName} key={statePath.join('-')}>

					{
						isArrayItem && (
							<ArrayItem
								isRemovalButtonRequired={isRemovalButtonRequired}
								handleRemovalClick={this.handleRemovalClick.bind(this, statePath)}
							/>
						)
					}

					{
						map.entrySeq()
							.filter(([key]) => !FORM_CONCEALED_KEYS.includes(key))
							.map(([key, value]) =>
								<div
									className={
										classNames({
											'fieldset__component': !isArrayItem,
											'fieldset__module-component': isArrayItem
										})
									}
									key={`${statePath.join('-')}-${key}`}
								>

									<label className="fieldset__label">{ camelCaseToSentenceCase(key) }:</label>

									{
										handleValue(
											value,
											[...statePath, key],
											map.getIn(['errors', key])
										)
									}

								</div>
							)
					}

				</div>
			);

		};

		return (
			<form className="form" onSubmit={this.handleSubmit}>

				{
					Object.keys(this.state)
						.filter(key => !FORM_CONCEALED_KEYS.includes(key))
						.map(key =>
							<fieldset className="fieldset" key={key}>

								<h2 className="fieldset__header">{ camelCaseToSentenceCase(key) }:</h2>

								{
									handleValue(
										this.state[key],
										[key],
										this.state.errors?.get(key)
									)
								}

							</fieldset>
						)
				}

				<button className="button">{ submitButtonText }</button>

				{
					isDeleteButtonRequired && (
						<button className="button" onClick={this.handleDelete}>Delete</button>
					)
				}
			</form>
		);

	}

}

Form.propTypes = {
	instance: ImmutablePropTypes.map.isRequired,
	action: PropTypes.string.isRequired,
	redirectPath: PropTypes.string,
	createInstance: PropTypes.func.isRequired,
	updateInstance: PropTypes.func.isRequired,
	deleteInstance: PropTypes.func.isRequired
};

export default connect(null, { createInstance, updateInstance, deleteInstance })(Form);
