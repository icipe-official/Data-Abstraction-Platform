import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Entities from '@domentities'
import Url from '@lib/url'
import { IAppContextConsumer } from '@dominterfaces/context/app'
import { AppContextConsumer } from '@interfaces/context/app'
import Log from '@lib/log'

@customElement('storage-file-view')
class ViewFile extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) data!: Entities.StorageFiles.Interface

	private _appContext: IAppContextConsumer

	constructor() {
		super()
		this._appContext = new AppContextConsumer(this)
	}

	protected render(): unknown {
		if (!this.data.id || this.data.id.length === 0) {
			return html`
				<div class="flex-1 flex flex-col justify-center items-center">
					<span class="w-fit text-error font-bold">${Entities.StorageFiles.FieldColumn.ID} is not valid.</span>
				</div>
			`
		}

		const srcUrl = new URL(`${Url.ApiUrlPaths.Storage.Files}/${this.data.id[0]}`)
		srcUrl.searchParams.append(Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this._appContext.Getauthcontextdirectorygroupid())
		Log.Log(Log.Level.DEBUG, this.localName, srcUrl)

		return html`
			${(() => {
				if (this.data?.storage_file_mime_type) {
					if (this.data?.storage_file_mime_type![0]?.startsWith('image/')) {
						return html` <img src=${srcUrl.toString()} alt=${this.data.original_name ? this.data.original_name[0] : 'image'} /> `
					}

					if (this.data?.storage_file_mime_type![0]?.startsWith('audio/')) {
						return html` <audio controls src=${srcUrl.toString()}></audio> `
					}

					if (this.data?.storage_file_mime_type![0]?.startsWith('video/')) {
						return html`
							<video controls>
								<source src=${srcUrl.toString()} />
								<track kind="captions" />
							</video>
						`
					}
				}
				
				return html`<iframe src=${srcUrl.toString()} title=${this.data.original_name ? this.data.original_name[0] : 'file'} height="100%" width="100%"></iframe>`
			})()}
			<a class="btn btn-primary w-full" href=${`${srcUrl.toString()}`} target="_blank"> download file </a>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'storage-file-view': ViewFile
	}
}
