declare module '*.module.css';

declare module "*.png" {
    const value: string;
    export default value;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}
