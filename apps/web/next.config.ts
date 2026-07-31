import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  transpilePackages: ["@exsim/ui", "@exsim/schema", "@exsim/engine"],
};

export default config;
