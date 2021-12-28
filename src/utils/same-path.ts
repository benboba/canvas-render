import { TPathItem } from '../types/geom';

export const samePath = (path1: TPathItem, path2: TPathItem) => path1.type === path2.type && path1.val.join(',') === path2.val.join(',');
