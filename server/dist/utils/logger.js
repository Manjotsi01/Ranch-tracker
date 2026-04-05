"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = (level, msg, ...args) => {
    const ts = new Date().toISOString();
    const extra = args.length
        ? ' ' + args.map(a => (a instanceof Error ? a.stack : String(a))).join(' ')
        : '';
    const line = `[${level}] ${ts} — ${msg}${extra}`;
    if (level === 'ERROR')
        console.error(line);
    else if (level === 'WARN')
        console.warn(line);
    else
        console.log(line);
};
const logger = {
    info: (msg, ...a) => log('INFO', msg, ...a),
    warn: (msg, ...a) => log('WARN', msg, ...a),
    error: (msg, ...a) => log('ERROR', msg, ...a),
    debug: (msg, ...a) => log('DEBUG', msg, ...a),
};
exports.default = logger;
