const ApiResponseCodes = {
    OK: 200,                            
    CREATED: 201,                       
    ACCEPTED: 202,                      
    NO_CONTENT: 204,                   
    BAD_REQUEST: 400,                 
    UNAUTHORIZED: 401,                
    FORBIDDEN: 403,                    
    NOT_FOUND: 404,                  
    METHOD_NOT_ALLOWED: 405,         
    CONFLICT: 409,                    
    UNPROCESSABLE_ENTITY: 422,       
    INTERNAL_SERVER_ERROR: 500,       
    NOT_IMPLEMENTED: 501,            
    SERVICE_UNAVAILABLE: 503,         
    GATEWAY_TIMEOUT: 504,
    JWT_TOKEN_INVALID: 401,           
    JWT_TOKEN_EXPIRED: 401,           
    UNKNOWN_ERROR_SHOW_TO_USER: 500   
}

const ApiErrorMessages = {
    BAD_REQUEST: "Bad Request: The server could not understand the request due to invalid syntax.",
    UNAUTHORIZED: "Unauthorized: Authentication is required or has failed.",
    FORBIDDEN: "Forbidden: The server understood the request, but refuses to authorize it.",
    NOT_FOUND: "Not Found: The requested resource could not be found.",
    METHOD_NOT_ALLOWED: "Method Not Allowed: The HTTP method used is not supported for the requested resource.",
    CONFLICT: "Conflict: The request could not be completed due to a conflict with the current state of the resource.",
    UNPROCESSABLE_ENTITY: "Unprocessable Entity: The server understands the content type of the request entity, but was unable to process the contained instructions.",
    INTERNAL_SERVER_ERROR: "Internal Server Error: The server encountered an unexpected condition that prevented it from fulfilling the request.",
    SERVICE_UNAVAILABLE: "Service Unavailable: The server is currently unable to handle the request due to temporary overloading or maintenance.",
    JWT_TOKEN_INVALID: "Invalid Token: The provided JWT token is invalid.",
    JWT_TOKEN_EXPIRED: "Token Expired: The provided JWT token has expired.",
    UNKNOWN_ERROR: "An unknown error occurred. Please try again later."
}

function sendResponse(res, body) {
    res.setHeader('Content-Type', 'application/json')
    res.send(body)
}

function sendSuccessResponse(res, okBody) {
    sendResponse(res, okBody)
}

function sendErrorResponse(res, errorBody) {
    if (!errorBody) {
        errorBody = new Object()
    }
    sendResponse(res, errorBody)
}
module.exports =  {sendErrorResponse , sendSuccessResponse , ApiErrorMessages , ApiResponseCodes}