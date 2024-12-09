"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var Wishlist = function () {
    var _a = (0, react_1.useState)([]), wishlist = _a[0], setWishlist = _a[1];
    var handleWishlistToggle = function (product) {
        setWishlist(function (prevWishlist) {
            if (prevWishlist.find(function (item) { return item.id === product.id; })) {
                return prevWishlist.filter(function (item) { return item.id !== product.id; });
            }
            else {
                return __spreadArray(__spreadArray([], prevWishlist, true), [product], false);
            }
        });
    };
    return (<div>
      <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
      <div className="grid grid-cols-1 gap-4">
        {wishlist.map(function (product) { return (<div key={product.id} className="border p-4">
            <h2 className="text-xl">{product.name}</h2>
            {/* <ProductHeart product={product} onWishlistToggle={handleWishlistToggle} /> */}
          </div>); })}
      </div>
    </div>);
};
exports.default = Wishlist;
