import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clsx } from "clsx";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import { formatDate } from "@/lib/utils";
import styles from "./page.module.css";
import { SubscribePanel } from "@/components/SubscribePanel";
import { AdvertisementPanel } from "@/components/AdvertisementPanel";
import { Picture, ImageBlock } from "@/components/Picture";
import { Advertising, AdvertisingBlock } from "@/components/Advertising";
import { Quote, QuoteBlock } from "@/components/Quote";
import { Lead, LeadBlock } from "@/components/Lead";
import { Code, CodeBlock } from "@/components/Code";

type Params = Promise<{ slug: string }>;

type Article = {
  title: string;
  cover: {
    url: string;
    alternativeText: string | null;
  };
  coverColor: string;
  author: {
    name: string;
    duty: string | null;
  };
  publishedDate: string;
  readingTime: number;
  contentBlocks: Array<
    | TextBlock
    | LeadBlock
    | ImageBlock
    | AdvertisingBlock
    | QuoteBlock
    | CodeBlock
  >;
  tags: [
    {
      name: string;
      slug: string;
    }
  ];
  titleForRelatedArticlesSection: string | null;
  relatedArticles: RelatedArticle[] | [];
};

type RelatedArticle = {
  cover: {
    url: string;
    alternativeText: string | null;
  };
  tags: [
    {
      name: string;
      slug: string;
    }
  ];
  title: string;
  slug: string;
  author: {
    name: string;
    duty: string | null;
  };
};

type TextBlock = {
  __typename: "ComponentArticleBodyText";
  bodyText: BlocksContent;
};

