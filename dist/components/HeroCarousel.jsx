"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("react-responsive-carousel/lib/styles/carousel.min.css");
var react_responsive_carousel_1 = require("react-responsive-carousel");
var image_1 = __importDefault(require("next/image"));
var heroImages = [
    { imgUrl: '/assets/images/hero-1.svg', alt: 'smartwatch' },
    { imgUrl: '/assets/images/hero-2.svg', alt: 'bag' },
    { imgUrl: '/assets/images/hero-3.svg', alt: 'lamp' },
    { imgUrl: '/assets/images/hero-4.svg', alt: 'air fryer' },
    { imgUrl: '/assets/images/hero-5.svg', alt: 'chair' },
];
var HeroCarousel = function () {
    return (<div className="hero-carousel">
      <react_responsive_carousel_1.Carousel showThumbs={false} autoPlay infiniteLoop interval={2000} showArrows={false} showStatus={false}>
        {heroImages.map(function (image) { return (<image_1.default src={image.imgUrl} alt={image.alt} width={484} height={484} className="object-contain" key={image.alt}/>); })}
      </react_responsive_carousel_1.Carousel>

      <image_1.default src="assets/icons/hand-drawn-arrow.svg" alt="arrow" width={175} height={175} className="max-xl:hidden absolute -left-[15%] bottom-0 z-0"/>
    </div>);
};
exports.default = HeroCarousel;
