/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: [
      "9jarocks.net",
      "lightdownload.xyz",
      "image.cnbcfm.com",
      "www.reuters.com",
      "www.thesun.co.uk",
      "kubrick.htvapps.com",
      "www.rollingstone.com",
      "thehill.com",
      "s.yimg.com",
      "media.cnn.com",
      "a57.foxnews.com",
      "nypost.com",
      "www.coindesk.com",
      "i0.wp.com",
      "images.wsj.net",
      "static0.gamerantimages.com",
      "static1.srcdn.com",
      "www.byte-read.xyz",
      "media.autoexpress.co.uk",
      "www.autoexpress.co.uk",
      "back.sermovie39.pw",
      "lightdl.xyz",
      "1.bp.blogspot.com",
      "localhost",
      "avamovie.shop",
      "aio-film.ir",
      "blogger.googleusercontent.com",
      "moviepovie.com",
      "m.media-amazon.com",
      "aiofilm3.ir",
      "aiofilm.com",
      "th.bing.com"
    ],
  },
};
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { punycode: false };
    return config;
  },
};
module.exports = nextConfig;
