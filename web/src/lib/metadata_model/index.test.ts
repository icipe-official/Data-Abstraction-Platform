import { expect, test } from 'vitest'
import MetadataModel from '.'
import Json from '../json'
import test_data_2darray from '$project/test_data/test_data_2darray.json'
import test_data from '$project/test_data/test_data.json'
import test_metadatamodel from '$project/test_data/test_metadatamodel.json'

test('Converts objects to 2D array, expects value to be equal to test_data_2darray', () => {
	let objectTo2DArray = new MetadataModel.ConvertObjectsTo2DArray(test_metadatamodel)
	objectTo2DArray.Convert(test_data)
	expect(Json.AreValuesEqual(objectTo2DArray.Array2D, test_data_2darray)).toBe(true)
})

test('Converts objects to 2D array and back, expects value to be equal to original', () => {
	let objectTo2DArray = new MetadataModel.ConvertObjectsTo2DArray(test_metadatamodel)
	objectTo2DArray.Convert(test_data)

	let arrray2DToObject = new MetadataModel.Convert2DArrayToObjects(test_metadatamodel)
	arrray2DToObject.Convert(structuredClone(objectTo2DArray.Array2D))
	expect(Json.AreValuesEqual(test_data, arrray2DToObject.Objects)).toBe(true)
})

test('Converts 2D array to objects, expects value to be equal to test_data', () => {
	let arrray2DToObject = new MetadataModel.Convert2DArrayToObjects(test_metadatamodel)
	arrray2DToObject.Convert(test_data_2darray)
	expect(Json.AreValuesEqual(arrray2DToObject.Objects, test_data)).toBe(true)
})

test('Converts 2D array to objects and back, expects value to be equal to original', () => {
	let arrray2DToObject = new MetadataModel.Convert2DArrayToObjects(test_metadatamodel)
	arrray2DToObject.Convert(test_data_2darray)

	let objectTo2DArray = new MetadataModel.ConvertObjectsTo2DArray(test_metadatamodel)
	objectTo2DArray.Convert(structuredClone(arrray2DToObject.Objects))

	expect(Json.AreValuesEqual(objectTo2DArray.Array2D, test_data_2darray)).toBe(true)
})
