import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@exsim/ui", "@exsim/schema"],
};

export default config;
