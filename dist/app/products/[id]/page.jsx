"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Modal_1 = __importDefault(require("@/components/Modal"));
var PriceInfoCard_1 = __importDefault(require("@/components/PriceInfoCard"));
var ProductCard_1 = __importDefault(require("@/components/ProductCard"));
var actions_1 = require("@/lib/actions");
var utils_1 = require("@/lib/utils");
var image_1 = __importDefault(require("next/image"));
var link_1 = __importDefault(require("next/link"));
var navigation_1 = require("next/navigation");
var ProductDetails = function (_a) {
    var id = _a.params.id;
    return __awaiter(void 0, void 0, void 0, function () {
        var product, similarProducts;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, actions_1.getProductById)(id)];
                case 1:
                    product = _c.sent();
                    if (!product)
                        (0, navigation_1.redirect)('/');
                    return [4 /*yield*/, (0, actions_1.getSimilarProducts)(id)];
                case 2:
                    similarProducts = _c.sent();
                    // const handleWishlistToggle = (product1: { id: string; name: string; initialReviewsCount: number }) => {
                    //   console.log('Toggled wishlist for product:', product); // Additional logic to handle wishlist can go here
                    // }
                    return [2 /*return*/, (<div className="product-container">
      <div className="flex gap-28 xl:flex-row flex-col">
        <div className="product-image">
          <image_1.default src={product.image} alt={product.title} width={580} height={400} className="mx-auto"/>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] text-secondary font-semibold">
                {product.title}
              </p>

              <link_1.default href={product.url} target="_blank" className="text-base text-black opacity-50">
                Visit Product
              </link_1.default>
            </div>

            <div className="flex items-center gap-3">
              <div className="product-hearts">
                <image_1.default src="/assets/icons/red-heart.svg" alt="heart" width={20} height={20}/>

                <p className="text-base font-semibold text-[#D46F77]">
                  {product.reviewsCount}
                </p>
              </div>
              {/* <ProductHeart product={product} onWishlistToggle={handleWishlistToggle}/> */}


              <div className="p-2 bg-white-200 rounded-10">
                <image_1.default src="/assets/icons/bookmark.svg" alt="bookmark" width={20} height={20}/>
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <image_1.default src="/assets/icons/share.svg" alt="share" width={20} height={20}/>
              </div>
            </div>
          </div>

          <div className="product-info">
            <div className="flex flex-col gap-2">
              <p className="text-[34px] text-secondary font-bold">
                {product.currency} {(0, utils_1.formatNumber)(product.currentPrice)}
              </p>
              <p className="text-[21px] text-black opacity-50 line-through">
                {product.currency} {(0, utils_1.formatNumber)(product.originalPrice)}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="product-stars">
                  <image_1.default src="/assets/icons/star.svg" alt="star" width={16} height={16}/>
                  <p className="text-sm text-primary-orange font-semibold">
                    {product.stars || '25'}
                  </p>
                </div>

                <div className="product-reviews">
                  <image_1.default src="/assets/icons/comment.svg" alt="comment" width={16} height={16}/>
                  <p className="text-sm text-secondary font-semibold">
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>

              <p className="text-sm text-black opacity-50">
                <span className="text-primary-green font-semibold">93% </span> of
                buyers have recommeded this.
              </p>
            </div>
          </div>

          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
              <PriceInfoCard_1.default title="Current Price" iconSrc="/assets/icons/price-tag.svg" value={"".concat(product.currency, " ").concat((0, utils_1.formatNumber)(product.currentPrice))}/>
              <PriceInfoCard_1.default title="Average Price" iconSrc="/assets/icons/chart.svg" value={"".concat(product.currency, " ").concat((0, utils_1.formatNumber)(product.averagePrice))}/>
              <PriceInfoCard_1.default title="Highest Price" iconSrc="/assets/icons/arrow-up.svg" value={"".concat(product.currency, " ").concat((0, utils_1.formatNumber)(product.highestPrice))}/>
              <PriceInfoCard_1.default title="Lowest Price" iconSrc="/assets/icons/arrow-down.svg" value={"".concat(product.currency, " ").concat((0, utils_1.formatNumber)(product.lowestPrice))}/>
            </div>
          </div>

          <Modal_1.default productId={id}/>
        </div>
      </div>

      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl text-secondary font-semibold">
            Product Description
          </h3>

          <div className="flex flex-col gap-4">
            {(_b = product === null || product === void 0 ? void 0 : product.description) === null || _b === void 0 ? void 0 : _b.split('\n')}
          </div>
        </div>

        <button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
          <image_1.default src="/assets/icons/bag.svg" alt="check" width={22} height={22}/>

          <link_1.default href="/" className="text-base text-white">
            Buy Now
          </link_1.default>
        </button>
      </div>

      {similarProducts && (similarProducts === null || similarProducts === void 0 ? void 0 : similarProducts.length) > 0 && (<div className="py-14 flex flex-col gap-2 w-full">
          <p className="section-text">Similar Products</p>

          <div className="flex flex-wrap gap-10 mt-7 w-full">
            {similarProducts.map(function (product) { return (<ProductCard_1.default key={product._id} product={product}/>); })}
          </div>
        </div>)}
    </div>)];
            }
        });
    });
};
exports.default = ProductDetails;
