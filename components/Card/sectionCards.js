import Link from "next/link";
import React from "react";
import Card from "./Card";
import styles from "./sectionCards.module.css";
import clsx from "classnames";

const SectionCards = (props) => {
  const { title, videos = [], size, shouldWrap = false, shouldScale } = props;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={clsx(styles.cardWrapper, shouldWrap && styles.wrap)}>
        {videos.map((video, idx) => {
          return (
            <Link key={video.id} href={`/video/${video.id}`}>
              <a>
                <Card
                  key={videos.id}
                  id={idx}
                  imgUrl={video.imgUrl}
                  size={size}
                  shouldScale
                />
              </a>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SectionCards;
