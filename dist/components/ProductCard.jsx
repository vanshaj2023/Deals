"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var image_1 = __importDefault(require("next/image"));
var link_1 = __importDefault(require("next/link"));
var react_1 = __importDefault(require("react"));
var ProductCard = function (_a) {
    var product = _a.product;
    return (<link_1.default href={"/products/".concat(product._id)} className="product-card">
      <div className="product-card_img-container">
        <image_1.default src={product.image} alt={product.title} width={200} height={200} className="product-card_img"/>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="product-title">{product.title}</h3>

        <div className="flex justify-between">
          <p className="text-black opacity-50 text-lg capitalize">
            {product.category}
          </p>

          <p className="text-black text-lg font-semibold">
            <span>{product === null || product === void 0 ? void 0 : product.currency}</span>
            <span>{product === null || product === void 0 ? void 0 : product.currentPrice}</span>
          </p>
        </div>
      </div>
    </link_1.default>);
};
exports.default = ProductCard;
