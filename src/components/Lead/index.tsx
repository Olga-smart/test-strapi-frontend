import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import styles from "./component.module.css";

export type LeadBlock = {
  __typename: "ComponentArticleBodyLead";
  leadText: BlocksContent;
};

export function Lead(props: LeadBlock) {
  return (
    <div className={styles.block}>
      <BlocksRenderer content={props.leadText} />
    </div>
  );
}
