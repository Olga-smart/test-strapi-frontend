import Link from "next/link";
import styles from "./component.module.css";

export type AdvertisingBlock = {
  __typename: "ComponentArticleBodyAdvertising";
  advertisingTitle: string;
  content: string;
  linkText: string;
  linkUrl: string;
};

export function Advertising(props: AdvertisingBlock) {
  return (
    <div className={styles.block}>
      <div className={styles.column}>
        <div className={styles.title}>{props.advertisingTitle}</div>
        <Link className={styles.link} href={props.linkUrl}>
          {props.linkText}
        </Link>
      </div>
      <div className={styles.column}>
        <div className={styles.content}>{props.content}</div>
      </div>
    </div>
  );
}
