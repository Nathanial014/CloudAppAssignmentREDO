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

// lambdas/auth/confirm-signup.ts
var confirm_signup_exports = {};
__export(confirm_signup_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(confirm_signup_exports);
var import_client_cognito_identity_provider2 = require("@aws-sdk/client-cognito-identity-provider");

// lambdas/shared/auth-utils.ts
var import_client_cognito_identity_provider = require("@aws-sdk/client-cognito-identity-provider");

// lambdas/shared/http.ts
var response = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { "content-type": "application/json", ...headers },
  body: JSON.stringify(body)
});
var isResponse = (value) => "statusCode" in value;
var parseJsonObject = (event) => {
  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return response(400, { message: "Request body must be valid JSON" });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return response(400, { message: "Request body must be a JSON object" });
  }
  return body;
};

// lambdas/shared/auth-utils.ts
var cognito = new import_client_cognito_identity_provider.CognitoIdentityProviderClient({ region: process.env.REGION });
var clientId = process.env.CLIENT_ID;
var parseBody = (event, fields) => {
  const body = parseJsonObject(event);
  if (isResponse(body)) return body;
  const missing = fields.filter((f) => typeof body[f] !== "string" || body[f] === "");
  if (missing.length) {
    return response(400, { message: `Missing or invalid fields: ${missing.join(", ")}` });
  }
  return body;
};
var cognitoErrorStatus = {
  NotAuthorizedException: 401,
  UserNotFoundException: 401,
  UserNotConfirmedException: 403,
  UsernameExistsException: 409,
  InvalidPasswordException: 400,
  InvalidParameterException: 400,
  CodeMismatchException: 400,
  ExpiredCodeException: 400,
  TooManyRequestsException: 429,
  TooManyFailedAttemptsException: 429,
  LimitExceededException: 429
};
var cognitoErrorResponse = (err) => {
  const name = err.name;
  const status = cognitoErrorStatus[name];
  if (!status) {
    console.error("Unexpected Cognito error:", err);
    return response(500, { message: "Internal server error" });
  }
  const message = name === "UserNotFoundException" ? "Incorrect username or password." : err.message;
  return response(status, { message, error: name });
};

// lambdas/auth/confirm-signup.ts
var handler = async (event) => {
  const body = parseBody(event, ["username", "code"]);
  if (isResponse(body)) return body;
  try {
    await cognito.send(
      new import_client_cognito_identity_provider2.ConfirmSignUpCommand({
        ClientId: clientId,
        Username: body.username,
        ConfirmationCode: body.code
      })
    );
    return response(200, { message: "User confirmed. You can now sign in.", username: body.username });
  } catch (err) {
    return cognitoErrorResponse(err);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
