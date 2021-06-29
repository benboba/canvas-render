export const mixin = (derivedCtor: any, baseCtor: any) => {
	Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
		Object.defineProperty(
			derivedCtor.prototype,
			name,
			Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
		);
	});
};
