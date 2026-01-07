// src/components/ArticlesList.jsx
import React, { useMemo } from "react";
import trustedJson from "../data/trustedSources.json";
import articlesJson from "../data/articles.mock.json";
import { buildArticlesForUI } from "../utils/articles";
import ArticleCard from "./ArticleCard";

export default function ArticlesList() {
  const cards = useMemo(() => {
    return buildArticlesForUI(
      articlesJson.articles,
      trustedJson.trustedSources,
      4
    );
  }, []);

  return (
    <section className="articles-list">
      {cards.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </section>
  );
}
