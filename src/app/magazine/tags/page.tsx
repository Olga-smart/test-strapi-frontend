import Link from "next/link";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";
import styles from "./page.module.css";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type Tag = {
  name: string;
  slug: string;
};

const GET_TAGS = gql`
  query Tags($pagination: PaginationArg, $sort: [String]) {
    tags_connection(pagination: $pagination, sort: $sort) {
      nodes {
        name
        slug
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
    query: GET_TAGS,
    variables: {
      pagination: {
        page: currentPage,
        pageSize: 10,
      },
      sort: "name",
    },
  });
  const tags = data.tags_connection.nodes;

  const pages = [];
  for (let i = 1; i <= data.tags_connection.pageInfo.pageCount; i++) {
    pages.push(i);
  }

  return (
    <div className="container">
      <h1 className={styles.heading}>All tags</h1>
      {tags.map((tag: Tag) => (
        <Link
          key={tag.slug}
          href={`/magazine/tags/${tag.slug}`}
          className={styles.tag}
        >
          #{tag.name}
        </Link>
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
