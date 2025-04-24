import { clsx } from "clsx";
import Image from "next/image";
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import styles from "./component.module.css";

export type QuoteBlock = {
  __typename: "ComponentArticleBodyQuote";
  quoteText: BlocksContent;
  authorName: BlocksContent;
  authorDuty: BlocksContent;
  quoteWidth: "content" | "screen";
  type: "small" | "medium" | "big" | "with photo";
  photo: {
    url: string;
    alternativeText: string | null;
  };
};

export function Quote(props: QuoteBlock) {
  return (
    <div
      className={clsx(
        styles.block,
        props.type === "small" && styles.block_type_small,
        props.type === "medium" && styles.block_type_medium,
        props.type === "big" && styles.block_type_big,
        props.type === "with photo" && styles.block_type_withPhoto
      )}
    >
      <div className={styles.container}>
        {props.type === "with photo" && props.photo?.url && (
          <div className={styles.photoWrapper}>
            <Image
              src={props.photo.url}
              alt={props.photo.alternativeText || ""}
              width={250}
              height={250}
              className={styles.photo}
            />
          </div>
        )}
        <div>
          <blockquote className={styles.text}>
            <BlocksRenderer content={props.quoteText} />
          </blockquote>
          <div className={styles.author}>
            <BlocksRenderer content={props.authorName} />
          </div>
          {props.authorDuty && (
            <div className={styles.duty}>
              <BlocksRenderer content={props.authorDuty} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
