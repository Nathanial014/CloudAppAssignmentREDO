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

// lambdas/app/add-movie-role.ts
var add_movie_role_exports = {};
__export(add_movie_role_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(add_movie_role_exports);
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");

// lambdas/shared/db.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");

// lambdas/shared/model.ts
var movieKey = (movieId) => `m#${movieId}`;
var actorKey = (actorId) => `a#${actorId}`;

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

// lambdas/app/add-movie-role.ts
var handler = async (event) => {
  const body = parseJsonObject(event);
  if (isResponse(body)) return body;
  const role = {
    movieId: body.movieId,
    actorId: body.actorId,
    roleName: body.roleName,
    roleDescription: body.roleDescription
  };
  if (!role.movieId || !role.actorId || !role.roleName || !role.roleDescription) {
    return response(400, { message: "movieId, actorId, roleName, and roleDescription are required" });
  }
  try {
    await ddb.send(
      new import_lib_dynamodb2.TransactWriteCommand({
        TransactItems: [
          {
            ConditionCheck: {
              TableName: tableName,
              Key: {
                PK: movieKey(role.movieId),
                SK: movieKey(role.movieId)
              },
              ConditionExpression: "attribute_exists(PK)"
            }
          },
          {
            ConditionCheck: {
              TableName: tableName,
              Key: {
                PK: actorKey(role.actorId),
                SK: actorKey(role.actorId)
              },
              ConditionExpression: "attribute_exists(PK)"
            }
          },
          {
            Put: {
              TableName: tableName,
              Item: {
                PK: movieKey(role.movieId),
                SK: actorKey(role.actorId),
                ...role
              }
            }
          }
        ]
      })
    );
    return response(201, {
      message: "Role added",
      data: role
    });
  } catch (err) {
    console.error("DynamoDB error:", err);
    return response(500, {
      message: "Internal server error",
      error: err
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
