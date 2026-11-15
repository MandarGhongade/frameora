import type { ArtId, FinishId } from "@/lib/data";
import { Art } from "./Art";

type Props = {
  finish: FinishId;
  art?: ArtId;
  photo?: string | null;
  mat?: boolean;
  ratio?: number; // width / height
  frameWidth?: number;
  className?: string;
};

export function FramedPhoto({ finish, art = "hills", photo, mat = true, ratio = 3 / 4, frameWidth = 14, className = "" }: Props) {
  return (
    <div
      className={`frame finish-${finish} ${className}`}
      style={{ ["--frame-w" as string]: `${frameWidth}px`, aspectRatio: String(ratio) }}
    >
      <div className={`relative h-full w-full overflow-hidden ${mat ? "mat" : ""}`} style={{ padding: mat ? "9%" : 0 }}>
        <div className="relative h-full w-full overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Your photo" className="h-full w-full object-cover" />
          ) : (
            <Art id={art} />
          )}
        </div>
        {finish !== "acrylic" && <div className="glass-shine pointer-events-none absolute inset-0" />}
      </div>
      {finish === "acrylic" && <div className="glass-shine pointer-events-none absolute inset-0" />}
    </div>
  );
}

export const ratioOf = (o: "portrait" | "landscape" | "square", w?: number, h?: number) => {
  if (w && h) {
    const [a, b] = o === "landscape" ? [Math.max(w, h), Math.min(w, h)] : o === "square" ? [w, w] : [Math.min(w, h), Math.max(w, h)];
    return a / b;
  }
  return o === "landscape" ? 4 / 3 : o === "square" ? 1 : 3 / 4;
};
