import 'dotenv/config';

export default {
    "plugins": [
      "expo-font",
      "expo-router"
    ],
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