const GET_ARTICLE = gql`
  query ArticleBySlug($filters: ArticleFiltersInput) {
    articles(filters: $filters) {
      title
      cover {
        url
        alternativeText
      }
      coverColor
      author {
        name
        duty
      }
      publishedDate
      readingTime
      contentBlocks {
        __typename
        ... on ComponentArticleBodyQuote {
          quoteWidth: width
          type
          photo {
            url
            alternativeText
          }
          quoteText: text
          authorName
          authorDuty
        }
        ... on ComponentArticleBodyLead {
          leadText: text
        }
        ... on ComponentArticleBodyImage {
          image {
            url
            alternativeText
            width
            height
          }
          caption
          imageWidth: width
          padding
          stretch
          backgroundColor
        }
        ... on ComponentArticleBodyCode {
          code
        }
        ... on ComponentArticleBodyAdvertising {
          advertisingTitle: title
          content
          linkText
          linkUrl
        }
        ... on ComponentArticleBodyText {
          bodyText: text
        }
      }
      tags {
        name
        slug
      }
      titleForRelatedArticlesSection
      relatedArticles {
        cover {
          url
          alternativeText
        }
        tags {
          name
          slug
        }
        title
        slug
        author {
          duty
          name
        }
      }
    }
  }
`;

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;

  const { data } = await client.query({
    query: GET_ARTICLE,
    variables: {
      filters: {
        slug: {
          eq: slug,
        },
      },
    },
  });

  const article: Article = data.articles[0];

  if (!article) {
    notFound();
  }

  return (
    <>
      <div className="container">
        <h1 className={styles.pageTitle}>{article.title}</h1>
      </div>
      <div
        className={styles.cover}
        style={{ backgroundColor: article.coverColor }}
      >
        <div className={styles.coverImageWrapper}>
          {typeof article.cover === "object" &&
            typeof article.cover.url === "string" && (
              <Image
                className={styles.coverImage}
                src={article.cover.url}
                alt={article.title}
                width={1200}
                height={700}
              />
            )}
          <div
            className={styles.coverLeftGradient}
            style={{ backgroundColor: article.coverColor }}
          ></div>
          <div
            className={styles.coverRightGradient}
            style={{ backgroundColor: article.coverColor }}
          ></div>
        </div>
      </div>
      <div className="container">
        <div className={styles.articleContainer}>
          <div className={styles.metaHeader}>
            {typeof article.author === "object" && (
              <div className={styles.author}>
                <span className={styles.authorName}>{article.author.name}</span>
                <span className={styles.authorDuty}>{article.author.duty}</span>
              </div>
            )}
            <span className={styles.publishedDate}>
              {formatDate(new Date(article.publishedDate))}
            </span>
            <span className={styles.readingTime}>
              Read for {article.readingTime} minutes
            </span>
          </div>
        </div>
      </div>
      <div className={clsx("container", styles.articleBodyAndSidebarWrapper)}>
        <div className={styles.sidebar}>
          <SubscribePanel />
          <AdvertisementPanel />
        </div>
        <div className={styles.articleBody}>
          {article.contentBlocks.map((block, index) => {
            switch (block.__typename) {
              case "ComponentArticleBodyLead":
                return (
                  <div key={index} className={styles.articleContainer}>
                    <div>
                      <Lead {...block} />
                    </div>
                  </div>
                );
              case "ComponentArticleBodyText":
                return (
                  <div key={index} className={styles.articleContainer}>
                    <div>
                      <BlocksRenderer content={block.bodyText} />
                    </div>
                  </div>
                );
              case "ComponentArticleBodyImage": {
                const isFullWidthBlock = block.imageWidth === "screen";
                return (
                  <div
                    key={index}
                    className={clsx(
                      !isFullWidthBlock && styles.articleContainer,
                      isFullWidthBlock && "js-fullWidthSection"
                    )}
                  >
                    <Picture {...block} />
                  </div>
                );
              }
              case "ComponentArticleBodyAdvertising":
                return (
                  <div key={index} className="js-fullWidthSection">
                    <Advertising {...block} />
                  </div>
                );
              case "ComponentArticleBodyQuote": {
                const isFullWidthBlock = block.quoteWidth === "screen";
                return (
                  <div
                    key={index}
                    className={clsx(
                      !isFullWidthBlock && styles.articleContainer,
                      isFullWidthBlock && "js-fullWidthSection"
                    )}
                  >
                    <Quote {...block} />
                  </div>
                );
              }
              case "ComponentArticleBodyCode":
                return (
                  <div key={index} className="js-fullWidthSection">
                    <div>
                      <Code {...block} />
                    </div>
                  </div>
                );
            }
          })}
        </div>
      </div>
      <div className="container">
        <div className={styles.articleContainer}>
          <div className={styles.metaFooter}>
            {typeof article.author === "object" && (
              <div className={styles.author}>
                <span className={styles.authorName}>{article.author.name}</span>
                <span className={styles.authorDuty}>{article.author.duty}</span>
              </div>
            )}
            <span className={styles.publishedDate}>
              {formatDate(new Date(article.publishedDate))}
            </span>
            <span className={styles.tags}>
              {article.tags?.map(
                (tag) =>
                  typeof tag !== "number" && (
                    <Link
                      href={`/magazine/tags/${tag.slug}`}
                      key={tag.slug}
                      className={styles.tag}
                    >
                      #{tag.name}
                    </Link>
                  )
              )}
            </span>
          </div>
        </div>
      </div>
      {article.relatedArticles?.length > 0 && (
        <div className="container">
          <h2 className={styles.sectionHeading}>
            {article.titleForRelatedArticlesSection ||
              "More interesting articles"}
          </h2>
          <div className={styles.relatedArticles}>
            {article.relatedArticles.map((article) => (
              <div key={article.slug} className={styles.articleCard}>
                {
                  <Image
                    className={styles.articleCardCover}
                    src={article.cover.url}
                    alt=""
                    width="290"
                    height="200"
                  />
                }
                {article.tags.length > 0 && (
                  <div className={styles.articleCardMeta}>
                    <span>Articles</span>
                    {article.tags?.map(
                      (tag) =>
                        typeof tag !== "number" && (
                          <Link
                            href={`/magazine/tags/${tag.slug}`}
                            key={tag.slug}
                            className={styles.articleCardTag}
                          >
                            #{tag.name}
                          </Link>
                        )
                    )}
                  </div>
                )}
                <h3 className={styles.articleCardTitle}>
                  <Link href={`/magazine/article/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
                {
                  <div className={styles.articleCardAuthor}>
                    {article.author.name}
                  </div>
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
