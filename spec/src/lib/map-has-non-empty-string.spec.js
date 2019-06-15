import { expect } from 'chai';
import { Map, fromJS } from 'immutable';

import mapHasNonEmptyString from '../../../src/lib/map-has-non-empty-string';

describe('Map Has Non-Empty String module', () => {

	context('non-empty string exists', () => {

		it('returns true when top level attribute is non-empty string', () => {

			const map = fromJS(
				{
					foo: 'string',
					bar: {
						baz: '',
						qux: [
							{
								quux: ''
							}
						]
					},
					quuz: [
						{
							corge: ''
						}
					]
				}
			);

			const result = mapHasNonEmptyString(map);

			expect(result).to.be.true;

		});

		it('returns true when nested level attribute is non-empty string', () => {

			const map = fromJS(
				{
					foo: '',
					bar: {
						baz: 'string',
						qux: [
							{
								quux: ''
							}
						]
					},
					quuz: [
						{
							corge: ''
						}
					]
				}
			);

			const result = mapHasNonEmptyString(map);

			expect(result).to.be.true;

		});

		it('returns true when top level array object attribute is non-empty string', () => {

			const map = fromJS(
				{
					foo: '',
					bar: {
						baz: '',
						qux: [
							{
								quux: ''
							}
						]
					},
					quuz: [
						{
							corge: 'string'
						}
					]
				}
			);

			const result = mapHasNonEmptyString(map);

			expect(result).to.be.true;

		});

		it('returns true when nested level array object attribute is non-empty string', () => {

			const map = fromJS(
				{
					foo: '',
					bar: {
						baz: '',
						qux: [
							{
								quux: 'string'
							}
						]
					},
					quuz: [
						{
							corge: ''
						}
					]
				}
			);

			const result = mapHasNonEmptyString(map);

			expect(result).to.be.true;

		});

	});

	context('non-empty string does not exist', () => {

		it('returns false when non-empty string does not exist at any level', () => {

			const map = fromJS(
				{
					foo: '',
					bar: {
						baz: '',
						qux: [
							{
								quux: ''
							}
						]
					},
					quuz: [
						{
							corge: ''
						}
					]
				}
			);

			const result = mapHasNonEmptyString(map);

			expect(result).to.be.false;

		});

	});

});
