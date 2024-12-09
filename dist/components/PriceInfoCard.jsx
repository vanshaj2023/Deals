"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var image_1 = __importDefault(require("next/image"));
var PriceInfoCard = function (_a) {
    var title = _a.title, iconSrc = _a.iconSrc, value = _a.value;
    return (<div className={"price-info_card"}>
      <p className="text-base text-black-100">{title}</p>

      <div className="flex gap-1">
        <image_1.default src={iconSrc} alt={title} width={24} height={24}/>

        <p className="text-2xl font-bold text-secondary">{value}</p>
      </div>
    </div>);
};
exports.default = PriceInfoCard;
