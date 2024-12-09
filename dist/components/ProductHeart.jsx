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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var image_1 = __importDefault(require("next/image"));
var ProductHeart = function (_a) {
    var product = _a.product, onWishlistToggle = _a.onWishlistToggle;
    var _b = (0, react_1.useState)(false), isWishlisted = _b[0], setIsWishlisted = _b[1];
    var _c = (0, react_1.useState)(product.reviewsCount), reviewsCount = _c[0], setReviewsCount = _c[1];
    var handleWishlistToggle = function () {
        setIsWishlisted(!isWishlisted);
        setReviewsCount(isWishlisted ? reviewsCount - 1 : reviewsCount + 1);
        onWishlistToggle(product);
    };
    return (<div className="product-hearts flex items-center gap-3" onClick={handleWishlistToggle} style={{ cursor: 'pointer' }}>
      <image_1.default src={isWishlisted ? "/assets/icons/black1-heart.svg" : "/assets/icons/red-heart.svg"} alt="heart" width={20} height={20}/>
      <p className="text-base font-semibold text-[#D46F77]">
        {reviewsCount}
      </p>
    </div>);
};
exports.default = ProductHeart;
