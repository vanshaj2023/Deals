"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
var Navbar_1 = __importDefault(require("@/components/Navbar"));
require("./globals.css");
var google_1 = require("next/font/google");
var nextjs_1 = require("@clerk/nextjs");
var inter = (0, google_1.Inter)({ subsets: ['latin'] });
var spaceGrotesk = (0, google_1.Space_Grotesk)({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});
exports.metadata = {
    title: 'Pricewise',
    description: 'Track product prices effortlessly and save money on your online shopping.',
};
function RootLayout(_a) {
    var children = _a.children;
    return (<nextjs_1.ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main className="max-w-10xl mx-auto">
            <Navbar_1.default />
            {children}
          </main>
        </body>
      </html>
    </nextjs_1.ClerkProvider>);
}
exports.default = RootLayout;
