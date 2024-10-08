export function expandRegEx(regEx: any): any;
export function getRegEx(queryStr: any, phrase?: boolean): any;
export function applyRecursive(parentObj: any, parentKey: any, obj: any, cb: any): any;
export function replaceById(obj: any): string;
export function dateToFilenameSuffix(date: Date): string;
export function stringToFilenameSuffix(str: string): string;
export function getTimestampString(): string;
export function preBSONSerialization(obj: any): any;
export function postBSONDeserialization(obj: any): any;
export function getMessageFromBlob(blob: Blob, postProcessByDefault: boolean): Promise<any>;
export function getNotConvertWrapper(obj: any): any;
export function logMemoryUsage(logEntryHeader: string): string;