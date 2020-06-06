import { Map, fromJS } from 'immutable';

import {
	REQUEST_CHARACTER,
	RECEIVE_CHARACTER,
	RECEIVE_CHARACTER_TEMPLATE,
	RECEIVE_CHARACTER_CREATE,
	RECEIVE_CHARACTER_UPDATE
} from '../utils/model-actions';

const character = (state = Map({}), action) => {

	switch (action.type) {

		case RECEIVE_CHARACTER_TEMPLATE:
		case RECEIVE_CHARACTER_CREATE:
		case RECEIVE_CHARACTER:
		case RECEIVE_CHARACTER_UPDATE:
			return fromJS(action.payload);

		case REQUEST_CHARACTER:
		default:
			return state;

	}

};

export default character;
