type LogArgument = any;
type Extra = any;
type Callback = (a: any, b: any) => void;
type LogResult = { uuid: string };

const rollbarLogLocal = (logFunction: (...data: any[]) => void, obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => {
    if (extra === undefined) logFunction(obj);
    else logFunction(obj, extra);

    callback?.(null, {});
    return {uuid: ""};
};

export const rollbar = {
    log: (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.log, obj, extra, callback),
    debug: (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.debug, obj, extra, callback),
    info: (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.info, obj, extra, callback),
    warning: (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.warn, obj, extra, callback),
    error: (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.error, obj, extra, callback),
    critical: (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.error, obj, extra, callback),
}
