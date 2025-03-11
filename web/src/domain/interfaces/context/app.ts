import Entities from '@domentities'

export interface IAppContextProvider {
	GetContext: () => Entities.AppContext.Interface | undefined
	UpdateOpenidendpoints: (value: Entities.AppContext.OpenidEndpoints | undefined) => void
	UpdateIamcredential: (value: Entities.IamCredentials.Interface | undefined) => void
	UpdateContext: (value: Entities.AppContext.Interface | undefined) => void
	UpdateIamdirectorygroupid: (value: string | undefined) => void
	UpdateCurrentDirectorygroupPath: (title: string | undefined) => void
	Updatetargetjoindepth: (value: number | undefined) => void
	Updatedonotusecurrentdirectorygroupasauthcontext: (value: boolean | undefined) => void
	Updateskipiffgdisabled: (value: boolean | undefined) => void
	Updateskipifdataextraction: (value: boolean | undefined) => void
	Updatewhereafterjoin: (value: boolean | undefined) => void
	Updateverboseresponse: (value: boolean | undefined) => void
}

export interface IAppContextConsumer {
	appcontext: Entities.AppContext.Interface | undefined
	GetCurrentdirectorygroupid: () => string | undefined
	Getauthcontextdirectorygroupid: () => string
}
