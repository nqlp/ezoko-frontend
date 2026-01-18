import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        ezoko: {
          mint: "#8ab9a6",
          pine: "#4c6b62",
          ink: "#252323",
          rust: "#da7e57",
          paper: "#f6f3f2",
        }
      },
    },
  },
};
export default config;