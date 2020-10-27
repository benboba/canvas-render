import { HitTestResult } from '../display/sprite';
import { CEvent } from '../event/event';
import { Point } from '../geom/point';
import { Rectangle } from '../geom/rectangle';

export interface IFn<T extends any[] = any[], R = any> {
	(...args: T): R;
}

export type TEmptyFn = IFn<[], void>;

export interface IEventObject {
	type: string; // 事件类型
	namespace: string[]; // 命名空间
	callback: (ev: CEvent) => void | boolean; // 回调
	locked: boolean; // 是否加锁，加锁后只能精确移除
}

export interface IEventDispatcher {
	evCache: IEventObject[];
    addEventListener(eventname: string, callback: IEventObject['callback'], priority?: boolean, locked?: boolean): this;
    on(eventname: string, callback: IEventObject['callback'], priority?: boolean, locked?: boolean): this;
    removeEventListener(eventname: string, callback?: IEventObject['callback'] | null, locked?: boolean): this;
    off(eventname: string, callback?: null, locked?: boolean): this;
    dispatchEvent(_ev: any, ...args: any[]): this;
    trigger(...args: any): this;
    parent?: ISprite | null;
    destroyEvent(): void;
}
export interface ISprite extends IEventDispatcher {
    readonly children: ISprite[];
    readonly numChildren: number;
    repaint: boolean;
    readonly depth: number;
    name: string;
    x: number;
    y: number;
    alpha: number;
    visible: boolean;
    pointerEvents: boolean;
    parent?: ISprite | null;
    stage?: IStage | null;
    hitTestArea?: Rectangle;
    extraRender: TEmptyFn | null;
    extraHitTest: IFn<any[], HitTestResult> | null;
    readonly transform: [number, number, number, number, number, number];
    attr(key: string | Record<string, string>, val?: string | null): string | this | null;
    setTransform(newtransform: string): ISprite;
    addedToStage(): void;
    prepareRender(): void;
    render(): void;
    hitTest(point: Point, x?: number, y?: number): HitTestResult;
    getHitTestArea(x?: number, y?: number): Rectangle;
    appendChild(...children: ISprite[]): ISprite;
    appendChildAt(el: ISprite, i: number): ISprite;
    remove(): ISprite;
    removeChild(el: ISprite): ISprite;
    removeChildAt(i: number): ISprite;
    removeChildren(): ISprite;
    getChildIndex(el: ISprite): number;
    setChildIndex(el: ISprite, i: number): ISprite;
    includeBy(el: ISprite): boolean;
    include(el: ISprite): boolean;
    getChildAt(i: number): ISprite | null;
    getChildrenByName(name: string): ISprite[];
    getChildrenByType(TypeClass: ClassDecorator): ISprite[];
    enableDrag(rect: Rectangle, size: Point): ISprite;
    disableDrag(): ISprite;
}

export interface IStage extends ISprite {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    ratioX: number;
    ratioY: number;
    _repaint: boolean;
    prepareRender(): void;
    hitTest(point: Point, x?: number, y?: number): HitTestResult;
    paint(): void;
    remove(): IStage;
}
