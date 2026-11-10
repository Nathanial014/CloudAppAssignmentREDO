"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lambdas/auth/signout.ts
var signout_exports = {};
__export(signout_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(signout_exports);

// lambdas/shared/auth-utils.ts
var import_client_cognito_identity_provider = require("@aws-sdk/client-cognito-identity-provider");

// lambdas/shared/http.ts
var response = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { "content-type": "application/json", ...headers },
  body: JSON.stringify(body)
});

// lambdas/shared/auth-utils.ts
var cognito = new import_client_cognito_identity_provider.CognitoIdentityProviderClient({ region: process.env.REGION });
var clientId = process.env.CLIENT_ID;

// lambdas/auth/signout.ts
var handler = async () => response(
  200,
  { message: "Signed out" },
  { "set-cookie": "token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None" }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
