"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nextjs_1 = require("@clerk/nextjs");
function Page() {
    return (<div className='flex justify-center items-center h-screen '>
            <nextjs_1.SignIn />
        </div>);
}
exports.default = Page;
