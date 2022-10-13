import NavBar from "../../components/NavBar/NavBar";
import Head from "next/head";
import SectionCards from "../../components/Card/sectionCards";
import styles from "../../styles/MyList.module.css";
import { getMyList } from "../../lib/videos";
import useRedirectUser from "../../utils/redirectUser";

export async function getServerSideProps(context) {
  const { userId, token } = await useRedirectUser(context);
  if (!userId) {
    return {
      props: {},
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  const favoritedVideos = await getMyList(userId, token);

  return {
    props: {
      myListVideos: favoritedVideos,
    }, // will be passed to the page component as props
  };
}

const MyList = ({ myListVideos }) => {
  return (
    <div>
      <Head>
        <title>My list</title>
      </Head>
      <main className={styles.main}>
        <NavBar />
        <div className={styles.sectionWrapper}>
          <SectionCards
            title="My List"
            videos={myListVideos}
            size="small"
            shouldWrap
            shouldScale={false}
          />
        </div>
      </main>
    </div>
  );
};
export default MyList;
