export interface ISpaPageNavigation {
	Navigate: (targetElement: Element, url: URL, title: string | undefined) => Promise<void>
	AddHistoryState: (targetElement: Element, url: URL, title: string | undefined) => void
	HandlePopState: (e: PopStateEvent) => Promise<void>
}
