import PostContent from "../../components/PostContent";
import Metatags from "../../components/Metatags";
import HeartButton from "../../components/HeartButton";
import AuthCheck from "../../components/AuthCheck";
import Link from "next/link";
import { getUserWithUsername, postToJSON, firestore } from "../../lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let post;
  let path;
  if (userDoc) {
    const postRef = userDoc.ref.collection("posts").doc(slug);
    post = postToJSON(await postRef.get());
    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  const snapshot = await firestore.collectionGroup("posts").get();

  const paths = snapshot.docs.map((doc) => {
    const { username, slug } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
}

export default function Post(props) {
  const postRef = firestore.doc(props.path);
  const [realtimePost] = useDocumentData(postRef);
  const post = realtimePost || props.post;

  return (
    <main>
      <Metatags title={post.title} description={post.title} />
      <section>
        <PostContent post={post} />
      </section>
      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} hearts </strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
}
