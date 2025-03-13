import MetadataModel from '@lib/metadata_model'

namespace MetadataModelUtils {
	export function InsertNewQueryConditionToQueryConditions(newQc: MetadataModel.QueryConditions, currQcs: MetadataModel.QueryConditions[]) {
		if (Array.isArray(currQcs) && currQcs.length > 0) {
			return structuredClone(currQcs).map((cqcs) => {
				let unappendedNewQcKeys = Object.keys(newQc)
				for (const cqcsKey of Object.keys(cqcs)) {
					for (const newQcKey of Object.keys(newQc)) {
						if (unappendedNewQcKeys.includes(newQcKey)) {
							if (cqcsKey === newQcKey) {
								if (newQc[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]) {
									if (cqcs[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]) {
										cqcs[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = cqcs[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] + ' ' + newQc[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]
									} else {
										cqcs[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = newQc[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]
									}
								}
								if (newQc[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION]) {
									if (Array.isArray(cqcs[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION]) && cqcs[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION].length > 0) {
										cqcs[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION] = cqcs[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION].map((orFilterConditions) => {
											newQc[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION]?.forEach((ofc) => {
												orFilterConditions = [...orFilterConditions, ...ofc]
											})

                                            return orFilterConditions
										})
									} else {
										cqcs[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION] = newQc[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION]
									}
								}
								unappendedNewQcKeys = unappendedNewQcKeys.filter((unqck) => unqck !== newQcKey)
							}
						}
					}
				}

				unappendedNewQcKeys.forEach((unqck) => (cqcs[unqck] = newQc[unqck]))

				return cqcs
			})
		}

		return [newQc]
	}

	export function GenJoinKey(prefix: string, suffix: string) {
		return prefix + '_join_' + suffix
	}
}

export default MetadataModelUtils
