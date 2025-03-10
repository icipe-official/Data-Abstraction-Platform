export interface IFieldAnyMetadataModelGet {
	GetMetadataModel: (actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) => Promise<any | undefined>
}
