export const makeArray = <T>(target: T | T[]): T[] => Array.isArray(target) ? target : [target];