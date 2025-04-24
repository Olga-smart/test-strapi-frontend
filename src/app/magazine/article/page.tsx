import Image from "next/image";
import Link from "next/link";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";
import { formatDate } from "@/lib/utils";
import styles from "./page.module.css";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type Article = {
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
  publishedDate: string;
  title: string;
  slug: string;
  description: string;
  author: {
    name: string;
    duty: string | null;
  };
};

const GET_ARTICLES = gql`
  query AllArticles($pagination: PaginationArg, $sort: [String]) {
    articles_connection(pagination: $pagination, sort: $sort) {
      nodes {
        cover {
          url
          alternativeText
        }
        tags {
          name
          slug
        }
        publishedDate
        title
        slug
        description
        author {
          name
          duty
        }
      }
      pageInfo {
        pageCount
      }
    }
  }
`;

export default async function Page(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;
  const currentPage =
    typeof params.page === "string" ? parseInt(params.page) : 1;
  const { data } = await client.query({
    query: GET_ARTICLES,
    variables: {
      pagination: {
        page: currentPage,
        pageSize: 6,
      },
      sort: "publishedDate:desc",
    },
  });
  const articles = data.articles_connection.nodes;

  const pages = [];
  for (let i = 1; i <= data.articles_connection.pageInfo.pageCount; i++) {
    pages.push(i);
  }

  return (
    <div className="container">
      <h1 className={styles.heading}>All materials</h1>
      {articles.map((article: Article) => (
        <div key={article.slug} className={styles.articleCard}>
          {typeof article.cover === "object" &&
            typeof article.cover.url === "string" && (
              <Image
                className={styles.articleImage}
                src={article.cover.url}
                alt={article.cover.alternativeText || ""}
                width="500"
                height="300"
              />
            )}
          <div className={styles.articleMeta}>
            <span className={styles.articleType}>Articles</span>
            {article.tags?.map(
              (tag) =>
                typeof tag === "object" && (
                  <Link
                    href={`/magazine/tags/${tag.slug}`}
                    key={tag.slug}
                    className={styles.articleTag}
                  >
                    #{tag.name}
                  </Link>
                )
            )}
            <span className={styles.articleDate}>
              {formatDate(new Date(article.publishedDate))}
            </span>
          </div>
          <h2 className={styles.articleTitle}>
            <Link href={`/magazine/article/${article.slug}`}>
              {article.title}
            </Link>
          </h2>
          <div className={styles.articleDescription}>{article.description}</div>
          {typeof article.author === "object" && (
            <div className={styles.articleAuthor}>{article.author.name}</div>
          )}
        </div>
      ))}
      {pages.length > 1 && (
        <div className={styles.pagination}>
          {pages.map((page) => (
            <a
              href={`?page=${page}`}
              key={page}
              className={`${styles.page} ${
                currentPage === page ? styles.currentPage : ""
              }`}
            >
              {page}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
