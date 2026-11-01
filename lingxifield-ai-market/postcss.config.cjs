// Isolate this plain-CSS demo from parent workspace Tailwind/PostCSS configs.
// Next.js resolves this config in the demo root instead of searching ancestors.
module.exports = {
  plugins: {
    autoprefixer: {},
  },
};
