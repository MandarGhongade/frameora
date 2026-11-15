import { getFrame } from "@/lib/data";
import type { CartItem } from "@/lib/store";
import { FramedPhoto, ratioOf } from "./FramedPhoto";

export function ItemThumb({ item, className = "w-24" }: { item: CartItem; className?: string }) {
  const f = getFrame(item.slug); // fallback for older cart items saved before products moved to the database
  const orientation = item.orientation ?? f?.orientation ?? "portrait";
  return (
    <div className={`bg-cream grid aspect-square shrink-0 place-items-center rounded-xl ${className}`}>
      <div style={{ width: orientation === "landscape" ? "78%" : "58%" }}>
        <FramedPhoto
          finish={item.finish}
          art={item.art ?? f?.art}
          photo={item.photo ?? item.image ?? f?.image}
          mat={item.mat ?? f?.mat}
          ratio={ratioOf(orientation)}
          frameWidth={item.finish === "acrylic" ? 2 : 5}
        />
      </div>
    </div>
  );
}
