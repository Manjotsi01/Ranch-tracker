"use strict";
// server/src/utils/response.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, status = 200) => {
    res.status(status).json({ success: true, data });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, status = 400, errors) => {
    const body = { success: false, message };
    if (errors?.length)
        body.errors = errors;
    res.status(status).json(body);
};
exports.sendError = sendError;
