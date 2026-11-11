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

// lambdas/app/get-actor.ts
var get_actor_exports = {};
__export(get_actor_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(get_actor_exports);
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");

// lambdas/shared/db.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");

// lambdas/shared/model.ts
var actorKey = (actorId) => `a#${actorId}`;
var toActor = ({ actorId, name, dateOfBirth, bio }) => ({
  actorId,
  name,
  dateOfBirth,
  bio
});
var parseId = (value) => value !== void 0 && /^[1-9]\d*$/.test(value) ? Number(value) : void 0;

// lambdas/shared/db.ts
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(
  new import_client_dynamodb.DynamoDBClient({ region: process.env.REGION }),
  { marshallOptions: { removeUndefinedValues: true } }
);
var tableName = process.env.TABLE_NAME;

// lambdas/shared/http.ts
var response = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { "content-type": "application/json", ...headers },
  body: JSON.stringify(body)
});

// lambdas/shared/request-logger.ts
var logRequest = (event) => {
  const username = event.requestContext.authorizer?.claims?.["cognito:username"] ?? "anonymous";
  const params = Object.entries(event.queryStringParameters ?? {}).filter(
    (entry) => entry[1] !== void 0
  );
  const query = params.length ? `?${new URLSearchParams(params)}` : "";
  console.log(`${username}   ${event.path}${query}`);
};

// lambdas/app/get-actor.ts
var handler = async (event) => {
  logRequest(event);
  const actorId = parseId(event.pathParameters?.actorID);
  if (actorId === void 0) {
    return response(400, { message: "actorID must be a positive integer" });
  }
  const movieParam = event.queryStringParameters?.movie;
  const movieId = parseId(movieParam);
  if (movieParam !== void 0 && movieId === void 0) {
    return response(400, { message: "movie must be a positive integer" });
  }
  try {
    const actorResult = await ddb.send(
      new import_lib_dynamodb2.GetCommand({
        TableName: tableName,
        Key: { PK: actorKey(actorId), SK: actorKey(actorId) }
      })
    );
    if (!actorResult.Item) {
      return response(404, { message: `Actor ${actorId} not found` });
    }
    const actor = toActor(actorResult.Item);
    if (movieId === void 0) {
      return response(200, {
        data: actor
      });
    }
    const roleResult = await ddb.send(
      new import_lib_dynamodb2.GetCommand({
        TableName: tableName,
        Key: {
          PK: `m#${movieId}`,
          SK: `a#${actorId}`
        }
      })
    );
    return response(200, {
      data: {
        actor,
        role: roleResult.Item ? {
          roleName: roleResult.Item.roleName,
          roleDescription: roleResult.Item.roleDescription
        } : null
      }
    });
  } catch (err) {
    console.error("DynamoDB error:", err);
    return response(500, { message: "Internal server error", error: err });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
