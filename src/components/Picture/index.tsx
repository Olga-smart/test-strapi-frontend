import { clsx } from "clsx";
import Image from "next/image";
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import styles from "./component.module.css";

export type ImageBlock = {
  __typename: "ComponentArticleBodyImage";
  image: {
    url: string;
    alternativeText: string | null;
    width: number;
    height: number;
  };
  caption: BlocksContent;
  imageWidth: "content" | "screen";
  padding: boolean;
  stretch: boolean;
  backgroundColor: string | null;
};

export function Picture(props: ImageBlock) {
  return (
    <figure className={clsx(styles.block)}>
      <div
        className={clsx(
          styles.imageWrapper,
          props.padding && styles.imageWrapperWithPadding
        )}
        style={{ backgroundColor: props.backgroundColor || "" }}
      >
        <Image
          className={clsx(styles.image, props.stretch && styles.imageStretched)}
          src={props.image.url}
          alt={props.image.alternativeText || ""}
          width={props.image.width}
          height={props.image.height}
        />
      </div>
      {props.caption && (
        <div className={styles.caption}>
          <BlocksRenderer content={props.caption} />
        </div>
      )}
    </figure>
  );
}
