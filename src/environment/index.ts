import { Environment } from "@pluginTypes/index";

const {
  REACT_APP_GOLDFISH_URL: GOLDFISH_URL = "",
  REACT_APP_FRACTAL_WEBSITE_URL: FRACTAL_WEBSITE_URL = "",
  REACT_APP_MAGURO_URL: MAGURO_URL = "",
  NODE_ENV: IS_DEV,
} = process.env;

const environment: Environment = {
  GOLDFISH_URL,
  FRACTAL_WEBSITE_URL,
  MAGURO_URL,
  IS_DEV: IS_DEV === undefined || IS_DEV === "development",
};

export default environment;
