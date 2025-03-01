import Entities from "@domentities"

export interface IOpenidContextProvider {
    Getopenidendpoints: () => Entities.AppContext.Openid | undefined
    Setopenidendpoints: (value: Entities.AppContext.Openid | undefined) => void

}

export interface IOpenidContextConsumer {
    openidendpoints: Entities.AppContext.Openid | undefined
}