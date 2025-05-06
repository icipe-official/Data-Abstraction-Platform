import { Shared } from '$lib/constants'
import { Log, DeleteValueInObject, GetValueInObject, SetValueInObject } from '$lib/utils'

const CURRENT_SECTION = 'Template Manager'

function prepareKey(key: string, repetitiveIndexes: number[]): string | undefined {
	for (let i = 0; i < repetitiveIndexes.length; i++) {
		key = key.replace('[x]', `[${repetitiveIndexes[i]}]`)
	}
	if (key.includes('[x]')) {
		Log(Shared.LogLevel.ERROR, CURRENT_SECTION, `key ${key} does not match indexes ${repetitiveIndexes}`)
		return
	}
	key = key.replace('root.', '')
	return key
}

export default class TemplateManager {
	private currentTemplate: any = {}
	private repetitiveGroupDefaultValues: any = {}

	constructor(originalTemplate: any) {
		this.genRepetitiveGroupDefaultValues(originalTemplate)
		this.currentTemplate = JSON.parse(JSON.stringify(originalTemplate))
	}

	private genRepetitiveGroupDefaultValues(value: any) {
		for (let key of Object.keys(value)) {
			if (value[key]['struct'].split(' ')[1] === 'repetitive') {
				this.repetitiveGroupDefaultValues[value[key]['struct'].split(' ')[0]] = GetValueInObject(value, `${key}.value[0]`)
				this.genRepetitiveGroupDefaultValues(GetValueInObject(value, `${key}.value[0]`))
			} else if (value[key]['struct'].split(' ')[1] === 'unique') {
				this.genRepetitiveGroupDefaultValues(value[key]['value'])
			}
		}
	}

	addRepetitiveGroupItem(key: string, value: any, repetitiveIndexes: number[]) {
		const processedKey = prepareKey(key, repetitiveIndexes)
		if (typeof processedKey === 'undefined') return
		this.currentTemplate = SetValueInObject(this.currentTemplate, processedKey, value)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, this.currentTemplate, 'Add repetitive group to template')
	}

	deleteRepetitiveGroupItem(key: string, repetitiveIndexes: number[]) {
		const processedKey = prepareKey(key, repetitiveIndexes)
		if (typeof processedKey === 'undefined') return
		this.currentTemplate = DeleteValueInObject(this.currentTemplate, processedKey)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, this.currentTemplate, 'Delete repetitive group')
	}

	GetRepetitiveGroupDefaultValue = (groupPathName: string) => JSON.stringify(this.repetitiveGroupDefaultValues[groupPathName])

	CurrentTemplate = () => JSON.parse(JSON.stringify(this.currentTemplate))
}
