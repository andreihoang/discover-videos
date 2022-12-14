import { useRouter } from "next/router";
import Modal from "react-modal";
import styles from "../../styles/Video.module.css";
import clsx from "classnames";
import { getYoutubeVideoById } from "../../lib/videos";
import DisLike from "../../components/icons/dislike-icon";
import Like from "../../components/icons/like-icon";
import NavBar from "../../components/NavBar/NavBar";
import { useEffect, useState } from "react";

Modal.setAppElement("#__next");

export async function getStaticProps(context) {
  const videoId = context.params.video;
  const videoArray = await getYoutubeVideoById(videoId);

  return {
    props: {
      video: videoArray.length > 0 ? videoArray[0] : {},
    },
    revalidate: 10,
  };
}

export async function getStaticPaths() {
  const listOfVideos = ["mYfJxlgR2jw", "4zH5iYM4wJo", "KCPEHsAViiQ"];
  const paths = listOfVideos.map((video) => ({
    params: { video },
  }));

  return {
    paths: paths,
    fallback: "blocking", // can also be true or 'blocking'
  };
}

const Video = ({ video }) => {
  const router = useRouter();
  const videoId = router.query.video;
  const [toggleLike, setToggleLike] = useState(false);
  const [toggleDislike, setToggleDislike] = useState(false);

  const {
    title,
    publishTime,
    description,
    channelTitle,
    statistics: { viewCount } = { viewCount: 0 },
  } = video;

  useEffect(() => {
    const handleLikeDislikeService = async () => {
      const response = await fetch(`/api/stats?videoId=${videoId}`, {
        method: "GET",
      });
      const data = await response.json();
      if (data.length > 0) {
        const favourited = data[0].favorited;
        if (favourited === 1) {
          setToggleLike(true);
        } else if (favourited === 0) {
          setToggleDislike(true);
        }
      }
    };
    handleLikeDislikeService();
  }, [videoId]);

  const runRatingService = async (favorited) => {
    return await fetch("/api/stats", {
      method: "POST",
      body: JSON.stringify({
        videoId,
        favorited,
      }),
      headers: {
        "Content-type": "application/json",
      },
    });
  };

  const handleToggleDisLike = async () => {
    const val = !toggleDislike;
    setToggleDislike(val);
    setToggleLike(toggleDislike);
    const favorited = val ? 0 : 1;
    const response = await runRatingService(favorited);
  };
  const handleToggleLike = async () => {
    const val = !toggleLike;
    setToggleLike(val);
    setToggleDislike(toggleLike);
    const favorited = val ? 1 : 0;
    const response = await runRatingService(favorited);
  };

  return (
    <div className={styles.container}>
      <NavBar />
      <Modal
        isOpen={true}
        contentLabel="Watch the video"
        onRequestClose={() => router.back()}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <iframe
          id="ytplayer"
          className={styles.videoPlayer}
          type="text/html"
          width="100%"
          height="360"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&origin=http://example.com&controls=0&rel=1`}
          frameBorder="0"
        ></iframe>
        <div className={styles.likeDislikeBtnWrapper}>
          <div className={styles.likeBtnWrapper}>
            <div className={styles.btnWrapper}>
              <button onClick={handleToggleLike}>
                <Like selected={toggleLike} />
              </button>
            </div>
          </div>
          <div className={styles.btnWrapper}>
            <button onClick={handleToggleDisLike}>
              <DisLike selected={toggleDislike} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalBodyContent}>
            <div className={styles.col1}>
              <p className={styles.publishTime}>{publishTime}</p>
              <p className={styles.title}>{title}</p>
              <p className={styles.description}>{description}</p>
            </div>
            <div className={styles.col2}>
              <p className={clsx(styles.subText, styles.subTextWrapper)}>
                <span className={styles.textColor}>Cast: </span>
                <span className={styles.channelTitle}>{channelTitle}</span>
              </p>
              <p className={clsx(styles.subText, styles.subTextWrapper)}>
                <span className={styles.textColor}>View Count: </span>
                <span className={styles.channelTitle}>{viewCount}</span>
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Video;
