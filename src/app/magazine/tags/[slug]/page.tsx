import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";
import styles from "./page.module.css";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type Tag = {
  name: string;
  slug: string;
};

type Article = {
  cover: {
    url: string;
    alternativeText: string | null;
  };
  title: string;
  slug: string;
  author: {
    name: string;
    duty: string | null;
  };
  tags: [
    {
      name: string;
      slug: string;
    }
  ];
};

const GET_TAGS = gql`
  query AllTags($sort: [String], $pagination: PaginationArg) {
    tags_connection(sort: $sort, pagination: $pagination) {
      nodes {
        name
        slug
      }
    }
  }
`;

const GET_ARTICLES = gql`
  query ArticlesByTag(
    $filters: ArticleFiltersInput
    $pagination: PaginationArg
    $sort: [String]
  ) {
    articles_connection(
      filters: $filters
      pagination: $pagination
      sort: $sort
    ) {
      nodes {
        cover {
          url
          alternativeText
        }
        title
        slug
        author {
          name
          duty
        }
        tags {
          name
          slug
        }
      }
      pageInfo {
        pageCount
      }
    }
  }
`;

export default async function Page(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await props.params;
  const { page } = await props.searchParams;
  const currentPage = typeof page === "string" ? parseInt(page) : 1;

  const { data: tagsData } = await client.query({
    query: GET_TAGS,
    variables: {
      sort: "name",
      pagination: {
        limit: 1000,
      },
    },
  });

  const tags = tagsData.tags_connection.nodes;

  if (!tags.find((tag: Tag) => tag.slug === slug)) {
    notFound();
  }

  const { data: articlesData } = await client.query({
    query: GET_ARTICLES,
    variables: {
      filters: {
        tags: {
          slug: {
            eq: slug,
          },
        },
      },
      pagination: {
        page: currentPage,
        pageSize: 6,
      },
      sort: "publishedDate:desc",
    },
  });

  const articles = articlesData.articles_connection.nodes;

  const pages = [];
  for (
    let i = 1;
    i <= articlesData.articles_connection.pageInfo.pageCount;
    i++
  ) {
    pages.push(i);
  }

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>Sharing needed important</h1>
      <div className={styles.tags}>
        {tags.map((tag: Tag) => (
          <Link
            key={tag.slug}
            href={`/magazine/tags/${tag.slug}`}
            className={`${styles.tag} ${
              tag.slug === slug ? styles.currentTag : ""
            }`}
          >
            #{tag.name}
          </Link>
        ))}
      </div>
      <div className={styles.articles}>
        {articles.map((article: Article) => (
          <div key={article.slug} className={styles.articleCard}>
            {typeof article.cover === "object" &&
              typeof article.cover.url === "string" && (
                <Image
                  className={styles.articleImage}
                  src={article.cover.url}
                  alt={article.title}
                  width="400"
                  height="300"
                />
              )}
            <h2 className={styles.articleTitle}>
              <Link href={`/magazine/article/${article.slug}`}>
                {article.title}
              </Link>
            </h2>
            {typeof article.author === "object" && (
              <div className={styles.articleAuthor}>{article.author.name}</div>
            )}
            <div className={styles.articleMeta}>
              <span className={styles.articleType}>Articles</span>
              {article.tags?.map(
                (tag) =>
                  typeof tag !== "number" && (
                    <Link
                      href={`/magazine/tags/${tag.slug}`}
                      key={tag.slug}
                      className={styles.articleTag}
                    >
                      #{tag.name}
                    </Link>
                  )
              )}
            </div>
          </div>
        ))}
      </div>
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
