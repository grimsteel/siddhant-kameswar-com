declare module "@alpinejs/csp" {
  import Alpine from "alpinejs";
  export default Alpine;
}

declare module "*.json" {
  const contents: string;
  export default contents;
}
