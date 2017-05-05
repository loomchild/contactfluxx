module.exports = {
  env : 'development',
  url: process.env.VIRTUAL_HOST || "http://localhost:3000", //enter flux auth callback url here.
  port: 3000,
  flux: {
    url: 'https://flux.io',
    id: process.env.FLUX_ID || "e74b3cf0-58e4-49a8-b26a-cec2dd675f1a", //enter flux.id here
    secret: process.env.FLUX_SECRET || "7d945b8a-b4aa-4a89-ab5d-a99425f7c739", //enter flux.secret here
  },
  session: {
    secret: 'topSecret'
  },
  apiKey: process.env.FULLCONTACT_KEY || "e6ed1fb96b3e2d7c",
  fullContactLimit: process.env.FULLCONTACT_LIMIT || 60
}
