/*
 * 文本类
 */

import Sprite, { SpriteOption, HitTestResult } from './sprite';
import Point from '../geom/point';
import Rectangle from '../geom/rectangle';
import CEvent from '../event/event';

interface TextCacheItem {
	text: string;
	width: number;
}

interface TextContentOption extends SpriteOption {
	text?: string;
	width?: number | string;
	style?: TextContentStyle;
}

interface TextContentStyle {
	color: string;
	fontFamily: string;
	fontSize: string;
	fontStyle: string;
	fontWeight: string;
	lineHeight: string;
	textAlign: string;
	textOverflow: string;
	whiteSpace: string;
};

const nowrapReg: RegExp = /(\n|[\x00-\xff]{2,}|[“‘《｛【（{\(\[\x00-\xff]+[\u4e00-\u9fa5][，。、”’》｝】）}\]\)？！…—\x00-\xff]*|[“‘《｛【（{\(\[\x00-\xff]*[\u4e00-\u9fa5][，。、”’》｝】）}\]\)？！…—\x00-\xff]+)/;

/*
 * 文本格式化，将输入字符串的第一组换行不截断字符提取出来并返回结果
 * @param str {String} 输入字符串
 * @return result {Array} 返回数组，0为不截断字符之前的内容，1为不截断字符串，2为不截断字符之后的内容
 */
function getNowrapText(str: string): string[] {
	let result: string[] = [],
		nowrap_pos: number = str.search(nowrapReg);
	if (nowrap_pos >= 0) {
		result.push(str.substr(0, nowrap_pos));
		let nowrap_str: string = RegExp.$1;
		result.push(nowrap_str);
		result.push(str.substr(nowrap_pos + nowrap_str.length));
	} else {
		result.push(str);
	}
	return result;
}

/*
 * 默认样式
 */
let defaultStyle: TextContentStyle = {
	color: '#000',
	fontFamily: 'Microsoft Yahei',
	fontSize: '12px',
	fontStyle: 'normal',
	fontWeight: 'normal',
	lineHeight: '1.2',
	textAlign: 'left',
	textOverflow: '',
	whiteSpace: ''
};

class TextContent extends Sprite {
	constructor(option: TextContentOption = {}) {
		super(option);

		this._text = option.text || '';
		this._width = option.width || 'auto';
		this._style = Object.assign({}, defaultStyle, option.style || {});
	}

	protected keyReg = /x|y|name|alpha|visible|pointerEvents|parent|stage|extraRender|extraHitTest|transform|text|width/;

	private _style: TextContentStyle;
	style(key: any, val: string): string {
		if (typeof key === 'string') {
			if (!val) {
				return this._style[key as keyof TextContentStyle];
			} else {
				this._style[key as keyof TextContentStyle] = val;
			}
		} else if (typeof key === 'object') {
			for (let k in key) {
				this.style(k, key[k]);
			}
		}
		return '';
	}

	private _text: string = '';
	get text(): string {
		return this._text;
	}
	set text(_t: string) {
		if (this._text !== _t) {
			this._text = _t;
			if (this.stage) {
				this.formatText();
				this.repaint = true;
			}
		}
	}

	private _width: string | number = 'auto';
	private realWidth: number = 0;
	private realHeight: number = 0;
	get width(): string | number {
		return this._width;
	}
	set width(_w: string | number) {
		if ((typeof _w === 'number' || _w === 'auto') && this._width !== _w) {
			this._width = _w;
			if (typeof _w === 'number') {
				this.realWidth = _w as number;
			}
		}
	}

	private textCache?: {
		text: string;
		width: number;
	}[][];

	addedToStage(): void {
		super.addedToStage();
		if (this.stage) {
			this.formatText();
			this.repaint = true;
		}
	}

