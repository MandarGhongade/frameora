import { getProducts } from "@/lib/products";
import { HomeView } from "./HomeView";

// Built once (static site); HomeView then loads the live products in the browser.
export default async function Page() {
  return <HomeView initial={await getProducts()} />;
}
