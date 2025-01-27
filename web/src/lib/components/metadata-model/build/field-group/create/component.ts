import Misc from '$src/lib/miscellaneous'
import Theme from '$src/lib/theme'
import { LitElement, unsafeCSS, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'

@customElement('metadata-model-build-field-group-create')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: String }) groupKey!: string
	@property({ type: String }) color!: Theme.Color
	@property({ type: Number }) indexingroupreadorderoffields: number = -1
	@property({ attribute: false }) createfieldgroup!: (groupKey: string, fieldGroupName: string, isField: boolean, objectIndexInGroupReadOrderOfFields: number) => void

	@state() private _fieldGroupNameKey: string = ''
	@state() _fieldGroupNameKeyError: string | null = null
	private readonly DEFAULT_FIELDGROUPNAMEKEY_ERROR = 'Name/Key must be at least one character in length...'
	private _isFieldGroupNameKeyValid = () => this._fieldGroupNameKey.length > 1

	@state() private _isField: boolean = true

	private _handleCreateFieldGroup() {
		if (!this._isFieldGroupNameKeyValid()) {
			this._fieldGroupNameKeyError = this.DEFAULT_FIELDGROUPNAMEKEY_ERROR
			return
		}
		this.createfieldgroup(this.groupKey, this._fieldGroupNameKey, this._isField, this.indexingroupreadorderoffields)
		this._fieldGroupNameKey = ''
	}

	constructor() {
		super()
		this.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				this._handleCreateFieldGroup()
			}
		})
	}

	protected render(): unknown {
		return html`
			<div class="join max-md:join-vertical">
				<input
					class="flex-[3] join-item input max-md:min-h-[50px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
					type="text"
					placeholder="Enter Field Group Name (Will be used as key)..."
					.value=${this._fieldGroupNameKey}
					@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						this._fieldGroupNameKey = e.currentTarget.value
						if (this._isFieldGroupNameKeyValid()) {
							this._fieldGroupNameKeyError = null
						} else {
							this._fieldGroupNameKeyError = this.DEFAULT_FIELDGROUPNAMEKEY_ERROR
						}
					}}
				/>
				<select
					class="flex-1 join-item select ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'}"
					@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
						this._isField = e.currentTarget.value === 'true' ? true : false
					}}
					.value=${`${this._isField}`}
				>
					<option value="true" .selected=${this._isField === true}>Field</option>
					<option value="false" .selected=${this._isField === false}>Group</option>
				</select>
				<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} md:w-fit h-fit p-0" @click=${this._handleCreateFieldGroup}>
					<span class="md:hidden">Create Field/Group</span>
					<iconify-icon icon="mdi:plus" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('38')} height=${Misc.IconifySize('38')}></iconify-icon>
				</button>
			</div>
			${(() => {
				if (this._fieldGroupNameKeyError !== null) {
					return html`
						<div class="label">
							<span class="label-text text-error">${this._fieldGroupNameKeyError}</span>
						</div>
					`
				}
				return nothing
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-build-field-group-create': Component
	}
}