	// 格式化文本
	formatText(): TextContent {
		const result: TextContent['textCache'] = [
			[]
		];
		const text = this.text;
		let lineId: number = 0;
		let lineWidth: number = 0;
		let subitem = '';
		const tmp = document.createElement('canvas');
		const tmpCtx = tmp.getContext('2d') as CanvasRenderingContext2D;

		tmpCtx.font = `${this._style.fontStyle} ${this._style.fontWeight} ${this._style.fontSize} ${this._style.fontFamily}`;
		const full_width = tmpCtx.measureText('一').width;

		let formatTextLine = (str: string) => {
			const newItem = getNowrapText(str);
			let charAt: string;

			let width = this.realWidth;
			let charCode: number;
			let charWidth: number;
			let textObj: TextCacheItem | void;

			for (let ti: number = 0, tl: number = newItem[0].length; ti < tl; ti++) {

				charCode = newItem[0].charCodeAt(ti);
				charAt = newItem[0].charAt(ti);
				charWidth = (charCode > 255) ? full_width : tmpCtx.measureText(charAt).width;

				if (lineWidth + charWidth <= width || !lineWidth) {

					subitem += charAt;
					lineWidth += charWidth;

				} else {

					if (subitem) {
						textObj = {
							text: subitem,
							width: tmpCtx.measureText(subitem).width
						};
						result[lineId].push(textObj);
					}
					lineWidth = charWidth;

					if (this._style.whiteSpace === 'nowrap') {

						if (this._style.textOverflow === 'ellipsis' && textObj) {

							let sub: string = textObj.text.substr(-1);
							if (sub.charCodeAt(0) > 255) {
								textObj.text = textObj.text.substr(0, textObj.text.length - 1);
							} else {
								textObj.text = textObj.text.substr(0, textObj.text.length - 2);
							}
							textObj.text += '…';

						}

						subitem = '';
						newItem[1] = '';
						break;

					} else {

						result[++lineId] = [];
						subitem = charAt;

					}

				}
			}

			if (newItem[1]) {

				charAt = newItem[1];
				charWidth = tmpCtx.measureText(charAt).width;

				if (lineWidth + charWidth <= width || !lineWidth) {

					subitem += charAt;
					lineWidth += charWidth;

				} else {

					textObj = {
						text: subitem,
						width: tmpCtx.measureText(subitem).width
					};
					result[lineId].push(textObj);

					if (this._style.whiteSpace === 'nowrap') {

						if (this._style.textOverflow === 'ellipsis') {

							let sub = textObj.text.substr(-1);
							if (sub.charCodeAt(0) > 255) {
								textObj.text = textObj.text.substr(0, textObj.text.length - 1);
							} else {
								textObj.text = textObj.text.substr(0, textObj.text.length - 2);
							}
							textObj.text += '…';

						}
						newItem[2] = '';

					} else {

						result[++lineId] = [];
						textObj = {
							text: charAt,
							width: Math.ceil(charWidth)
						};
						result[lineId].push(textObj);

					}

					subitem = '';
					lineWidth = charWidth;
				}

				if (newItem[2]) {
					formatTextLine(newItem[2]);
				}
			}

			if (subitem) {
				textObj = {
					text: subitem,
					width: tmpCtx.measureText(subitem).width
				};
				result[lineId].push(textObj);
				subitem = '';
			}
		};


		if (this.width === 'auto') {
			let measure_width: number = tmpCtx.measureText(text).width;
			result[0].push({
				text: text,
				width: measure_width
			});
			this.realWidth = measure_width;
		} else {
			formatTextLine(this.text);
		}

		this.realHeight = Math.round(result.length * parseFloat(this._style.lineHeight) * parseFloat(this._style.fontSize));
		this.textCache = result;

		return this;
	}

	hitTest(point: Point, x: number = 0, y: number = 0): HitTestResult {
		if (!this.stage || !this.visible || !this.pointerEvents) return {
			target: null
		};

		if (point.hitTest(this.getHitTestArea(x, y))) {
			return {
				target: this
			};
		}

		return {
			target: null
		};
	}

	getHitTestArea(x: number = 0, y: number = 0): Rectangle {
		x += this.x;
		y += this.y;

		return new Rectangle(x, y, this.realWidth, this.realHeight);
	}

	// 渲染文字和行距时要乘2
	render() {
		super.render();
		let width: number = this.realWidth,
			text_start: number = 0,
			lineHeight: number = parseFloat(this._style.lineHeight) * parseFloat(this._style.fontSize),
			textAlign: string = this._style.textAlign;

		this.stage!.ctx.textAlign = textAlign as CanvasTextAlign;
		if (textAlign === 'center') {
			text_start += Math.round(width / 2);
		} else if (textAlign === 'right') {
			text_start += width;
		}
		this.stage!.ctx.textBaseline = 'middle';
		this.stage!.ctx.fillStyle = this._style.color;
		this.stage!.ctx.font = `${this._style.fontStyle} ${this._style.fontWeight} ${this._style.fontSize} ${this._style.fontFamily}`;

		if (this.textCache && this.textCache.length) {
			const ll = this.textCache.length;
			for (let li: number = 0; li < ll; li++) {
				let line_start: number = text_start,
					line_width: number = 0;

				if (textAlign === 'center') {

					for (let wi: number = 0, wl: number = this.textCache[li].length; wi < wl; wi++) {
						line_width += this.textCache[li][wi].width;
					}
					line_start -= line_width / 2;

				} else if (textAlign === 'right') {

					for (let wi: number = 1, wl: number = this.textCache[li].length; wi < wl; wi++) {
						line_width += this.textCache[li][wi].width;
					}
					line_start -= line_width;

				}

				for (let ti: number = 0, tl: number = this.textCache[li].length; ti < tl; ti++) {
					let text_item = this.textCache[li][ti];
					if (textAlign === 'right' && ti > 0) {
						line_start += text_item.width;
					} else if (textAlign === 'center') {
						line_start += Math.round(text_item.width / 2);
					}

					this.stage!.ctx.fillText(text_item.text, line_start, Math.round((li + 0.5) * lineHeight));

					if (textAlign !== 'center' && textAlign !== 'right') {
						line_start += text_item.width;
					} else if (textAlign === 'center') {
						line_start += Math.round(text_item.width / 2);
					}
				}
			}
		}
	}
}

export default TextContent;
