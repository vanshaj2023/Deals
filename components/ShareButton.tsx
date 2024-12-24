"use client"

import Image from 'next/image';
import React from 'react';

const ShareButton: React.FC = () => {
    const handleShare = () => {
        const shareData = {
            title: 'Amazing Deals',
            text: 'Check out these amazing deals!',
            url: window.location.href,
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => console.log('Share successful'))
                .catch((error) => console.log('Share failed', error));
        } else {
            alert('Web Share is not supported in your browser.');
        }
    };

    return (
        <>
            <div className="p-2 bg-white-200 rounded-10 cursor-pointer">
                <Image
                    src="/assets/icons/share.svg"
                    alt="share"
                    onClick={handleShare}
                    width={20}
                    height={20}
                />
            </div>
        </>
    );
};

export default ShareButton;
