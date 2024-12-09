"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var server_1 = require("@clerk/nextjs/server");
var isProtectedRoute = (0, server_1.createRouteMatcher)(['/dashboard(.*)', '/forum(.*)', "/"]);
exports.default = (0, server_1.clerkMiddleware)(function (auth, req) {
    if (isProtectedRoute(req))
        auth().protect();
});
exports.config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
