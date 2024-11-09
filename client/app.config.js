import 'dotenv/config';

export default {
  expo: {
    name: "client",
    slug: "client",
    version: "1.0.0",
    extra: {
      BASE_URL: process.env.BASE_URL,
      SOCKET_URL: process.env.SOCKET_URL,
    },
  },
};
