import { expect, test } from 'vitest'
import MetadataModel from '.'
import Json from '../json'
import test_data_2d_array from '$project/test_data/test_data_2D_array.json'
import test_data_no_nulls from '$project/test_data/test_data_no_nulls.json'
import test_data_nulls from '$project/test_data/test_data_nulls.json'
import test_template_field_structures from '$project/test_data/test_template_field_structures.json'
import test_template from '$project/test_data/test_template.json'
import test_select_columns from '$project/test_data/test_template_select_columns.json'
import test_path_to_columns from '$project/test_data/test_template_paths_to_columns.json'
import test_add_fieldproperties from '$project/test_data/test_template_add_field_property.json'
import { _ObjectKey } from './metadata_model'

test('Converts object to 2D array, expects value to be equal to original', () => {
	const object2DArray = MetadataModel.ConvertArrayOfObjectsTo2DArray(test_template, test_data_nulls)
	expect(Json.AreValuesEqual(test_data_2d_array, object2DArray)).toBe(true)
})

test('Generates fieldStructures, expects value to be equal to original', () => {
	const fieldStructures = MetadataModel.ExtractFieldStructuresFromMetadataModel(test_template)
	expect(Json.AreValuesEqual(test_template_field_structures, fieldStructures)).toBe(true)
})

test('Converts 2D Array to object and vice versa, expects values to be equal.', () => {
	const array2DObject = MetadataModel.Convert2DArrayToArrayOfObjects(test_template, test_data_2d_array)
	expect(Json.AreValuesEqual(test_data_no_nulls, array2DObject, false)).toBe(true)
})

test('Map field properties in metadata-model, expects mapped template to be equal to original', () => {
	const metadataModelMapped = MetadataModel.MapFieldPropertiesInMetadataModel(test_template, (property) => {
		return property
	})
	expect(Json.AreValuesEqual(test_template, metadataModelMapped)).toBe(true)
})

test('Generate select columns from metadata_model, expects select columns to be equal to original', () => {
	const selectColumns = MetadataModel.GenUniqueFieldsFromMetadataModel(test_template, 'mosquito_vector_data')
	expect(Json.AreValuesEqual(test_select_columns, selectColumns)).toBe(true)
})

test('Generate paths to columns from metadata_model, expects select columns to be equal to original', () => {
	const pathsToColumns = MetadataModel.GenPathsToFieldsInObjectFromMetadataModel(test_template)
	expect(Json.AreValuesEqual(test_path_to_columns, pathsToColumns)).toBe(true)
})

test('Add field property to columns from metadata_model, expects updated metadata-model to be equal to original', () => {
	const updatedMetadataModel = MetadataModel.AddFieldPropertyToColumnsInMetadataModel(test_template, ['source_id', 'site_and_georeferencing', 'longitude', 'dna_seq'], _ObjectKey.FIELD_GROUP_VIEW_DISABLE, true)
	expect(Json.AreValuesEqual(test_add_fieldproperties, updatedMetadataModel)).toBe(true)
})

test('Set and get column value from metadata_model, expects set and get value to be equal', () => {
	const valueToSet = [true]
	let value = {}
	value = MetadataModel.SetFieldValueWithMetadataModel(test_template, value, 'dna_seq', valueToSet)
	expect(Json.AreValuesEqual(MetadataModel.GetFieldValueWithMetadataModel(test_template, value, 'dna_seq'), valueToSet)).toBe(true)
})
